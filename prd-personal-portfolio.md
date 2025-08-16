Product Requirements Document: Personal Portfolio Website
Author: Nic, AI Engineer
Version: 1.1
Date: August 16, 2025

1. Vision & Overview
To create a visually striking and interactive single-page personal portfolio that showcases Nic's identity as an AI Engineer. The site will serve as a digital business card, captivating visitors through a unique 3D animated hero section and providing essential information about Nic's background and projects in a seamless, mobile-first experience.

2. Target Audience
Recruiters and Hiring Managers: Professionals looking to quickly assess Nic's skills, experience, and creativity.

Tech Professionals & Peers: Colleagues in the AI/tech industry interested in Nic's work and projects.

Potential Collaborators: Individuals or companies seeking an AI Engineer for projects.

3. Key Features & Functionality
3.1. Hero Section: Interactive 3D Atom
Core Component: A central, animated 3D atom model created with three.js.

Nucleus: The stable center of the atom.

Electrons: Four distinct, animated electrons orbiting the nucleus.

Each electron will have a unique, "cool" animation path (e.g., distinct orbit, speed, or visual effect).

The electrons are the primary interactive elements for navigation.

Electron Mapping:

Electron 1: Represents "Bio".

Electron 2: Represents "Project 1".

Electron 3: Represents "Project 2".

Electron 4: Represents "Project 3".

Interaction: On-click/on-tap of an electron, a modal window will open. The atom animation should gracefully pause or slow down when a modal is active.

3.2. Content Modals
Functionality: A set of reusable modal components that display content.

Content Types:

Bio Modal: Contains Nic's professional summary, skills, background, and links to GitHub, Email (mailto:), and Substack.

Project Detail Modals (3x): Each modal will detail a specific project, including a description, the technologies used, Nic's role, and a link to the project/repo if applicable.

Projects Overview Modal: A simple modal containing three clickable entries/buttons, one for each project. Clicking an entry opens the corresponding Project Detail Modal.

Closing Mechanism: An intuitive and clearly visible 'close' button (e.g., an 'X' icon) allows the user to easily exit any modal and return to the main hero view.

3.3. Identity & Call to Action (CTA)
Name & Role: Below the 3D atom, display the text "Nic // AI Engineer" in a fixed-width, terminal-style font.

Tagline & CTA Button:

A single line of text will serve as both a tagline and a button.

Text: "I build AI systems that amplify human potential. Discover →"

Functionality: The "Discover →" part of the text will be the clickable area. It opens the Projects Overview Modal.

4. Design & User Experience (UX)
Layout:

Mobile-First: The design must be optimized for an excellent experience on mobile devices. The 3D atom should be centered and responsive, with text elements positioned legibly below.

Tablet & Desktop: The experience will scale up to a single-page layout, making full use of the wider viewport for the 3D animation.

Aesthetics:

Theme: Dark theme with subtle, elegant animations.

Typography: A tech-focused, monospaced font for the name/role and a clean, modern sans-serif for the tagline and modal content.

Responsiveness: The layout must be fully responsive and fluid across all screen sizes, with no horizontal scrolling. The three.js canvas must resize with the browser window.

5. Technology Stack & Deployment
Frontend: HTML5, CSS3, JavaScript (ES6+)

3D Graphics: three.js (loaded via CDN)

Code Quality: All code must adhere to modular, DRY, and clean practices with a focus on minimal file sizes.

Deployment: GitHub Pages.