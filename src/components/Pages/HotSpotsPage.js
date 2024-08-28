import React from "react";
import Particle from "../Particle";
import { Container, Row, Col } from "react-bootstrap";

function HotSpotsPage() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          <strong className="purple">HotSpots </strong>
        </h1>
        <p className="project-subheading">
        Your Virtual Guide to Smart Site Selection
        </p>

        <Row className="video-section" style={{ justifyContent: "center", marginTop: "30px" }}>
          <Col md={8}>
            <div className="video-border">
              <div className="embed-responsive embed-responsive-16by9">
                <iframe
                  className="embed-responsive-item"
                  src="https://www.youtube.com/embed/MbW1ZVWmA-A?si=ANZI1PYAXpUsVb31"
                  title="Perfect Fit Demo"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </Col>
        </Row>

        <Row style={{ marginTop: "50px" }}>
          <Col>
            <h2 className="project-body-heading">
              <strong className="purple">Project Details</strong>
            </h2>
            <p className="project-body">
            During the INRIX Hackathon, my team was presented with the exciting challenge of creating a product using the INRIX APIs. Given the rich data available through the drive time polygons and foot traffic APIs, we decided to develop HotSpots, a location intelligence platform aimed at helping businesses evaluate potential sites. The idea was to create a tool that could provide businesses with virtual tours of locations and analyze key factors like accessibility and foot traffic, making site selection smarter and more efficient.
            </p>
            <p className="project-body">
            I took charge of the frontend development, where my main tasks included integrating the Google Maps API to enable virtual tours and designing a user-friendly sidebar that would allow users to interact with the map and access detailed information about each location. Working on this project was a deep dive into the intersection of data visualization and user experience, and it pushed me to hone my skills in React and Deck.gl.
            </p>
            <p className="project-body">
            As we progressed, it became clear that our project was coming together in a powerful way. The team collaborated closely, combining our skills to create a functional and visually appealing platform that met the hackathon's objectives. When the hackathon concluded, we were thrilled to learn that our hard work had been recognized—we placed 5th and earned an honorable mention. This achievement was especially rewarding because it validated our approach to solving a real-world problem, and it was a testament to our teamwork and dedication throughout the hackathon.
            </p>
            
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default HotSpotsPage;