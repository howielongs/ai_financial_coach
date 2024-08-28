import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import leaf from "../../Assets/Projects/leaf.png";
import emotion from "../../Assets/Projects/emotion.png";
import editor from "../../Assets/Projects/codeEditor.png";
import perfectFit from "../../Assets/Projects/perfectlogo.png";
import suicide from "../../Assets/Projects/suicide.png";
import fitFinder from "../../Assets/Projects/fitfinder.png";
import hotSpots from "../../Assets/Projects/hotspots.png"

function Projects() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Projects </strong>
        </h1>
        <p style={{ color: "white" }}>
          Here's what I've been working on recently.
        </p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={perfectFit}
              title="Perfect Fit"
              description="Perfect Fit is a virtual wardrobe platform built with React, Node.js, and Firebase for real-time data management. Perfect Fit helps users create personalized outfits by analyzing their clothing items and suggesting combinations that match their style."
              learnMoreLink="/perfect-fit"
              demoLink="https://www.youtube.com/watch?v=zl1kipBwRlE"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={fitFinder}
              title="Fit Finder"
              description="Fit Finder is a key feature of Perfect Fit as it introduces a swiping mechanism, similar to what you might find on popular dating apps.
              If you like the suggested clothing item, swipe right to save it to your wardrobe.
              If it's not quite your style, swipe left to move on to the next suggestion."
              learnMoreLink="/fit-finder"
              demoLink="https://www.youtube.com/shorts/woKysMjlTPM"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={hotSpots}
              title="HotSpots"
              description="HotSpot is a location intelligence platform that helps businesses evaluate potential sites by offering virtual tours through Google Maps' street view. Built with Node.js on the backend, it uses Google Maps' API for location data and React with Deck.gl on the frontend to visualize areas. The platform also integrates real-time real estate data via Datafiniti and models accessibility using the INRIX Drive Time Polygon API"
              learnMoreLink="/hotspots"
              demoLink="https://devpost.com/software/hotspots-xs6inz"
            />
          </Col>

          {/* Add more ProjectCards here */}
        </Row>
      </Container>
    </Container>
  );
}

export default Projects;