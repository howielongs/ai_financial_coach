import React from "react";
import Particle from "../Particle";
import { Container, Row, Col } from "react-bootstrap";

function PerfectFitPage() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          <strong className="purple">Perfect Fit </strong>
        </h1>
        <p className="project-subheading">
          Perfect Fit is a virtual wardrobe platform built with React, Node.js, and AI technology to help users create personalized outfits.
        </p>

        <Row className="video-section" style={{ justifyContent: "center", marginTop: "30px" }}>
          <Col md={8}>
            <div className="video-border">
              <div className="embed-responsive embed-responsive-16by9">
                <iframe
                  className="embed-responsive-item"
                  src="https://www.youtube.com/embed/zl1kipBwRlE"
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
              Perfect Fit started as a solution to a personal problem I faced when I didn't know what to wear for spring break. I found myself struggling to mix and match outfits from my wardrobe and realized that there had to be a better way to make those decisions. This experience sparked the idea for Perfect Fit, a virtual wardrobe platform that could help users create personalized outfits by analyzing their clothing and suggesting combinations that suit their style.
            </p>
            <p className="project-body">
              As I developed the idea further, I realized the potential for it to become something much bigger than just a personal tool. I started working on the project, building out the core components like the Fit Finder feature, which allows users to swipe through clothing suggestions and upload new items to their virtual wardrobe. This feature helps alleviate the uncertainty of online shopping by letting users see how new pieces would fit with their existing wardrobe.
            </p>
            <p className="project-body">
              With the concept taking shape, I decided to pitch Perfect Fit to the Bronco Ventures Accelerator (BVA) program at Santa Clara University. BVA is a highly selective program that supports student entrepreneurs by providing resources, mentorship, and funding opportunities to help them develop and scale their startups. Getting accepted into BVA was a significant milestone, as it provided me with the guidance and support needed to take Perfect Fit to the next level.
            </p>
            <p className="project-body">
              For the tech stack, I chose React for the frontend because of its flexibility and component-based architecture, which made it ideal for building the interactive user interface of Perfect Fit. Node.js was selected for the backend due to its scalability and efficiency in handling asynchronous operations, crucial for managing real-time data and user interactions. Firebase was integrated for real-time data management, allowing seamless synchronization of wardrobe updates and outfit suggestions.
            </p>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default PerfectFitPage;