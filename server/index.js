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
    app.post('/upload', async (req, res) => {
        if (!req.files) {
            return res.status(500).send({ msg: "file is not found" })
        }
        const myFile = req.files.file;
        myFile.mv(`${__dirname}/subjects/${myFile.name}`);
        shelljs.exec(`recon-all -s 2014 -i ${__dirname}/subjects/${myFile.name} -autorecon1 -hemi lh -threads 6 -notify ${__dirname}/subjects/file.txt`, { silent: true, async: true })

        res.send("sent")
        await sleep(5000)

        fs.watch(`${__dirname}/subjects/2014/scripts/recon-all-status.log`, (eventType, filename) => {
            if (filename) {
                let fileContents = fs.readFileSync(`${__dirname}/subjects/2014/scripts/recon-all-status.log`, 'utf8')
                ws.send(fileContents)

            }
            else {
                console.log('mistake')
            }
        });
    })

})

app.use("/docs/", express.static(path.join(__dirname, "/docs", "/build/html")));


app.listen(PORT, () => console.log(`Serving on port: ${PORT}`));