import React from "react";
import Particle from "../Particle";
import { Container, Row, Col } from "react-bootstrap";

function WordScramblingPage() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          <strong className="purple">Word Scrambling Game </strong>
        </h1>
        <p className="project-subheading">
          A challenging multi-threaded game coded in Rust, combining a digital clock with word unscrambling puzzles.
        </p>

        <Row className="video-section" style={{ justifyContent: "center", marginTop: "30px" }}>
          <Col md={8}>
            <div className="video-border">
              <div className="embed-responsive embed-responsive-16by9">
                <iframe
                  className="embed-responsive-item"
                  src="https://www.youtube.com/embed/iMdib4b9BtU?si=Rbql1GAROWk28TiF"
                  title="Word Scrambling Game Demo"
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
              This Word Scrambling Game is an exciting project that combines a digital clock with a challenging word unscrambling game. Developed entirely in Rust, it showcases the power of multi-threading to create an engaging and time-pressured gaming experience.
            </p>
            <p className="project-body">
              <strong>Game Overview:</strong><br />
              Players have 60 seconds to complete all three levels of the game. The digital clock, integrated from an online tutorial, provides a real-time countdown, adding urgency to the gameplay. The game leverages Rust's multi-threading capabilities to run the clock and game logic concurrently.
            </p>
            <p className="project-body">
              <strong>Gameplay:</strong><br />
              The game is divided into three distinct levels, each with a unique theme:
              <ul>
                <li><strong>Level 1: Fruits</strong> - Players unscramble words related to various fruits.</li>
                <li><strong>Level 2: Utensils</strong> - The challenge increases with words about kitchen utensils.</li>
                <li><strong>Level 3: Biomes</strong> - The final level tests players' knowledge of different biomes.</li>
              </ul>
              Players have the option to skip particularly challenging words, adding a strategic element to the game.
            </p>
            <p className="project-body">
              <strong>Technical Aspects:</strong><br />
              - <strong>Language:</strong> Coded entirely in Rust<br />
              - <strong>Multi-threading:</strong> Utilizes Rust's thread management for running the clock and game simultaneously<br />
              - <strong>Word Banks:</strong> Separate collections of scrambled words for each level theme
            </p>
            
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default WordScramblingPage;