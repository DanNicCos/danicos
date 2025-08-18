import { portfolioContent } from './content.js';

/**
 * Modal Manager - Centralized modal system with a navigation history stack.
 * Handles all modal interactions through event delegation for a robust, "bulletproof" experience.
 */

// --- STATE MANAGEMENT ---
class ModalState {
    constructor() {
        this.isOpen = false;
        this.isTransitioning = false;
        this.history = [];
        this.clickGuardActive = false; // flag to absorb the first "ghost click"
    }

    get currentContentId() {
        return this.history.length > 0 ? this.history[this.history.length - 1] : null;
    }

    setOpen(initialContentId) {
        this.isOpen = true;
        this.history = [initialContentId];
    }

    setClosed() {
        this.isOpen = false;
        this.history = [];
    }

    setTransitioning(status) {
        this.isTransitioning = status;
    }

    navigateTo(contentId) {
        if (this.currentContentId !== contentId) {
            this.history.push(contentId);
        }
    }

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
const elements = {
    container: null,
    content: null,
    title: null,
    description: null,
    projectList: null,
    socialLinks: null
};

export function initModal() {
    try {
        elements.container = document.getElementById('modal-container');
        elements.content = document.querySelector('.modal-content');
        elements.title = document.getElementById('modal-title');
        elements.description = document.getElementById('modal-description');
        elements.projectList = document.getElementById('project-list');
        elements.socialLinks = document.getElementById('social-links');

        if (!elements.container || !elements.content) throw new Error('Modal elements not found');

        elements.container.addEventListener('click', handleModalClick);
        document.addEventListener('keydown', handleKeydown);
    } catch (error) {
        console.error('Failed to initialize modal system:', error);
    }
}

// --- EVENT HANDLERS ---
function handleModalClick(event) {
    // **CRITICAL CHANGE**: The Click Guard is checked here.
    if (modalState.clickGuardActive) {
        modalState.clickGuardActive = false; // Deactivate the guard
        event.stopPropagation(); // Stop this ghost click from doing anything else
        return; // Absorb and ignore this click
    }

    if (!modalState.canInteract()) return;

    const target = event.target;
    const button = target.closest('button');

    if (target === elements.container || (button && button.classList.contains('close-button'))) {
        event.preventDefault();
        closeModal();
    }
}

function handleProjectButtonClick(button) {
    const projectId = button.dataset.projectId;
    if (!projectId || !portfolioContent[projectId]) return;
    navigateToModal(projectId);
}

function handleKeydown(event) {
    if (event.key === 'Escape' && modalState.isOpen) closeModal();
}

// --- CORE MODAL ACTIONS ---
export function openModal(contentId) {
    if (modalState.isTransitioning || !contentId || !portfolioContent[contentId]) return;

    modalState.setTransitioning(true);
    modalState.clickGuardActive = true; // **NEW**: Activate the guard just before opening

    renderModalContent(contentId);
    modalState.setOpen(contentId);
    elements.container.classList.remove('hidden');

    // The timeout is now ONLY for the visual animation state, not for click logic.
    setTimeout(() => {
        modalState.setTransitioning(false);
    }, 200); // We'll speed this up to 200ms as you suggested.
}

export function closeModal() {
    if (!modalState.canInteract()) return;
    if (modalState.history.length > 1) {
        goBack();
    } else {
        _closeCompletely();
    }
}

function _closeCompletely() {
    modalState.setTransitioning(true);
    elements.container.classList.add('hidden');
    setTimeout(() => {
        hideAllContent();
        modalState.setClosed();
        modalState.setTransitioning(false);
    }, 200); // Match the new animation speed
}

function goBack() {
    modalState.setTransitioning(true);
    const previousContentId = modalState.history[modalState.history.length - 2];
    elements.content.classList.add('is-hiding');
    setTimeout(() => {
        modalState.goBack();
        renderModalContent(previousContentId);
        elements.content.classList.remove('is-hiding');
        modalState.setTransitioning(false);
    }, 200); // Match the new animation speed
}

function navigateToModal(contentId) {
    if (modalState.isTransitioning || !portfolioContent[contentId]) return;

    modalState.setTransitioning(true);
    modalState.navigateTo(contentId);
    elements.content.classList.add('is-hiding');
    setTimeout(() => {
        renderModalContent(contentId);
        elements.content.classList.remove('is-hiding');
        modalState.setTransitioning(false);
    }, 200); // Match the new animation speed
}

// --- CONTENT RENDERING ---
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

// **CRITICAL CHANGE**: The button listener is now simpler. It doesn't need to worry about state.
function renderProjectList(content) {
    elements.projectList.innerHTML = '';
    content.projects.forEach(project => {
        const button = document.createElement('button');
        button.className = 'project-button';
        button.textContent = project.name;
        button.dataset.projectId = project.id;
        button.addEventListener('click', (event) => {
            event.stopPropagation(); // Still important to prevent bubbling to the container
            handleProjectButtonClick(button);
        });
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
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}