import { portfolioContent } from './content.js';

/**
 * Modal Manager - Centralized modal system with a navigation history stack.
 * Handles all modal interactions through event delegation for a robust, "bulletproof" experience.
 */

// --- STATE MANAGEMENT ---
// ADDED: A history stack to manage navigation (e.g., Project List -> Project Detail -> back)
class ModalState {
    constructor() {
        this.isOpen = false;
        this.isTransitioning = false;
        this.history = []; // NEW: Array to store the navigation stack
    }

    get currentContentId() {
        return this.history.length > 0 ? this.history[this.history.length - 1] : null;
    }

    setOpen(initialContentId) {
        this.isOpen = true;
        this.history = [initialContentId]; // Reset history with the initial content
    }

    setClosed() {
        this.isOpen = false;
        this.history = []; // Clear history on close
    }

    setTransitioning(status) {
        this.isTransitioning = status;
    }

    // NEW: Push a new state onto the history stack
    navigateTo(contentId) {
        if (this.currentContentId !== contentId) {
            this.history.push(contentId);
        }
    }

    // NEW: Pop the current state to go back
    goBack() {
        if (this.history.length > 1) {
            this.history.pop();
            return this.currentContentId;
        }
        return null;
    }

    canInteract() {
        return this.isOpen && !this.isTransitioning;
    }
}

const modalState = new ModalState();

// --- DOM ELEMENT CACHE ---
const elements = {
    container: null,
    content: null, // ADDED: Reference to the main content wrapper for animations
    title: null,
    description: null,
    projectList: null,
    socialLinks: null
};

/**
 * Initialize the modal system.
 */
export function initModal() {
    try {
        elements.container = document.getElementById('modal-container');
        elements.content = document.querySelector('.modal-content'); // ADDED
        elements.title = document.getElementById('modal-title');
        elements.description = document.getElementById('modal-description');
        elements.projectList = document.getElementById('project-list');
        elements.socialLinks = document.getElementById('social-links');

        if (!elements.container || !elements.content) { // UPDATED
            throw new Error('Modal container or content element not found');
        }

        elements.container.addEventListener('click', handleModalClick);
        document.addEventListener('keydown', handleKeydown);

        console.log('Modal system initialized successfully');
    } catch (error) {
        console.error('Failed to initialize modal system:', error);
    }
}

// --- EVENT HANDLERS ---

/**
 * Handle all clicks within the modal using event delegation.
 */
function handleModalClick(event) {
    if (!modalState.canInteract()) {
        event.preventDefault();
        event.stopPropagation();
        return;
    }

    const target = event.target;
    const button = target.closest('button');

    // Handle backdrop or close button clicks
    if (target === elements.container || (button && button.classList.contains('close-button'))) {
        event.preventDefault();
        closeModal(); // This now intelligently decides whether to go back or close
    }
    
    // Handle project button clicks
    else if (button && button.classList.contains('project-button')) {
        event.preventDefault();
        event.stopPropagation(); // Keep this to prevent ghost clicks
        handleProjectButtonClick(button);
    }
}

/**
 * Handle project button clicks to navigate to a project detail modal.
 */
function handleProjectButtonClick(button) {
    const projectId = button.dataset.projectId;
    if (!projectId || !portfolioContent[projectId]) {
        console.error(`Invalid or missing project ID: ${projectId}`);
        return;
    }
    navigateToModal(projectId);
}

/**
 * Handle keyboard events (ESC key).
 */
function handleKeydown(event) {
    if (event.key === 'Escape' && modalState.isOpen) {
        closeModal(); // Same intelligent close
    }
}


// --- CORE MODAL ACTIONS ---

/**
 * Open the modal to a specific content ID.
 */
export function openModal(contentId) {
    if (modalState.isTransitioning || !contentId || !portfolioContent[contentId]) {
        return;
    }
    modalState.setTransitioning(true);

    renderModalContent(contentId);
    modalState.setOpen(contentId);

    elements.container.classList.remove('hidden');

    // Wait for the container animation to finish before allowing interaction
    setTimeout(() => {
        modalState.setTransitioning(false);
    }, 300); // Matches the CSS transition duration
}

/**
 * Closes the modal or navigates back in the history.
 * This is the new "smart" close function.
 */
export function closeModal() {
    if (!modalState.canInteract()) return;
    
    // If there's history, go back. Otherwise, close completely.
    if (modalState.history.length > 1) {
        goBack();
    } else {
        _closeCompletely();
    }
}

/**
 * Private function to fully close the modal and reset state.
 */
function _closeCompletely() {
    modalState.setTransitioning(true);
    elements.container.classList.add('hidden');
    
    // Wait for animation to finish before cleaning up
    setTimeout(() => {
        hideAllContent();
        modalState.setClosed(); // This also clears history
        modalState.setTransitioning(false);
    }, 300); // Matches the CSS transition duration
}

/**
 * NEW: Navigates back to the previous modal in the history stack.
 */
function goBack() {
    modalState.setTransitioning(true);
    
    // Get the previous content ID *before* popping the history
    const previousContentId = modalState.history[modalState.history.length - 2];
    
    // Animate out the current content
    elements.content.classList.add('is-hiding');
    
    setTimeout(() => {
        modalState.goBack(); // Now officially pop the history
        renderModalContent(previousContentId); // Render the previous content
        
        // Animate the new content in
        elements.content.classList.remove('is-hiding');
        
        modalState.setTransitioning(false);
    }, 300); // Matches the new CSS animation duration
}

/**
 * Navigates forward to a new modal view.
 */
function navigateToModal(contentId) {
    if (modalState.isTransitioning || !portfolioContent[contentId]) return;

    modalState.setTransitioning(true);
    modalState.navigateTo(contentId);

    // Animate out the current content
    elements.content.classList.add('is-hiding');

    setTimeout(() => {
        renderModalContent(contentId);
        
        // Animate the new content in
        elements.content.classList.remove('is-hiding');
        
        modalState.setTransitioning(false);
    }, 300); // Matches the new CSS animation duration
}


// --- CONTENT RENDERING ---

/**
 * Renders the modal content based on a content ID.
 */
function renderModalContent(contentId) {
    const content = portfolioContent[contentId];
    if (!content) return;

    elements.title.textContent = content.title;
    hideAllContent();

    if (content.type === 'project_list') {
        renderProjectList(content);
    } else {
        renderContentModal(content);
    }
}

function renderProjectList(content) {
    elements.projectList.innerHTML = ''; // Clear previous
    content.projects.forEach(project => {
        const button = document.createElement('button');
        button.className = 'project-button';
        button.textContent = project.name;
        button.dataset.projectId = project.id;
        elements.projectList.appendChild(button);
    });
    elements.projectList.style.display = 'block';
}

function renderContentModal(content) {
    elements.description.textContent = content.description;
    elements.description.style.display = 'block';

    if (content.links && content.links.length > 0) {
        const linksHTML = content.links
            .map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="social-link">${escapeHtml(link.name)}</a>`)
            .join('');
        elements.socialLinks.innerHTML = linksHTML;
        elements.socialLinks.style.display = 'flex';
    }
}

function hideAllContent() {
    elements.description.style.display = 'none';
    elements.projectList.style.display = 'none';
    elements.socialLinks.style.display = 'none';
    elements.socialLinks.innerHTML = '';
    elements.projectList.innerHTML = '';
    elements.description.textContent = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// For debugging purposes
export function getModalState() {
    return { ...modalState };
}