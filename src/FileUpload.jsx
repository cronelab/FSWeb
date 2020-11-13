import React, { useRef, useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
function FileUpload() {
  const [file, setFile] = useState();
  const [workflow,setWorkflow]=useState("")
  const [subjName, setSubjName] = useState("")
  const [numThreads, setNumThreads] = useState(0);
  const [incomingMessages, setIncomingMessages] = useState([]);
  let webSocket = new WebSocket(`ws://localhost:${process.env.PORT}/status`);

  useEffect(() => {
    (async () => {
      let req = await fetch("/nproc");
      let threads = await req.text();
      setNumThreads(threads);
    })();
  }, []);

  webSocket.onmessage = (e) => {
    console.log(e.data);
    if (e.data.length > 0) {
      let newLineData = e.data.split("\n");
      let splitData = newLineData.map((data, index) => {
        if (index == 0) return;
        else if (index == 1) {
          return `Processing started: ${data}`;
        } else if (data.startsWith("recon-all")) {
          return "Completed without error";
        } else {
          let spacedData = data.split(" ");
          spacedData.pop();
          spacedData.pop();
          spacedData.pop();
          spacedData.pop();
          spacedData.pop();
          spacedData.pop();
          spacedData.shift();
          return spacedData.join(" ");
        }
      });
      console.log(splitData);
      setIncomingMessages(splitData);
    }
  };

  return (
    <Container fluid>
      <Row style={{ marginTop: "20px" }}>
        <Col>
          <Form>
            <Form.Group>
              <Form.File
                id="custom-file"
                label="Upload the T1.nii"
                custom
                onChange={(e) => {
                  console.log(e.target.files[0]);
                  setFile(e.target.files[0]);
                }}
              />
            </Form.Group>
          </Form>
          <InputGroup size="sm" className="mb-1">
            <InputGroup.Prepend>
              <InputGroup.Text id="inputGroup-sizing-sm">
                # threads
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              onChange={(e)=>setNumThreads(e.target.value)}
              placeHolder={numThreads}
            />
          </InputGroup>
          <InputGroup size="sm" className="mb-1">
            <InputGroup.Prepend>
              <InputGroup.Text>Subject name</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              onChange={(e) => setSubjName(e.target.value)}
              value={subjName}
            />
          </InputGroup>
          <Row>
            <Col>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  Workflow directives
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={()=> setWorkflow("all")}>all</Dropdown.Item>
                  <Dropdown.Item onClick={()=> setWorkflow("autorecon1")}>autorecon1</Dropdown.Item>
                  <Dropdown.Item onClick={()=> setWorkflow("autorecon2")}>autorecon2</Dropdown.Item>
                  <Dropdown.Item onClick={()=> setWorkflow("autorecon3")}>autorecon3</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col>
              <ToggleButtonGroup type="checkbox" className="mb-2">
                <ToggleButton value={1}>Left</ToggleButton>
                <ToggleButton value={2}>Both</ToggleButton>
                <ToggleButton value={3}>Right</ToggleButton>
              </ToggleButtonGroup>
            </Col>
          </Row>
          <InputGroup className="mb-3">
            <InputGroup.Prepend>
              <InputGroup.Checkbox aria-label="Checkbox for following text input" />
            </InputGroup.Prepend>
            <Form.Control
              placeholder="Hippocampus/Amygdala"
              aria-label="Hippocampus/Amygdala"
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Prepend>
              <InputGroup.Checkbox aria-label="Checkbox for following text input" />
            </InputGroup.Prepend>
            <Form.Control placeholder="Brainstem" aria-label="Brainstem" />
          </InputGroup>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>FSWeb</Card.Title>
              {incomingMessages.map((msg) => {
                return <Card.Text>{msg}</Card.Text>;
              })}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Button
        onClick={() => {
          if (file) {
            let formData = new FormData();
            formData.append("file", file);
            formData.append("subjName", subjName)
            formData.append("workflow",workflow)
            formData.append("nproc", numThreads)
            fetch(`http://localhost:${process.env.PORT}/upload`, {
              method: "POST",
              body: formData,
            }).then((res) => {
              console.log(res);
            });
            setIncomingMessages(["Starting reconstruction..."]);
          }
        }}
      >
        Begin
      </Button>
    </Container>
  );
}
export default FileUpload;
