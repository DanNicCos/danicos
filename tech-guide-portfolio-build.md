Technical Guide: AI Engineer Portfolio Build
This document outlines the technical tasks required to build the personal portfolio website as defined in the PRD (v1.1). The process is broken down into sequential phases, from initial setup to final deployment.

Phase 1: Project Setup & Foundational Scaffolding
Objective: Create a clean, organized project structure and a valid HTML foundation.

Task 1.1: Initialize Project Directory

[ ] Create a root folder (e.g., nic-portfolio).

[ ] Create a new Git repository and perform the initial commit.

Task 1.2: Establish File Structure

[ ] Create index.html in the root.

[ ] Create a css folder.

[ ] Inside css, create style.css.

[ ] Create a js folder.

[ ] Inside js, create main.js.

[ ] Inside js, create three-scene.js (for modularity).

Task 1.3: Scaffold index.html

[ ] Set up the basic HTML5 boilerplate (<!DOCTYPE html>, <html>, <head>, <body>).

[ ] Add <meta> tags for viewport responsiveness and character set.

[ ] Link the style.css stylesheet in the <head>.

[ ] Add CDN script tag for three.js in the <head>.

[ ] Link the main.js and three-scene.js scripts at the end of the <body> with type="module".

[ ] Add the main semantic containers: a <main> tag, a <div> for the three.js canvas, and a <footer> or <div> for the text content.

[ ] Add placeholder <div> structures for the modals.

Phase 2: Core Styling & Layout (CSS)
Objective: Implement the mobile-first, dark-themed, and responsive layout.

Task 2.1: Implement Global Styles in style.css

[ ] Define CSS variables for the color palette (background, text, accent colors).

[ ] Apply a box-sizing: border-box; reset.

[ ] Style the <body> with the dark theme background color and primary font.

[ ] Ensure the html and body take up 100% of the viewport height.

Task 2.2: Style the Hero & Text Content

[ ] Style the three.js canvas container to be full-screen and positioned in the background (position: fixed or absolute).

[ ] Style the text container (<footer> or <div>) to overlay the bottom of the canvas.

[ ] Apply the monospaced font and styling for "Nic // AI Engineer".

[ ] Style the tagline and the "Discover →" button, ensuring the clickable area is clear.

Task 2.3: Implement Responsive Design

[ ] Use Flexbox or Grid for layout management.

[ ] Add media queries for tablet and desktop breakpoints to adjust font sizes and spacing as needed.

Phase 3: 3D Atom Implementation (Three.js)
Objective: Create and animate the central 3D atom navigation.

Task 3.1: Set Up the Basic Scene in three-scene.js

[ ] Initialize the Scene, Camera (PerspectiveCamera), and Renderer (WebGLRenderer).

[ ] Set the renderer size to match the window and handle window resize events.

[ ] Add basic lighting (e.g., AmbientLight, PointLight).

[ ] Create a render/animation loop (requestAnimationFrame).

Task 3.2: Create the Atom Geometry

[ ] Create the nucleus: a SphereGeometry with a basic MeshStandardMaterial.

[ ] Create the four electrons: smaller SphereGeometry objects with a distinct, perhaps emissive, material.

[ ] Create the orbital paths: use TorusGeometry or draw lines using BufferGeometry for visual effect.

Task 3.3: Animate the Electrons

[ ] In the animation loop, update the position of each electron.

[ ] Use trigonometric functions (Math.sin, Math.cos) to calculate positions for circular/elliptical orbits.

[ ] Give each electron a unique orbital path by varying the radius, speed, and axis of rotation (e.g., tilt one orbit on the X-axis, another on the Y-axis).

Phase 4: Interactivity & Modals
Objective: Connect user actions to UI responses.

Task 4.1: Implement 3D Object Interaction

[ ] Add a Raycaster in three-scene.js to detect clicks/taps on the 3D objects.

[ ] Add event listeners for mouse clicks and touch events.

[ ] Create a mapping between the clicked 3D electron object and its corresponding content type (e.g., 'bio', 'project1').

Task 4.2: Develop Modal System in main.js and style.css

[ ] Style the generic modal container: centered, with a backdrop overlay.

[ ] Add smooth CSS transitions for the modal appearing and disappearing.

[ ] Create a JavaScript function openModal(contentId) that:

Displays the modal container.

Populates it with the correct content based on contentId.

Adds a class to the <body> to prevent background scrolling.

[ ] Create a closeModal() function that reverses the process.

[ ] Wire up the close button ('X') and clicking the backdrop to trigger closeModal().

Task 4.3: Connect Interactions to Modals

[ ] When the Raycaster detects a click on an electron, call openModal() with the appropriate ID.

[ ] Add a click event listener to the "Discover →" button to open the "Projects Overview" modal.

[ ] Add click listeners to the buttons inside the "Projects Overview" modal to open the respective project detail modals.

Phase 5: Finalization & Deployment
Objective: Polish the site and deploy it for public access.

Task 5.1: Content Integration

[ ] Populate the HTML or a JS object with the final text for the Bio and all three projects.

[ ] Add the links for GitHub, Email, and Substack to the Bio modal.

Task 5.2: Final Polish & Optimization

[ ] Review all animations and transitions for smoothness.

[ ] Perform accessibility checks (keyboard navigation, color contrast).

[ ] Minify CSS and JS files for production (optional but good practice).

[ ] Test on multiple browsers and mobile devices.

Task 5.3: Deploy to GitHub Pages

[ ] Push the final code to the main branch of the GitHub repository.

[ ] In repository settings, enable GitHub Pages and select the main branch as the source.

[ ] Verify that the site is live at the provided URL.