import { portfolioContent } from './content.js';

export function openModal(contentId) {
    const modalContainer = document.getElementById('modal-container');
    
    if (!modalContainer) {
        console.error('Modal container not found');
        return;
    }
    
    const content = portfolioContent[contentId];
    
    if (!content) {
        console.error(`Content not found for id: ${contentId}`);
        return;
    }
    
    let modalHTML = '';
    
    if (content.type === 'project_list') {
        const projectButtons = content.projects.map(project => 
            `<button class="project-button" data-project-id="${project.id}">${project.name}</button>`
        ).join('');
        
        modalHTML = `
            <div class="modal-content">
                <button id="close-modal" class="close-button">×</button>
                <h2 class="modal-title">${content.title}</h2>
                <div class="project-list">
                    ${projectButtons}
                </div>
            </div>
        `;
    } else {
        const linksHTML = content.links ? `
            <div class="social-links">
                ${content.links.map(link => 
                    `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-link">${link.name}</a>`
                ).join('')}
            </div>
        ` : '';
        
        modalHTML = `
            <div class="modal-content">
                <button id="close-modal" class="close-button">×</button>
                <h2 class="modal-title">${content.title}</h2>
                <p class="modal-description">${content.description}</p>
                ${linksHTML}
            </div>
        `;
    }
    
    modalContainer.innerHTML = modalHTML;
    modalContainer.classList.remove('hidden');
    
    const closeButton = document.getElementById('close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    modalContainer.addEventListener('click', (event) => {
        if (event.target === modalContainer) {
            closeModal();
        }
        
        if (event.target.classList.contains('project-button')) {
            const projectId = event.target.dataset.projectId;
            closeModal();
            setTimeout(() => openModal(projectId), 100);
        }
    });
}

export function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    
    if (modalContainer) {
        modalContainer.classList.add('hidden');
        setTimeout(() => {
            modalContainer.innerHTML = '';
        }, 300);
    }
}