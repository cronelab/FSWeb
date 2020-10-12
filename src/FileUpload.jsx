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
  const [file, setFile] = useState(); // storing the uploaded file    // storing the recived file from backend
  const [incomingMessages, setIncomingMessages] = useState([]);
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
    if (file) {
      let formData = new FormData();
      formData.append("file", file);
      fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      }).then((res) => {
        console.log(res);
      });
      setIncomingMessages(["Starting reconstruction..."]);
    }
  }, [file]);

  return (
    <Container fluid>
      <Row style={{marginTop: "20px"}}>
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
            />
          </InputGroup>
          <InputGroup size="sm" className="mb-1">
            <InputGroup.Prepend>
              <InputGroup.Text>Patient name</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
            />
          </InputGroup>
          <Row>
            <Col>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  Workflow directives
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item>all</Dropdown.Item>
                  <Dropdown.Item>autorecon1</Dropdown.Item>
                  <Dropdown.Item>autorecon2</Dropdown.Item>
                  <Dropdown.Item>autorecon3</Dropdown.Item>
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
            <Form.Control       placeholder="Hippocampus/Amygdala"
aria-label="Hippocampus/Amygdala" />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Prepend>
              <InputGroup.Checkbox aria-label="Checkbox for following text input" />
            </InputGroup.Prepend>
            <Form.Control       placeholder="Brainstem"
aria-label="Brainstem" />
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
    </Container>
  );
}
export default FileUpload;
