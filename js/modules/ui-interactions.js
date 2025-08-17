import { openModal } from './modal-manager.js';

// Audio setup variables
let hoverSynth = null;
let clickSynth = null;
let audioInitialized = false;

async function initAudio() {
    if (audioInitialized) return;
    
    try {
        // First, load Tone.js if not already loaded
        if (typeof window.loadToneJS === 'function') {
            await window.loadToneJS();
        }
        
        // Check if Tone is now available
        if (typeof Tone === 'undefined') {
            console.warn('Tone.js not available');
            return;
        }
        
        // Start the audio context (requires user gesture)
        await Tone.start();
        console.log('Audio context started');
        
        // Create hover synth - subtle high-frequency tone
        hoverSynth = new Tone.Synth({
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.1,
                decay: 0.3,
                sustain: 0,
                release: 0.3
            }
        }).toDestination();
        
        // Create click synth - more prominent tone
        clickSynth = new Tone.Synth({
            oscillator: {
                type: "triangle"
            },
            envelope: {
                attack: 0.05,
                decay: 0.4,
                sustain: 0,
                release: 0.4
            }
        }).toDestination();
        
        audioInitialized = true;
        console.log('Audio initialized successfully');
    } catch (error) {
        console.warn('Failed to initialize audio:', error);
    }
}

function playHoverSound() {
    if (!audioInitialized || !hoverSynth) return;
    
    try {
        hoverSynth.triggerAttackRelease("C6", "16n");
    } catch (error) {
        console.warn('Failed to play hover sound:', error);
    }
}

function playClickSound() {
    if (!audioInitialized || !clickSynth) return;
    
    try {
        clickSynth.triggerAttackRelease("C5", "8n");
    } catch (error) {
        console.warn('Failed to play click sound:', error);
    }
}

export function initInteractions() {
    // Listen for electron click events from the 3D scene
    window.addEventListener('electronClicked', (event) => {
        const electronId = event.detail.id;
        initAudio().then(() => {
            playClickSound();
            openModal(electronId);
        });
    });
    
    // Listen for discover button click
    const discoverBtn = document.getElementById('discover-btn');
    if (discoverBtn) {
        discoverBtn.addEventListener('click', () => {
            initAudio().then(() => {
                playClickSound();
                openModal('projects_overview');
            });
        });
    }
    
    // Add one-time click listener to initialize audio on first interaction
    let hasInitializedAudio = false;
    const handleFirstInteraction = () => {
        if (!hasInitializedAudio) {
            hasInitializedAudio = true;
            initAudio();
            // Remove the listeners after first interaction
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        }
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    
    // Make audio functions available globally for three-scene.js
    window.audioFeedback = {
        playHoverSound,
        playClickSound,
        initAudio
    };
}