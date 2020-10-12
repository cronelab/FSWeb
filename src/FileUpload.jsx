import React, { useRef, useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
function FileUpload() {
  const [file, setFile] = useState(""); // storing the uploaded file    // storing the recived file from backend
  const [incomingMessages, setIncomingMessages] = useState([]);
  let onlyRunOnce = true;
  let webSocket = new WebSocket("ws://localhost:5000/status");

  webSocket.onmessage = (e) => {
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

  useEffect(() => {
    if(onlyRunOnce){
      fetch("http://localhost:5000/upload", {
        method: "POST",
        body: file,
      }).then((res) => {
        console.log(res);
      });
      setIncomingMessages(["Starting reconstruction..."]);
      onlyRunOnce=false
    }
   
  }, [file]);

  return (
    <Container fluid>
      <Row>
        <Col>
          <Form>
            <Form.File
              id="custom-file"
              label="Custom file input"
              custom
              onChange={(e) => {
                console.log(e.target.files[0]);
                setFile(e.target.files[0]);
              }}
            />
          </Form>
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
    </Container>
  );
}
export default FileUpload;
