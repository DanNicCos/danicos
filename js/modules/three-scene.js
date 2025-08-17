// Using global THREE object from script tag in HTML
// CSS2D components will be loaded dynamically

// Module-level variables
let isHovering = false;
let hoveredElectron = null;
let previousHoveredElectron = null;

export function initThreeScene() {
    // Check if THREE is available
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded');
        return;
    }
    
    console.log('THREE.js version:', THREE.REVISION);
    console.log('THREE object available:', typeof THREE !== 'undefined');
    
    // Loading Manager setup
    const loadingManager = new THREE.LoadingManager();
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingText = document.querySelector('.loading-text');
    
    // Simulate loading progress
    function updateLoadingProgress(progress) {
        if (loadingBar) {
            loadingBar.style.width = `${progress * 100}%`;
        }
    }
    
    loadingManager.onStart = function(url, itemsLoaded, itemsTotal) {
        console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        if (loadingText) {
            loadingText.textContent = 'Loading assets...';
        }
    };
    
    loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
        const progress = itemsLoaded / itemsTotal;
        updateLoadingProgress(progress);
        console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };
    
    loadingManager.onLoad = function() {
        console.log('Loading complete!');
        if (loadingText) {
            loadingText.textContent = 'Complete!';
        }
        updateLoadingProgress(1.0);
        
        // Hide loading overlay after a brief delay
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
        }, 500);
    };
    
    loadingManager.onError = function(url) {
        console.log('There was an error loading ' + url);
        if (loadingText) {
            loadingText.textContent = 'Loading error!';
        }
    };
    
    // Simulate asset loading for demonstration
    setTimeout(() => {
        updateLoadingProgress(0.33);
        if (loadingText) loadingText.textContent = 'Creating 3D scene...';
    }, 300);
    
    setTimeout(() => {
        updateLoadingProgress(0.66);
        if (loadingText) loadingText.textContent = 'Initializing interactions...';
    }, 600);
    
    setTimeout(() => {
        updateLoadingProgress(1.0);
        if (loadingText) loadingText.textContent = 'Complete!';
        loadingManager.onLoad();
    }, 1000);
    
    // Create starfield function - moved inside to ensure THREE is available
    function createStarfield() {
        const starCount = 500;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            starPositions[i] = (Math.random() - 0.5) * 200;     // x
            starPositions[i + 1] = (Math.random() - 0.5) * 200; // y
            starPositions[i + 2] = (Math.random() - 0.5) * 200; // z
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0.8
        });
        
        return new THREE.Points(starGeometry, starMaterial);
    }
    // Get container element
    const container = document.getElementById('three-canvas-container');
    if (!container) {
        console.error('Container element not found');
        return;
    }
    
    console.log('Three.js scene initializing...');

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1929); // Dark blue background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false // Opaque background
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // CSS2D Renderer for labels
    const css2dRenderer = new window.CSS2DRenderer();
    css2dRenderer.setSize(window.innerWidth, window.innerHeight);
    css2dRenderer.domElement.style.position = 'absolute';
    css2dRenderer.domElement.style.top = '0px';
    css2dRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(css2dRenderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // Add starfield to scene
    const starfield = createStarfield();
    scene.add(starfield);
    
    // Add a test cube to verify rendering
    const testGeometry = new THREE.BoxGeometry(1, 1, 1);
    const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(3, 0, 0);
    scene.add(testCube);
    
    // Create atom group for rotation
    const atomGroup = new THREE.Group();
    scene.add(atomGroup);
    
    // Create nucleus with gradient shader
    const nucleusGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    
    // Nucleus gradient shader
    const nucleusVertexShader = `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const nucleusFragmentShader = `
        uniform float time;
        uniform float emissiveIntensity;
        varying vec3 vPosition;
        
        void main() {
            // Create gradient from blue to purple based on Y position
            float gradient = (vPosition.y + 0.5) / 1.0; // Normalize to 0-1
            vec3 color1 = vec3(0.25, 0.5, 1.0); // Blue
            vec3 color2 = vec3(0.8, 0.3, 1.0);  // Purple
            vec3 baseColor = mix(color1, color2, gradient);
            
            // Add emissive glow
            vec3 emissiveColor = baseColor * emissiveIntensity;
            
            gl_FragColor = vec4(baseColor + emissiveColor, 1.0);
        }
    `;
    
    const nucleusMaterial = new THREE.ShaderMaterial({
        vertexShader: nucleusVertexShader,
        fragmentShader: nucleusFragmentShader,
        uniforms: {
            time: { value: 0.0 },
            emissiveIntensity: { value: 0.3 }
        }
    });
    
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    atomGroup.add(nucleus);

    // Create electrons with gradient shader
    const electronGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    
    // Electron gradient shader
    const electronVertexShader = `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const electronFragmentShader = `
        uniform float time;
        varying vec3 vPosition;
        
        void main() {
            // Create gradient from cyan to white based on distance from center
            float distance = length(vPosition);
            float gradient = smoothstep(0.0, 0.25, distance);
            vec3 color1 = vec3(0.0, 1.0, 1.0); // Cyan
            vec3 color2 = vec3(0.8, 1.0, 1.0); // Light cyan/white
            vec3 baseColor = mix(color1, color2, gradient);
            
            // Add emissive glow
            vec3 emissiveColor = baseColor * 0.5;
            
            gl_FragColor = vec4(baseColor + emissiveColor, 1.0);
        }
    `;
    
    const electronMaterial = new THREE.ShaderMaterial({
        vertexShader: electronVertexShader,
        fragmentShader: electronFragmentShader,
        uniforms: {
            time: { value: 0.0 }
        }
    });

    // Create four electrons with identifiers and labels
    const electrons = [];
    const electronIds = ['bio', 'project1', 'project2', 'contact'];
    const electronLabels = ['Bio', 'Project 1', 'Project 2', 'Contact'];
    
    for (let i = 0; i < 4; i++) {
        const electron = new THREE.Mesh(electronGeometry, electronMaterial);
        electron.userData = { id: electronIds[i] };
        electrons.push(electron);
        atomGroup.add(electron);
        
        // Create CSS2D label for this electron
        const labelDiv = document.createElement('div');
        labelDiv.className = 'electron-label';
        labelDiv.textContent = electronLabels[i];
        labelDiv.style.color = '#00ffff';
        labelDiv.style.fontFamily = 'Orbitron, sans-serif';
        labelDiv.style.fontSize = '14px';
        labelDiv.style.fontWeight = 'bold';
        labelDiv.style.textShadow = '0 0 10px #00ffff';
        labelDiv.style.opacity = '0';
        labelDiv.style.transition = 'opacity 0.3s ease';
        labelDiv.style.pointerEvents = 'none';
        labelDiv.style.userSelect = 'none';
        
        const label = new window.CSS2DObject(labelDiv);
        label.position.set(0, 0.4, 0); // Position above the electron
        electron.add(label);
        
        // Store reference to label for easier access
        electron.userData.label = labelDiv;
    }

    // Create orbital paths (visual rings)
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });

    // Orbit configurations
    const orbitConfigs = [
        { radius: 1.5, tilt: { x: 0, y: 0, z: 0 } },        // XY plane
        { radius: 1.6, tilt: { x: Math.PI / 2, y: 0, z: 0 } }, // XZ plane
        { radius: 1.7, tilt: { x: Math.PI / 4, y: Math.PI / 4, z: 0 } }, // 45 degree tilt
        { radius: 2.0, tilt: { x: Math.PI / 3, y: -Math.PI / 6, z: Math.PI / 8 } } // Custom tilt
    ];

    // Create visual orbit paths
    orbitConfigs.forEach((config) => {
        const orbitGeometry = new THREE.TorusGeometry(config.radius, 0.01, 8, 100);
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = config.tilt.x;
        orbit.rotation.y = config.tilt.y;
        orbit.rotation.z = config.tilt.z;
        atomGroup.add(orbit);
    });

    // Raycasting setup for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Click handler for electrons
    function onPointerDown(event) {
        // Calculate normalized mouse coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Cast ray from camera through mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Check for intersections with electrons
        const intersects = raycaster.intersectObjects(electrons);
        
        if (intersects.length > 0) {
            const clickedElectron = intersects[0].object;
            const electronId = clickedElectron.userData.id;
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('electronClicked', {
                detail: { id: electronId }
            }));
        }
    }
    
    // Hover handler for electrons and nucleus
    function onPointerMove(event) {
        // Calculate normalized mouse coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Cast ray from camera through mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Check for intersections with electrons first
        const electronIntersects = raycaster.intersectObjects(electrons);
        
        if (electronIntersects.length > 0) {
            hoveredElectron = electronIntersects[0].object;
            isHovering = true;
            
            // Play hover sound only when starting to hover a new electron
            if (hoveredElectron !== previousHoveredElectron && window.audioFeedback) {
                window.audioFeedback.playHoverSound();
            }
        } else {
            // Check nucleus
            const nucleusIntersects = raycaster.intersectObjects([nucleus]);
            hoveredElectron = null;
            isHovering = nucleusIntersects.length > 0;
        }
        
        // Update previous hovered electron
        previousHoveredElectron = hoveredElectron;
    }
    
    // Add event listeners
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    
    // Time tracker for electron animation
    let time = 0;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Only animate if not hovering
        if (!isHovering) {
            // Update time
            time += 0.01;
            
            // Subtle nucleus rotation
            nucleus.rotation.x += 0.002;
            nucleus.rotation.y += 0.003;
            
            // Nucleus glowing pulse effect
            nucleusMaterial.uniforms.emissiveIntensity.value = 0.3 + Math.sin(time * 2) * 0.2;
            nucleusMaterial.uniforms.time.value = time;
            
            // Slow rotation of entire atom
            atomGroup.rotation.y += 0.001;
            atomGroup.rotation.x += 0.0005;
            
            // Rotate starfield for subtle movement
            starfield.rotation.y += 0.0002;
            
            // Animate electrons with unique orbits
            // Electron 1: XY plane orbit
            electrons[0].position.x = Math.cos(time * 0.3) * orbitConfigs[0].radius;
            electrons[0].position.y = Math.sin(time * 0.3) * orbitConfigs[0].radius;
            electrons[0].position.z = 0;
            
            // Electron 2: XZ plane orbit
            electrons[1].position.x = Math.cos(time * 0.25) * orbitConfigs[1].radius;
            electrons[1].position.y = 0;
            electrons[1].position.z = Math.sin(time * 0.25) * orbitConfigs[1].radius;
            
            // Electron 3: 45-degree tilted orbit
            const angle3 = time * 0.2;
            const radius3 = orbitConfigs[2].radius;
            electrons[2].position.x = Math.cos(angle3) * radius3 * Math.cos(Math.PI / 4);
            electrons[2].position.y = Math.sin(angle3) * radius3 * Math.cos(Math.PI / 4);
            electrons[2].position.z = Math.sin(angle3) * radius3 * Math.sin(Math.PI / 4);
            
            // Electron 4: Complex orbit with larger radius and different speed
            const angle4 = time * 0.15;
            const radius4 = orbitConfigs[3].radius;
            electrons[3].position.x = Math.cos(angle4) * radius4 * 0.8;
            electrons[3].position.y = Math.sin(angle4 * 2) * radius4 * 0.5; // Double frequency on Y
            electrons[3].position.z = Math.sin(angle4) * radius4 * 0.6;
        }
        
        // Handle electron scaling and label animation (always runs, even when paused)
        electrons.forEach(electron => {
            const isHovered = electron === hoveredElectron;
            const targetScale = isHovered ? 1.2 : 1.0;
            
            // Smooth lerp towards target scale
            const lerpFactor = 0.1;
            electron.scale.x += (targetScale - electron.scale.x) * lerpFactor;
            electron.scale.y += (targetScale - electron.scale.y) * lerpFactor;
            electron.scale.z += (targetScale - electron.scale.z) * lerpFactor;
            
            // Show/hide label based on hover state
            if (electron.userData.label) {
                electron.userData.label.style.opacity = isHovered ? '1' : '0';
            }
        });
        
        renderer.render(scene, camera);
        css2dRenderer.render(scene, camera);
    }

    // Handle window resize
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        css2dRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    window.addEventListener('resize', handleResize);

    // Start animation
    animate();
    
    console.log('Three.js scene initialized successfully');
    console.log('Canvas dimensions:', renderer.domElement.width, 'x', renderer.domElement.height);
    console.log('Container element:', container);
    console.log('Renderer DOM element appended:', renderer.domElement.parentNode === container);
}