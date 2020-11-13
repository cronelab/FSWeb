import path from "path";
import express from 'express';
import fileUpload from 'express-fileupload'
import shelljs from 'shelljs'
import fs from 'fs'
import ws from 'express-ws'
import config from "../webpack.config.js";
import webpackDevMiddleware from "webpack-dev-middleware";
import WebpackHotMiddleware from 'webpack-hot-middleware'
import webpack from 'webpack'

const app = express();
let expressWS = ws(app);
let __dirname = path.resolve(path.dirname(""));
let subjectDir = process.env.SUBJECTS_DIR
let sourceDir = process.env.SOURCE_DATA || "/data/sourcedata"
const compiler = webpack(config);

const PORT = process.env.PORT || 5000;
app.use(webpackDevMiddleware(compiler, {
    noInfo: true, publicPath: config.output.publicPath

}))
app.use(WebpackHotMiddleware(compiler))
app.use(fileUpload());

app.use(express.static(path.resolve(__dirname, "dist")));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

app.ws('/status', (ws, req) => {
    app.post('/upload',  (req, res) => {
        if (!req.files) {
            return res.status(500).send({ msg: "file is not found" })
        }
        const myFile = req.files.file;
        console.log();
        myFile.mv(`${sourceDir}/${req.body.subjName}_${myFile.name}`).then(async (x) => {
            shelljs.exec(`gunzip ${sourceDir}/${req.body.subjName}_${myFile.name}`);
            let file = myFile.name.replace('.gz', '');
            console.log(file)
            shelljs.exec(`recon-all -s ${req.body.subjName} -i ${sourceDir}/${req.body.subjName}_${file} -${req.body.workflow} -threads ${req.body.nproc} -notify ${subjectDir}/${req.body.subjName}_notify.txt`, { silent: true, async: true })
            res.send("sent")
            await sleep(5000)

            fs.watch(`${subjectDir}/${req.body.subjName}/scripts/recon-all-status.log`, (eventType, filename) => {
                if (filename) {
                    let fileContents = fs.readFileSync(`${subjectDir}/${req.body.subjName}/scripts/recon-all-status.log`, 'utf8')
                    console.log(fileContents)
                    ws.send(fileContents)
                }
                else {
                    console.log('mistake')
                }
            });
        })
    })
})

app.get('/nproc', (req, res) => {
    let threads = shelljs.exec(`nproc`)
    res.send(threads.trim())
})

app.use("/docs/", express.static(path.join(__dirname, "/docs", "/build/html")));


app.listen(PORT, () => console.log(`Serving on port: ${PORT}`));