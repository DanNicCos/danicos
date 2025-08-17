import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { initThreeScene } from './modules/three-scene.js';
import { initInteractions } from './modules/ui-interactions.js';

// Make THREE and CSS2D available globally for the modules
window.THREE = THREE;
window.CSS2DRenderer = CSS2DRenderer;
window.CSS2DObject = CSS2DObject;

// Initialize 3D scene
initThreeScene();

// Initialize UI interactions
initInteractions();