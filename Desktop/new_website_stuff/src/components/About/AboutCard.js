import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";
import { TbPoint } from "react-icons/tb";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hey everyone, my name is <span className="purple">Luo Long </span>
            and I'm from <span className="purple"> Wilton, CT.</span>
            <br />
            I'm currently a senior studying <span className="purple"> Computer Science</span> at <span className="purple"> Santa Clara University</span>
            <br />
            I have interned as a Software Developer and Quality Assurance Intern at Undercurrent.ai and am running my own startup called <span className="purple">
  <a 
    href="https://www.linkedin.com/company/perfect-fitt/" 
    target="_blank" 
    rel="noopener noreferrer"
    style={{ color: 'inherit' }}
  >
    Perfect Fit
  </a>
</span>
            <br />
            <br />
            Apart from coding, here are some other activities that I love to do!
          </p>
          <ul>
            <li className="about-activity">
              <TbPoint/> Basketball
            </li>
            <li className="about-activity">
            <TbPoint/> Traveling
            </li>
            <li className="about-activity">
            <TbPoint/> Fashion
            </li>
          </ul>

          <p style={{ color: "rgb(155 126 172)" }}>
            "Do what excites"{" "}
          </p>
          <footer className="blockquote-footer">Luo</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
