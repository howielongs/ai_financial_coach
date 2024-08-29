import React from "react";
import Particle from "../Particle";
import { Container, Row, Col } from "react-bootstrap";

function FitFinderPage() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          <strong className="purple">Perfect Fit </strong>
        </h1>
        <p className="project-subheading">
        Fit Finder is a key component of Perfect Fit that allows users to swipe through clothing suggestions, with the AI learning and improving recommendations based on individual preferences
        </p>

        <Row className="video-section" style={{ justifyContent: "center", marginTop: "30px" }}>
          <Col md={8}>
            <div className="video-border">
              <div className="embed-responsive embed-responsive-16by9">
                <iframe
                  className="embed-responsive-item"
                  src="https://www.youtube.com/embed/woKysMjlTPM"
                  title="Fit Finder Demo"
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
            Fit Finder was created as a key feature of Perfect Fit to address a common problem many people face: the uncertainty of online shopping. When you're browsing for new clothes online, it's often hard to know if a piece will actually work with the rest of your wardrobe. This uncertainty can lead to frustration and even buyer's remorse when items don't fit as expected or don't match your style. Fit Finder solves this problem by allowing users to virtually try out clothing items before making a purchase.
            </p>
            <p className="project-body">
            The purpose of Fit Finder is to let users swipe through clothing suggestions, just like on Tinder, and when they find a piece they like, they can upload it to their virtual wardrobe. From there, they can mix and match it with their existing clothes to see if it's a perfect fit. This feature gives users confidence in their online shopping decisions, as they can visualize how new pieces will integrate with what they already own, reducing the guesswork and increasing satisfaction with their purchases.
            </p>
            <p className="project-body">
            For the tech stack, I chose React for the frontend because of its dynamic and responsive nature, which is essential for creating a smooth and interactive user experience. React's component-based structure also made it easier to build reusable UI elements, such as the swiping interface and wardrobe management features. Node.js was selected for the backend to handle the real-time data processing required for managing user interactions and clothing suggestions efficiently. Its non-blocking, event-driven architecture ensures that the application remains responsive even as it scales.
            </p>
            <p className="project-body">
            Firebase was integrated for real-time data synchronization, allowing users to instantly see updates to their virtual wardrobe and clothing suggestions. This ensures that the user experience is seamless and that the data is always up-to-date, which is crucial for providing accurate outfit recommendations.
            </p>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default FitFinderPage;