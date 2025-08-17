// Using global THREE object from script tag in HTML
// CSS2D components will be loaded dynamically

// Module-level variables
let hoveredElectron = null;
let previousHoveredElectron = null;

// Presentation mode variables
let isInPresentationMode = false;
let presentationModeTransition = 0; // 0 = default, 1 = presentation
const ATOM_INTERACTION_RADIUS = 3.5; // Radius around atom for hover detection

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
        const starGroup = new THREE.Group();
        
        // Main starfield with varied sizes and brightness
        const starCount = 800;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        const starColors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Position
            starPositions[i3] = (Math.random() - 0.5) * 400;     // x - larger spread
            starPositions[i3 + 1] = (Math.random() - 0.5) * 400; // y
            starPositions[i3 + 2] = (Math.random() - 0.5) * 400; // z
            
            // Size variation for depth
            starSizes[i] = Math.random() * 3 + 0.5;
            
            // Color variation - cool tones
            const brightness = 0.5 + Math.random() * 0.5;
            starColors[i3] = brightness * 0.8;     // R - less red
            starColors[i3 + 1] = brightness;       // G - full green
            starColors[i3 + 2] = brightness;       // B - full blue
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            sizeAttenuation: true
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        starGroup.add(stars);
        
        return starGroup;
    }
    
    // Create cosmic dust/nebula effect
    function createNebula() {
        const nebulaGroup = new THREE.Group();
        
        // Create multiple dust clouds
        for (let layer = 0; layer < 3; layer++) {
            const dustCount = 200;
            const dustGeometry = new THREE.BufferGeometry();
            const dustPositions = new Float32Array(dustCount * 3);
            const dustSizes = new Float32Array(dustCount);
            const dustColors = new Float32Array(dustCount * 3);
            
            for (let i = 0; i < dustCount; i++) {
                const i3 = i * 3;
                
                // Position in larger sphere
                const radius = 150 + layer * 50;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                dustPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                dustPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                dustPositions[i3 + 2] = radius * Math.cos(phi);
                
                // Size variation
                dustSizes[i] = Math.random() * 8 + 2;
                
                // Nebula colors - dark blues, purples, teals
                const colorVariant = Math.random();
                if (colorVariant < 0.33) {
                    // Dark blue
                    dustColors[i3] = 0.1;     // R
                    dustColors[i3 + 1] = 0.2; // G
                    dustColors[i3 + 2] = 0.6; // B
                } else if (colorVariant < 0.66) {
                    // Purple
                    dustColors[i3] = 0.4;     // R
                    dustColors[i3 + 1] = 0.1; // G
                    dustColors[i3 + 2] = 0.8; // B
                } else {
                    // Teal
                    dustColors[i3] = 0.0;     // R
                    dustColors[i3 + 1] = 0.6; // G
                    dustColors[i3 + 2] = 0.6; // B
                }
            }
            
            dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
            dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
            dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
            
            const dustMaterial = new THREE.PointsMaterial({
                size: 1,
                transparent: true,
                opacity: 0.1 - layer * 0.02, // Each layer more transparent
                vertexColors: true,
                sizeAttenuation: true,
                blending: THREE.AdditiveBlending
            });
            
            const dust = new THREE.Points(dustGeometry, dustMaterial);
            nebulaGroup.add(dust);
        }
        
        return nebulaGroup;
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
    scene.background = new THREE.Color(0x050a1a); // Deeper space background

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

    // Add enhanced starfield and nebula to scene
    const starfield = createStarfield();
    const nebula = createNebula();
    scene.add(starfield);
    scene.add(nebula);
    
    // Distant Pulsar Ping Effect Variables
    let pulsarTimer = 0;
    const PULSAR_INTERVAL = 5 + Math.random() * 5; // 5-10 seconds
    let currentPulsarStar = null;
    let pulsarAnimationProgress = 0;
    const starPoints = starfield.children[0]; // Get the Points object from starfield
    
    // Neural Synapse Flash Effect Variables
    let synapseTimer = 0;
    const SYNAPSE_INTERVAL = 15 + Math.random() * 5; // 15-20 seconds
    let synapseAnimationProgress = 0;
    let isFlashing = false;
    
    // Create Neural Network Plane with procedural neural pattern
    const neuralPlaneGeometry = new THREE.PlaneGeometry(50, 50);
    
    const neuralVertexShader = `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const neuralFragmentShader = `
        uniform float time;
        uniform float flashOpacity;
        varying vec2 vUv;
        
        // Simple noise function
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        // Create neural network pattern
        float neuralPattern(vec2 uv) {
            vec2 grid = floor(uv * 8.0);
            vec2 localUv = fract(uv * 8.0);
            
            // Create nodes at grid intersections
            float nodes = 0.0;
            for(int x = -1; x <= 1; x++) {
                for(int y = -1; y <= 1; y++) {
                    vec2 offset = vec2(float(x), float(y));
                    vec2 nodePos = grid + offset;
                    
                    // Random node position within cell
                    vec2 nodeOffset = vec2(
                        noise(nodePos + 100.0),
                        noise(nodePos + 200.0)
                    ) * 0.8 + 0.1;
                    
                    vec2 nodeWorldPos = (nodePos + nodeOffset) / 8.0;
                    float dist = length(uv - nodeWorldPos);
                    
                    // Create node
                    nodes += smoothstep(0.02, 0.01, dist);
                    
                    // Create connections between nearby nodes
                    for(int nx = -1; nx <= 1; nx++) {
                        for(int ny = -1; ny <= 1; ny++) {
                            if(nx == 0 && ny == 0) continue;
                            
                            vec2 neighborPos = nodePos + vec2(float(nx), float(ny));
                            vec2 neighborOffset = vec2(
                                noise(neighborPos + 100.0),
                                noise(neighborPos + 200.0)
                            ) * 0.8 + 0.1;
                            
                            vec2 neighborWorldPos = (neighborPos + neighborOffset) / 8.0;
                            
                            // Line between nodes
                            vec2 lineDir = normalize(neighborWorldPos - nodeWorldPos);
                            vec2 toPoint = uv - nodeWorldPos;
                            float lineProj = dot(toPoint, lineDir);
                            lineProj = clamp(lineProj, 0.0, length(neighborWorldPos - nodeWorldPos));
                            
                            vec2 closestPoint = nodeWorldPos + lineDir * lineProj;
                            float lineDist = length(uv - closestPoint);
                            
                            nodes += smoothstep(0.008, 0.003, lineDist) * 0.3;
                        }
                    }
                }
            }
            
            return nodes;
        }
        
        void main() {
            vec2 centeredUv = vUv - 0.5;
            
            // Create neural pattern
            float pattern = neuralPattern(vUv);
            
            // Add some animation
            float pulse = sin(time * 2.0) * 0.5 + 0.5;
            pattern *= (0.5 + pulse * 0.5);
            
            // Distance fade from center
            float distFromCenter = length(centeredUv);
            float fade = 1.0 - smoothstep(0.3, 0.7, distFromCenter);
            
            // Neural network color - cyan with purple highlights
            vec3 neuralColor = mix(
                vec3(0.0, 0.4, 0.8),  // Dark blue base
                vec3(0.0, 1.0, 1.0),  // Bright cyan
                pattern
            );
            
            float finalOpacity = pattern * fade * flashOpacity * 0.8;
            
            gl_FragColor = vec4(neuralColor, finalOpacity);
        }
    `;
    
    const neuralMaterial = new THREE.ShaderMaterial({
        vertexShader: neuralVertexShader,
        fragmentShader: neuralFragmentShader,
        uniforms: {
            time: { value: 0.0 },
            flashOpacity: { value: 0.0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });
    
    const neuralPlane = new THREE.Mesh(neuralPlaneGeometry, neuralMaterial);
    neuralPlane.position.z = -30; // Position behind the atom
    neuralPlane.rotation.x = Math.PI / 6; // Slight tilt
    scene.add(neuralPlane);
    
    
    // Create atom group for rotation
    const atomGroup = new THREE.Group();
    scene.add(atomGroup);
    
    // Create nucleus with gradient shader
    const nucleusGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    
    // Enhanced nucleus gradient shader with plasma effect
    const nucleusVertexShader = `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const nucleusFragmentShader = `
        uniform float time;
        uniform float emissiveIntensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        // Noise function for plasma effect
        float noise(vec2 p) {
            return sin(p.x * 12.9898 + p.y * 78.233) * 43758.5453;
        }
        
        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            
            for(int i = 0; i < 4; i++) {
                value += amplitude * sin(noise(p * frequency + time * 0.5));
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }
        
        void main() {
            // Create complex gradient from deep magenta to electric blue
            float sphericalGradient = length(vPosition) / 0.5;
            float yGradient = (vPosition.y + 0.5) / 1.0;
            float radialGradient = length(vUv - 0.5) * 2.0;
            
            // Multiple gradient layers
            vec3 magenta = vec3(0.9, 0.2, 0.8);     // Deep magenta
            vec3 purple = vec3(0.6, 0.1, 0.9);      // Purple middle
            vec3 electricBlue = vec3(0.0, 0.5, 1.0); // Electric blue
            vec3 cyan = vec3(0.0, 0.8, 1.0);        // Bright cyan
            
            // Complex color mixing
            vec3 color1 = mix(magenta, purple, smoothstep(0.0, 0.4, yGradient));
            vec3 color2 = mix(electricBlue, cyan, smoothstep(0.6, 1.0, yGradient));
            vec3 baseColor = mix(color1, color2, smoothstep(0.3, 0.7, yGradient));
            
            // Add plasma texture effect
            vec2 plasmaUv = vUv * 3.0 + time * 0.1;
            float plasma1 = fbm(plasmaUv);
            float plasma2 = fbm(plasmaUv + vec2(1.7, 9.2));
            float plasma3 = fbm(plasmaUv + vec2(8.3, 2.8));
            
            float plasmaPattern = sin(plasma1 + plasma2 + plasma3 + time) * 0.5 + 0.5;
            
            // Apply plasma effect to color
            vec3 plasmaColor = baseColor + plasmaPattern * 0.3 * vec3(0.5, 0.2, 0.8);
            
            // Enhanced emissive glow with pulsing
            float pulse = sin(time * 2.0) * 0.5 + 0.5;
            vec3 emissiveColor = plasmaColor * (emissiveIntensity + pulse * 0.4);
            
            // Rim lighting effect
            float rimPower = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
            vec3 rimColor = vec3(0.0, 0.8, 1.0) * rimPower * 0.5;
            
            gl_FragColor = vec4(plasmaColor + emissiveColor + rimColor, 1.0);
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
    
    // Create corona/glow effect around nucleus
    const coronaGeometry = new THREE.SphereGeometry(0.8, 24, 24);
    const coronaVertexShader = `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const coronaFragmentShader = `
        uniform float time;
        uniform float glowIntensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            // Fresnel effect for outer glow
            float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
            fresnel = pow(fresnel, 2.0);
            
            // Pulsing glow
            float pulse = sin(time * 3.0) * 0.5 + 0.5;
            float intensity = fresnel * glowIntensity * (0.8 + pulse * 0.4);
            
            // Corona colors - electric blue to cyan
            vec3 coronaColor = mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 0.8, 1.0), pulse);
            
            gl_FragColor = vec4(coronaColor, intensity * 0.6);
        }
    `;
    
    const coronaMaterial = new THREE.ShaderMaterial({
        vertexShader: coronaVertexShader,
        fragmentShader: coronaFragmentShader,
        uniforms: {
            time: { value: 0.0 },
            glowIntensity: { value: 1.0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    atomGroup.add(corona);

    // Create electrons with enhanced core-shell design
    const electronCoreGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const electronShellGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    
    // Enhanced electron core shader with hover glow
    const electronCoreVertexShader = `
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const electronCoreFragmentShader = `
        uniform float time;
        uniform float hoverIntensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
            // Bright cyan core with enhanced glow on hover
            vec3 cyanCore = vec3(0.0, 1.0, 1.0);
            float pulse = sin(time * 4.0) * 0.3 + 0.7;
            
            // Distance-based intensity for bright core
            float distance = length(vPosition) / 0.15;
            float intensity = 2.0 - smoothstep(0.0, 1.0, distance); // Brighter base intensity
            
            // Enhanced rim lighting with hover effect
            float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
            rim = pow(rim, 1.5 - hoverIntensity * 0.5);
            
            // Much brighter core intensity that makes electrons focal point
            float coreIntensity = pulse * (2.5 + hoverIntensity * 3.0); // Significantly brighter
            
            // Enhanced lens flare effect - billboarded star-like rays
            vec2 uv = vPosition.xy;
            float angle1 = atan(uv.y, uv.x);
            float angle2 = atan(uv.x, uv.y);
            
            // Create 4-pointed star effect
            float star1 = abs(sin(angle1 * 2.0)) * (1.0 - length(uv));
            float star2 = abs(sin(angle2 * 2.0)) * (1.0 - length(uv));
            
            // Create 6-pointed star effect for more complex flare
            float star3 = abs(sin(angle1 * 3.0)) * (1.0 - length(uv));
            float star4 = abs(sin((angle1 + 0.5) * 3.0)) * (1.0 - length(uv));
            
            // Combine star effects with pulsing
            float starPulse = sin(time * 6.0) * 0.3 + 0.7;
            float lensFlare = (star1 + star2) * 0.8 * starPulse * (1.0 + hoverIntensity * 2.0);
            lensFlare += (star3 + star4) * 0.4 * starPulse * (1.0 + hoverIntensity);
            
            // Bright glow effect - much more prominent
            float glowRadius = 1.0 - distance;
            float brightGlow = pow(glowRadius, 0.3) * 2.5; // Significantly brighter
            
            // Additional radial glow for prominence
            float radialGlow = 1.0 / (1.0 + distance * 3.0) * 1.5;
            
            vec3 finalColor = cyanCore * (coreIntensity * intensity + rim * (2.0 + hoverIntensity * 2.0) + lensFlare + brightGlow + radialGlow);
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;
    
    const electronCoreMaterial = new THREE.ShaderMaterial({
        vertexShader: electronCoreVertexShader,
        fragmentShader: electronCoreFragmentShader,
        uniforms: {
            time: { value: 0.0 },
            hoverIntensity: { value: 0.0 }
        }
    });
    
    // Enhanced electron shell shader with hover response
    const electronShellVertexShader = `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const electronShellFragmentShader = `
        uniform float time;
        uniform float hoverIntensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            // Enhanced fresnel effect for shell transparency
            float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
            fresnel = pow(fresnel, 1.2 - hoverIntensity * 0.3);
            
            // Enhanced pulsing with brighter base
            float pulse = sin(time * 2.0) * 0.3 + 1.0;
            
            // Brighter cyan shell with enhanced hover effect
            vec3 shellColor = vec3(0.3, 1.0, 1.0) * (1.5 + hoverIntensity * 1.2); // Much brighter
            
            // Additional glow ring effect
            float ringEffect = pow(fresnel, 2.0) * 0.8;
            
            float opacity = (fresnel * pulse + ringEffect) * (0.6 + hoverIntensity * 0.8);
            
            gl_FragColor = vec4(shellColor, opacity);
        }
    `;
    
    const electronShellMaterial = new THREE.ShaderMaterial({
        vertexShader: electronShellVertexShader,
        fragmentShader: electronShellFragmentShader,
        uniforms: {
            time: { value: 0.0 },
            hoverIntensity: { value: 0.0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });

    // Create four electrons with identifiers and labels
    const electrons = [];
    const electronCores = [];
    const electronShells = [];
    const electronIds = ['bio', 'project1', 'project2', 'project3'];
    const electronLabels = ['Bio', 'Project Alpha', 'Project Beta', 'Project Gamma'];
    
    for (let i = 0; i < 4; i++) {
        // Create electron group for core + shell
        const electronGroup = new THREE.Group();
        electronGroup.userData = { id: electronIds[i] };
        
        // Create individual materials for each electron to allow independent hover effects
        const coreMatClone = electronCoreMaterial.clone();
        const shellMatClone = electronShellMaterial.clone();
        
        // Create core and shell with individual materials
        const electronCore = new THREE.Mesh(electronCoreGeometry, coreMatClone);
        const electronShell = new THREE.Mesh(electronShellGeometry, shellMatClone);
        
        electronGroup.add(electronCore);
        electronGroup.add(electronShell);
        
        // Store material references for hover effects
        electronGroup.userData.coreMaterial = coreMatClone;
        electronGroup.userData.shellMaterial = shellMatClone;
        
        electrons.push(electronGroup);
        electronCores.push(electronCore);
        electronShells.push(electronShell);
        atomGroup.add(electronGroup);
        
        // Create enhanced CSS2D label for this electron
        const labelDiv = document.createElement('div');
        labelDiv.className = 'electron-label';
        labelDiv.textContent = electronLabels[i];
        labelDiv.style.color = '#00ffff';
        labelDiv.style.fontFamily = 'Orbitron, sans-serif';
        labelDiv.style.fontSize = '14px'; // Reduced by 15% from 16px
        labelDiv.style.fontWeight = 'bold';
        labelDiv.style.textShadow = '0 0 15px #00ffff, 0 0 30px #00ffff80';
        labelDiv.style.opacity = '0.8'; // Always visible
        labelDiv.style.transition = 'all 0.3s ease';
        labelDiv.style.pointerEvents = 'none';
        labelDiv.style.userSelect = 'none';
        labelDiv.style.background = 'rgba(0, 255, 255, 0.1)';
        labelDiv.style.padding = '7px 10px'; // Reduced by 15%
        labelDiv.style.borderRadius = '4px';
        labelDiv.style.border = '1px solid rgba(0, 255, 255, 0.3)';
        labelDiv.style.backdropFilter = 'blur(5px)';
        labelDiv.style.whiteSpace = 'nowrap';
        labelDiv.style.letterSpacing = '0.1em';
        labelDiv.style.textTransform = 'uppercase';
        
        const label = new window.CSS2DObject(labelDiv);
        label.position.set(0, 0.4, 0); // Position above the electron
        electronGroup.add(label);
        
        // Store reference to label for easier access
        electronGroup.userData.label = labelDiv;
    }

    // Create simplified two-orbit system: Inner (Personal) and Outer (Projects)
    const orbitConfigs = [
        { 
            name: 'inner-personal', 
            radius: 1.3, 
            tilt: { x: 0, y: 0, z: 0 },
            electronCount: 1,
            electronIds: ['bio']
        },        // Inner orbit for Bio
        { 
            name: 'outer-projects', 
            radius: 2.2, 
            tilt: { x: Math.PI / 8, y: 0, z: 0 },
            electronCount: 3,
            electronIds: ['project1', 'project2', 'project3']
        }         // Outer orbit for Projects
    ];

    const orbits = [];
    const orbitDashMaterials = []; // Store materials for time uniform updates

    // Create simple dash orbital paths
    orbitConfigs.forEach((config) => {
        const orbitGroup = new THREE.Group();
        
        // Create simple dashed orbital path
        const dashCount = 24; // Number of dashes around the orbit
        const dashLength = 0.3; // Length of each dash
        
        for (let i = 0; i < dashCount; i++) {
            const startAngle = (i / dashCount) * Math.PI * 2;
            const endAngle = startAngle + (dashLength / config.radius);
            
            // Create individual dash
            const dashPoints = [];
            const dashSegments = 4; // Smooth curve for each dash
            for (let j = 0; j <= dashSegments; j++) {
                const angle = startAngle + (endAngle - startAngle) * (j / dashSegments);
                dashPoints.push(new THREE.Vector3(
                    Math.cos(angle) * config.radius,
                    Math.sin(angle) * config.radius,
                    0
                ));
            }
            
            const dashGeometry = new THREE.BufferGeometry().setFromPoints(dashPoints);
            
            // Enhanced dash material with pulsing glow shader
            const dashVertexShader = `
                varying vec3 vPosition;
                uniform float time;
                uniform float dashIndex;
                
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;
            
            const dashFragmentShader = `
                uniform float time;
                uniform float dashIndex;
                varying vec3 vPosition;
                
                void main() {
                    // Pulsing glow effect with different phases for each dash
                    float pulse = sin(time * 2.0 + dashIndex * 0.5) * 0.5 + 0.5;
                    float glowIntensity = 0.3 + pulse * 0.7;
                    
                    // Subtle color variation
                    vec3 baseColor = vec3(0.0, 0.3, 0.6); // Deep blue
                    vec3 glowColor = vec3(0.0, 0.6, 1.0); // Bright cyan
                    vec3 finalColor = mix(baseColor, glowColor, pulse);
                    
                    gl_FragColor = vec4(finalColor * glowIntensity, glowIntensity * 0.8);
                }
            `;
            
            const dashMaterial = new THREE.ShaderMaterial({
                vertexShader: dashVertexShader,
                fragmentShader: dashFragmentShader,
                uniforms: {
                    time: { value: 0.0 },
                    dashIndex: { value: i }
                },
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            
            const dash = new THREE.Line(dashGeometry, dashMaterial);
            orbitGroup.add(dash);
            orbitDashMaterials.push(dashMaterial); // Store for time updates
        }
        
        // Apply orbit rotation
        orbitGroup.rotation.x = config.tilt.x;
        orbitGroup.rotation.y = config.tilt.y;
        orbitGroup.rotation.z = config.tilt.z;
        
        orbits.push(orbitGroup);
        atomGroup.add(orbitGroup);
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
        
        // Check for intersections with electrons first (including their children - core and shell meshes)
        const electronIntersects = raycaster.intersectObjects(electrons, true);
        
        if (electronIntersects.length > 0) {
            const clickedObject = electronIntersects[0].object;
            // The clicked object might be the core mesh, so we need to traverse up to find the electron group
            let electronGroup = clickedObject;
            while (electronGroup && !electronGroup.userData.id) {
                electronGroup = electronGroup.parent;
            }
            
            if (electronGroup && electronGroup.userData.id) {
                const electronId = electronGroup.userData.id;
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('electronClicked', {
                    detail: { id: electronId }
                }));
            }
        } else {
            // If no electron was clicked, check for nucleus click
            const nucleusIntersects = raycaster.intersectObjects([nucleus, corona], false);
            
            if (nucleusIntersects.length > 0) {
                // Dispatch nucleus click event (same as Discover button)
                window.dispatchEvent(new CustomEvent('nucleusClicked'));
            }
        }
    }
    
    // Hover handler for electrons, nucleus, and atom area
    function onPointerMove(event) {
        // Calculate normalized mouse coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Cast ray from camera through mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Check distance from camera ray to atom center for presentation mode
        const atomCenter = atomGroup.position;
        const cameraToAtom = new THREE.Vector3().subVectors(atomCenter, camera.position);
        
        // Calculate closest point on ray to atom center
        const t = cameraToAtom.dot(raycaster.ray.direction);
        const closestPoint = new THREE.Vector3().copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, t);
        const distanceToAtom = closestPoint.distanceTo(atomCenter);
        
        // Check if we're hovering in the atom area for presentation mode
        isInPresentationMode = distanceToAtom < ATOM_INTERACTION_RADIUS;
        
        // Check for intersections with electrons first (including their children - core and shell meshes)
        const electronIntersects = raycaster.intersectObjects(electrons, true);
        
        if (electronIntersects.length > 0) {
            const hoveredObject = electronIntersects[0].object;
            // The hovered object might be the core/shell mesh, so we need to traverse up to find the electron group
            let electronGroup = hoveredObject;
            while (electronGroup && !electronGroup.userData.id) {
                electronGroup = electronGroup.parent;
            }
            
            hoveredElectron = electronGroup;
            
            // Play hover sound only when starting to hover a new electron
            if (hoveredElectron !== previousHoveredElectron && window.audioFeedback) {
                window.audioFeedback.playHoverSound();
            }
        } else {
            // Reset hovered electron when not hovering any
            hoveredElectron = null;
        }
        
        // Update previous hovered electron
        previousHoveredElectron = hoveredElectron;
    }
    
    // Add event listeners
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    
    // Time tracker for electron animation
    let time = 0;
    
    // Distant Pulsar Ping Effect Function
    function triggerPulsarPing() {
        const starCount = starPoints.geometry.attributes.position.count;
        const randomStarIndex = Math.floor(Math.random() * starCount);
        
        currentPulsarStar = {
            index: randomStarIndex,
            originalColor: {
                r: starPoints.geometry.attributes.color.getX(randomStarIndex),
                g: starPoints.geometry.attributes.color.getY(randomStarIndex), 
                b: starPoints.geometry.attributes.color.getZ(randomStarIndex)
            }
        };
        
        pulsarAnimationProgress = 0;
    }
    
    // Neural Synapse Flash Effect Function
    function triggerSynapseFlash() {
        isFlashing = true;
        synapseAnimationProgress = 0;
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update presentation mode transition smoothly
        const targetTransition = isInPresentationMode ? 1.0 : 0.0;
        const transitionSpeed = 0.05;
        presentationModeTransition += (targetTransition - presentationModeTransition) * transitionSpeed;
        
        // Update time for all animations
        time += 0.01;
        
        // Distant Pulsar Ping Effect
        pulsarTimer += 0.01;
        if (pulsarTimer >= PULSAR_INTERVAL && !currentPulsarStar) {
            triggerPulsarPing();
            pulsarTimer = 0;
        }
        
        // Animate current pulsar ping
        if (currentPulsarStar) {
            pulsarAnimationProgress += 0.02; // 1 second animation (0.02 * 50 frames)
            
            if (pulsarAnimationProgress <= 1.0) {
                // Animate to cyan and back
                const progress = pulsarAnimationProgress;
                const pingIntensity = Math.sin(progress * Math.PI); // Smooth fade in and out
                
                // Bright cyan color for ping
                const cyanColor = { r: 0.0, g: 1.0, b: 1.0 };
                const currentR = currentPulsarStar.originalColor.r + (cyanColor.r - currentPulsarStar.originalColor.r) * pingIntensity;
                const currentG = currentPulsarStar.originalColor.g + (cyanColor.g - currentPulsarStar.originalColor.g) * pingIntensity;
                const currentB = currentPulsarStar.originalColor.b + (cyanColor.b - currentPulsarStar.originalColor.b) * pingIntensity;
                
                // Update star color
                starPoints.geometry.attributes.color.setXYZ(currentPulsarStar.index, currentR, currentG, currentB);
                starPoints.geometry.attributes.color.needsUpdate = true;
            } else {
                // Animation complete - reset star to original color
                starPoints.geometry.attributes.color.setXYZ(
                    currentPulsarStar.index, 
                    currentPulsarStar.originalColor.r,
                    currentPulsarStar.originalColor.g,
                    currentPulsarStar.originalColor.b
                );
                starPoints.geometry.attributes.color.needsUpdate = true;
                currentPulsarStar = null;
                
                // Set next random interval
                pulsarTimer = 0;
            }
        }
        
        // Neural Synapse Flash Effect
        synapseTimer += 0.01;
        if (synapseTimer >= SYNAPSE_INTERVAL && !isFlashing) {
            triggerSynapseFlash();
            synapseTimer = 0;
        }
        
        // Animate neural synapse flash
        if (isFlashing) {
            synapseAnimationProgress += 0.04; // 0.5 second flash (0.04 * 25 frames)
            
            if (synapseAnimationProgress <= 1.0) {
                // Quick flash to low opacity and back
                const progress = synapseAnimationProgress;
                const flashIntensity = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5; // Double frequency for quick flash
                const targetOpacity = 0.15 * flashIntensity; // Low opacity as specified
                
                neuralMaterial.uniforms.flashOpacity.value = targetOpacity;
            } else {
                // Flash complete
                neuralMaterial.uniforms.flashOpacity.value = 0.0;
                isFlashing = false;
                synapseTimer = 0;
            }
        }
        
        // Update neural plane material time uniform
        neuralMaterial.uniforms.time.value = time;
        
        // Always update material time uniforms
        nucleusMaterial.uniforms.time.value = time;
        coronaMaterial.uniforms.time.value = time;
        
        // Update orbital dash materials for pulsing glow effect
        orbitDashMaterials.forEach(material => {
            material.uniforms.time.value = time;
        });
        
        // Nucleus glowing pulse effect (always active)
        nucleusMaterial.uniforms.emissiveIntensity.value = 0.3 + Math.sin(time * 2) * 0.2;
        coronaMaterial.uniforms.glowIntensity.value = 1.0 + Math.sin(time * 3) * 0.5;
        
        // Default State: Free tumbling animation when not in presentation mode
        if (presentationModeTransition < 0.1) {
            // Enhanced tumbling rotation for engaging visual
            atomGroup.rotation.y += 0.008; // Faster Y rotation for dynamic tumbling
            atomGroup.rotation.x += 0.006; // Faster X rotation
            atomGroup.rotation.z += 0.004; // Add Z rotation for 3D tumbling effect
            
            // Nucleus independent rotation for added visual complexity
            nucleus.rotation.x += 0.004;
            nucleus.rotation.y += 0.005;
            nucleus.rotation.z += 0.003;
            
            // Parallax rotation for starfield (distant objects move slower)
            starfield.rotation.y += 0.0001;
            starfield.rotation.x += 0.00005;
            
            // Nebula moves even slower for depth effect
            nebula.rotation.y += 0.00005;
            nebula.rotation.z += 0.00002;
            
            // Animate electrons with predictable, slower motion in two-orbit system
            
            // Inner Orbit (Personal): Bio electron - slower, constant speed
            const innerSpeed = 0.15; // Slower, predictable speed
            const innerAngle = time * innerSpeed;
            const innerRadius = orbitConfigs[0].radius;
            electrons[0].position.x = Math.cos(innerAngle) * innerRadius;
            electrons[0].position.y = Math.sin(innerAngle) * innerRadius;
            electrons[0].position.z = 0;
            
            // Outer Orbit (Projects): Three project electrons evenly spaced (120 degrees apart)
            const outerSpeed = 0.12; // Slightly slower for outer orbit
            const outerRadius = orbitConfigs[1].radius;
            const baseOuterAngle = time * outerSpeed;
            const spacing = (Math.PI * 2) / 3; // 120 degrees between electrons
            const tiltX = orbitConfigs[1].tilt.x;
            
            for (let i = 1; i < 4; i++) { // Electrons 1, 2, 3 (projects)
                const electronAngle = baseOuterAngle + (i - 1) * spacing;
                
                // Apply slight tilt to outer orbit
                const x = Math.cos(electronAngle) * outerRadius;
                const y = Math.sin(electronAngle) * outerRadius * Math.cos(tiltX);
                const z = Math.sin(electronAngle) * outerRadius * Math.sin(tiltX);
                
                electrons[i].position.x = x;
                electrons[i].position.y = y;
                electrons[i].position.z = z;
            }
        }
        
        // Presentation Mode: Smooth animation into stable, predictable state
        if (presentationModeTransition > 0) {
            // Calculate target rotation for presentation mode (face camera directly)
            const targetRotationX = 0;
            const targetRotationY = 0;
            const targetRotationZ = 0;
            
            // Smoothly interpolate to presentation orientation
            const lerpFactor = 0.08; // Faster transition for responsiveness
            atomGroup.rotation.x += (targetRotationX - atomGroup.rotation.x) * lerpFactor * presentationModeTransition;
            atomGroup.rotation.y += (targetRotationY - atomGroup.rotation.y) * lerpFactor * presentationModeTransition;
            atomGroup.rotation.z += (targetRotationZ - atomGroup.rotation.z) * lerpFactor * presentationModeTransition;
            
            // Inner orbit (Personal): Slower constant speed for predictable interaction
            const innerPresentationSpeed = 0.06; // Slower for stable targeting
            const innerAngle = time * innerPresentationSpeed;
            const innerRadius = orbitConfigs[0].radius;
            
            // Smoothly flatten inner orbit to 2D circular path
            const innerZ = electrons[0].position.z;
            const targetInnerZ = 0;
            electrons[0].position.x = Math.cos(innerAngle) * innerRadius;
            electrons[0].position.y = Math.sin(innerAngle) * innerRadius;
            electrons[0].position.z = innerZ + (targetInnerZ - innerZ) * lerpFactor * presentationModeTransition;
            
            // Outer orbit (Projects): Different constant speed for mechanical motion effect
            const outerPresentationSpeed = 0.10; // Faster for pleasing visual contrast
            const outerRadius = orbitConfigs[1].radius;
            const baseOuterAngle = time * outerPresentationSpeed;
            const spacing = (Math.PI * 2) / 3;
            
            // Smoothly flatten outer orbit to face camera (remove tilt completely)
            for (let i = 1; i < 4; i++) {
                const electronAngle = baseOuterAngle + (i - 1) * spacing;
                const targetX = Math.cos(electronAngle) * outerRadius;
                const targetY = Math.sin(electronAngle) * outerRadius;
                const targetZ = 0; // Flattened to face camera
                
                // Smooth interpolation to flattened positions
                electrons[i].position.x += (targetX - electrons[i].position.x) * lerpFactor * presentationModeTransition + (1 - presentationModeTransition) * (targetX - electrons[i].position.x) * 0.02;
                electrons[i].position.y += (targetY - electrons[i].position.y) * lerpFactor * presentationModeTransition + (1 - presentationModeTransition) * (targetY - electrons[i].position.y) * 0.02;
                electrons[i].position.z += (targetZ - electrons[i].position.z) * lerpFactor * presentationModeTransition;
            }
        }
        
        // Handle electron scaling, shader effects, and label animation (always runs, even when paused)
        electrons.forEach(electron => {
            const isHovered = electron === hoveredElectron;
            const targetScale = isHovered ? 1.2 : 1.0;
            const targetHoverIntensity = isHovered ? 1.0 : 0.0;
            
            // Smooth lerp towards target scale
            const lerpFactor = 0.1;
            electron.scale.x += (targetScale - electron.scale.x) * lerpFactor;
            electron.scale.y += (targetScale - electron.scale.y) * lerpFactor;
            electron.scale.z += (targetScale - electron.scale.z) * lerpFactor;
            
            // Update material hover intensity for core glow effect
            if (electron.userData.coreMaterial && electron.userData.shellMaterial) {
                const currentHoverIntensity = electron.userData.coreMaterial.uniforms.hoverIntensity.value;
                const newHoverIntensity = currentHoverIntensity + (targetHoverIntensity - currentHoverIntensity) * lerpFactor;
                
                electron.userData.coreMaterial.uniforms.hoverIntensity.value = newHoverIntensity;
                electron.userData.shellMaterial.uniforms.hoverIntensity.value = newHoverIntensity;
                electron.userData.coreMaterial.uniforms.time.value = time;
                electron.userData.shellMaterial.uniforms.time.value = time;
            }
            
            // Enhanced label animation based on hover state - always visible with hover enhancement
            if (electron.userData.label) {
                if (isHovered) {
                    electron.userData.label.style.opacity = '1';
                    electron.userData.label.style.transform = 'scale(1.2) translateY(-8px)';
                    electron.userData.label.style.background = 'rgba(0, 255, 255, 0.3)';
                    electron.userData.label.style.border = '2px solid rgba(0, 255, 255, 0.8)';
                    electron.userData.label.style.textShadow = '0 0 25px #00ffff, 0 0 50px #00ffff80, 0 0 75px #00ffff40';
                    electron.userData.label.style.fontSize = '15px'; // Reduced by 15% from 18px
                    electron.userData.label.style.fontWeight = '900';
                } else {
                    electron.userData.label.style.opacity = '0.8'; // Always visible
                    electron.userData.label.style.transform = 'scale(1) translateY(0)';
                    electron.userData.label.style.background = 'rgba(0, 255, 255, 0.1)';
                    electron.userData.label.style.border = '1px solid rgba(0, 255, 255, 0.3)';
                    electron.userData.label.style.textShadow = '0 0 15px #00ffff, 0 0 30px #00ffff80';
                    electron.userData.label.style.fontSize = '14px'; // Reduced by 15% from 16px
                    electron.userData.label.style.fontWeight = 'bold';
                }
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