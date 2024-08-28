import React from "react";
import Particle from "../Particle";
import { Container, Row, Col } from "react-bootstrap";

function SafeBroncPage() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          <strong className="purple">SafeBronc </strong>
        </h1>
        <p className="project-subheading">
        An Event Safety Application
        </p>

        <Row className="video-section" style={{ justifyContent: "center", marginTop: "30px" }}>
          <Col md={8}>
            <div className="video-border">
              <div className="embed-responsive embed-responsive-16by9">
                <iframe
                  className="embed-responsive-item"
                  src="https://www.youtube.com/embed/uBxqwRmrrDs?si=8wza26b4Akqxzmo5"
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
            During my freshman year, I participated in the Hack4Humanity Hackathon, where our team developed SafeBronc and placed 4th in the competition. The goal of the hackathon was to build something for social good, and we were inspired to create an app that could enhance event safety on and around our Santa Clara University campus by providing tools for organizers and attendees to ensure a safer environment.
            </p>
            <p className="project-body">
            SafeBronc is a mobile app that allows hosts to create events and track attendees using a QR code system. If someone feels uncomfortable at an event, they can use a panic button that immediately notifies organizers and campus leaders via Twilio. The app also includes an authenticated Google login (in progress) to ensure that users are verified SCU community members, and it provides a list of resources for support during emergencies.
            </p>
            <p className="project-body">
            I focused on designing the user interface using React Native, while our team used Node.js for backend development. We encountered challenges connecting the frontend with our backend but found DigitalOcean to be an ideal solution for hosting our database. Additionally, we worked on implementing the Geolocation API to track event and user locations, a feature that is still under development.
            </p>
            <p className="project-body">
            We were proud of the user-friendly application we built, believing it could significantly enhance event safety on campus. Through this project, we gained experience with new technologies like React Native and learned valuable lessons in setting up databases and integrating APIs. 
            </p>
            
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default SafeBroncPage;