
import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { Container, Image } from 'react-bootstrap';
import { FaCode, FaGraduationCap } from 'react-icons/fa';
import { BsStarFill } from 'react-icons/bs';
import Particle from '../Particle';
import introCertificate from "../../Assets/intro_db_certificate.png";


function Experience() {
  return (
    <Container fluid className="experience-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Professional <strong className="purple">Journey </strong>
        </h1>
        <p style={{ color: "white" }}>
          Here's a timeline of my work and education experience
        </p>
        <VerticalTimeline>
        <VerticalTimelineElement
            className="vertical-timeline-element--education"
            contentStyle={{ background: 'rgba(138, 43, 226, 0.2)', color: '#fff', border: '1px solid #8a2be2' }}
            contentArrowStyle={{ borderRight: '7px solid #8a2be2' }}
            date="Sep 2021 - Jun 2025"
            iconStyle={{ background: '#c770f0', color: '#fff' }}
            icon={<FaGraduationCap />}
          >
            <h3 className="vertical-timeline-element-title">Bachelor of Science in Computer Science</h3>
            <h4 className="vertical-timeline-element-subtitle">Santa Clara University</h4>
            <p>
              Studied computer networks, data structures, and software engineering principles.
            </p>
          </VerticalTimelineElement>

          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{ background: 'rgba(138, 43, 226, 0.2)', color: '#fff', border: '1px solid #8a2be2' }}
            contentArrowStyle={{ borderRight: '7px solid #8a2be2' }}
            date="Jul 2024"
            iconStyle={{ background: '#8a2be2', color: '#fff' }}
            icon={<FaCode />}
          >
            <h3 className="vertical-timeline-element-title">Introduction to Databases Certification</h3>
            <h4 className="vertical-timeline-element-subtitle">META</h4>
            <p>
              - Learned the basics of databases including SQL, NoSQL, and CRUD operations
            </p>
            <Image 
              src={introCertificate} 
              alt="Introduction to Databases Certificate" 
              fluid 
              style={{ marginTop: '15px', maxWidth: '100%', height: 'auto' }}
            />

          </VerticalTimelineElement>

          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{ background: 'rgba(138, 43, 226, 0.2)', color: '#fff', border: '1px solid #8a2be2' }}
            contentArrowStyle={{ borderRight: '7px solid #8a2be2' }}
            date="Apr 2024 - Present"
            iconStyle={{ background: '#8a2be2', color: '#fff' }}
            icon={<FaCode />}
          >
            <h3 className="vertical-timeline-element-title">Software Engineer</h3>
            <h4 className="vertical-timeline-element-subtitle">Perfect Fit</h4>
            <p>
              - Founded a fashion software startup that generates personalized outfits using HTML, React, and Node.js
            </p>
            <p> 
              - Accepted into the highly selective Bronco Venture Accelerator (BVA) program
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{ background: 'rgba(138, 43, 226, 0.2)', color: '#fff', border: '1px solid #8a2be2' }}
            contentArrowStyle={{ borderRight: '7px solid #8a2be2' }}
            date="Dec 2023 - Mar 2024"
            iconStyle={{ background: '#8a2be2', color: '#fff' }}
            icon={<FaCode />}
          >
            <h3 className="vertical-timeline-element-title">Software Engineer & Quality Assurance Intern </h3>
            <h4 className="vertical-timeline-element-subtitle">Undercurrent.ai</h4>
            <p>
            - Contributed to code reviews, by identifying and fixing bugs
            </p>
            <p>
              - Implemented automated testing with JUnit, resolving critical issues in Bitcoin wallet transactions
            </p>
          </VerticalTimelineElement>

          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{ background: 'rgba(138, 43, 226, 0.2)', color: '#fff', border: '1px solid #8a2be2' }}
            contentArrowStyle={{ borderRight: '7px solid #8a2be2' }}
            date="Nov 2023"
            iconStyle={{ background: '#8a2be2', color: '#fff' }}
            icon={<FaCode />}
          >
            <h3 className="vertical-timeline-element-title">Software Engineer</h3>
            <h4 className="vertical-timeline-element-subtitle">INRIX Hackathon Honorable Mention</h4>
            <p>
              - Created HotSpots, a full-stack market intelligence tool using React, Node.js, Tailwind CSS, INRIX API's, and Google Maps API
            </p>
            <p> 
              - Achieved an honorable mention in the INRIX Hackathon
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{ background: 'rgba(138, 43, 226, 0.2)', color: '#fff', border: '1px solid #8a2be2' }}
            contentArrowStyle={{ borderRight: '7px solid #8a2be2' }}
            date="Jun 2023 - Sep 2023"
            iconStyle={{ background: '#8a2be2', color: '#fff' }}
            icon={<FaCode />}
          >
            <h3 className="vertical-timeline-element-title">Software Engineering Intern</h3>
            <h4 className="vertical-timeline-element-subtitle">Studio 210</h4>
            <p>
              - Worked on front-end development using HTML, CSS, and JavaScript.
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{ background: 'rgba(138, 43, 226, 0.2)', color: '#fff', border: '1px solid #8a2be2' }}
            contentArrowStyle={{ borderRight: '7px solid #8a2be2' }}
            date="Nov 2022"
            iconStyle={{ background: '#8a2be2', color: '#fff' }}
            icon={<FaCode />}
          >
            <h3 className="vertical-timeline-element-title">Software Engineer</h3>
            <h4 className="vertical-timeline-element-subtitle">Hack4Humanity Hackathon Winner</h4>
            <p>
              - Designed SafeBronc, a mobile app focused on event safety using React Native, Twilio API, and Google Maps Geolocation API
            </p>
            <p>
              - Earned 4th place among 150+ entries at the Hack for Humanity Hackathon
            </p>
          </VerticalTimelineElement>
          
          <VerticalTimelineElement
            iconStyle={{ background: 'rgb(16, 204, 82)', color: '#fff' }}
            icon={<BsStarFill />}
          />
        </VerticalTimeline>
      </Container>
    </Container>
  );
}

export default Experience;