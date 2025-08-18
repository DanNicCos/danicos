import { openModal } from './modal-manager.js';

// Audio setup variables
let hoverSynth = null;
let clickSynth = null;
let nucleusClickSynth = null;
let discoverClickSynth = null;
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
        
        // Create nucleus click synth - deep, powerful resonant tone
        nucleusClickSynth = new Tone.FMSynth({
            harmonicity: 3,
            modulationIndex: 10,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.01,
                decay: 0.8,
                sustain: 0.1,
                release: 1.2
            },
            modulation: {
                type: "square"
            },
            modulationEnvelope: {
                attack: 0.5,
                decay: 0.2,
                sustain: 0,
                release: 0.5
            }
        }).toDestination();
        
        // Create discover button synth - bright, ascending tone
        discoverClickSynth = new Tone.PolySynth({
            oscillator: {
                type: "sawtooth"
            },
            envelope: {
                attack: 0.02,
                decay: 0.3,
                sustain: 0.2,
                release: 0.6
            },
            filter: {
                frequency: 2000,
                Q: 1
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

function playNucleusClickSound() {
    if (!audioInitialized || !nucleusClickSynth) return;
    
    try {
        // Deep, powerful resonant tone for nucleus click
        nucleusClickSynth.triggerAttackRelease("C3", "4n");
    } catch (error) {
        console.warn('Failed to play nucleus click sound:', error);
    }
}

function playDiscoverClickSound() {
    if (!audioInitialized || !discoverClickSynth) return;
    
    try {
        // Bright ascending chord for discover button
        discoverClickSynth.triggerAttackRelease(["C4", "E4", "G4"], "4n");
        // Add a slight delay for a second chord to create ascending effect
        setTimeout(() => {
            if (discoverClickSynth) {
                discoverClickSynth.triggerAttackRelease(["E4", "G4", "C5"], "8n");
            }
        }, 150);
    } catch (error) {
        console.warn('Failed to play discover click sound:', error);
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
                playNucleusClickSound();
                openModal('projects_overview');
            });
        });
    }
    
    // Nucleus click events are now handled directly in three-scene.js
    // to reverse orbit direction instead of opening a modal
    
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
        playNucleusClickSound,
        playDiscoverClickSound,
        initAudio
    };
}