class FitCoachApp {
    constructor() {
        this.state = {
            currentPage: 'welcome',
            currentStep: 1,
            totalSteps: 6,
            userData: {},
            workoutPlans: [],
            mealPlans: [],
            progressData: [],
            currentDashboardSection: 'dashboard'
        };
        this.init();
    }

    init() {
        console.log('Initializing FitCoach AI...');

        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.hideLoadingScreen();
            });
        } else {
            this.setupEventListeners();
            this.hideLoadingScreen();
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                console.log('Loading screen hidden');

                // Show welcome page
                const welcomePage = document.getElementById('welcome-page');
                if (welcomePage) {
                    welcomePage.style.display = 'block';
                    welcomePage.classList.add('active');
                }
            }
        }, 1000); // Reduced to 1 second for faster loading
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');

        // Simple click event delegation
        document.addEventListener('click', (e) => {
            // Handle start onboarding button
            if (e.target.matches('.btn-primary') && e.target.textContent.includes('Start')) {
                e.preventDefault();
                this.startOnboarding();
                return;
            }

            // Handle navigation items
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.dataset.page) {
                e.preventDefault();
                this.handleDashboardNavigation(navItem);
                return;
            }

            // Handle option cards
            const optionCard = e.target.closest('.option-card');
            if (optionCard) {
                e.preventDefault();
                this.selectOptionCard(optionCard);
                return;
            }
        });

        console.log('Event listeners set up successfully');
    }

    startOnboarding() {
        console.log('Starting onboarding...');
        this.showPage('onboarding-page');
        this.initializeOnboarding();
    }

    initializeOnboarding() {
        this.state.currentStep = 1;
        this.showStep(1);
        this.updateProgressBar();
        this.updateNavigationButtons();
    }

    showPage(pageId) {
        console.log('Showing page:', pageId);

        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.style.display = 'block';
            targetPage.classList.add('active');
            this.state.currentPage = pageId;
        }
    }

    showStep(stepNumber) {
        console.log('Showing step:', stepNumber);

        // Hide all steps
        document.querySelectorAll('.step-content').forEach(step => {
            step.style.display = 'none';
        });

        // Show current step
        const currentStep = document.getElementById(`step-${stepNumber}`);
        if (currentStep) {
            currentStep.style.display = 'block';
        }
    }

    updateProgressBar() {
        const progressFill = document.getElementById('progress-fill');
        const stepCounter = document.getElementById('step-counter');

        if (progressFill) {
            const progress = (this.state.currentStep / this.state.totalSteps) * 100;
            progressFill.style.width = `${progress}%`;
        }

        if (stepCounter) {
            stepCounter.textContent = `Step ${this.state.currentStep} of ${this.state.totalSteps}`;
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const finishBtn = document.getElementById('finish-btn');

        if (prevBtn) {
            prevBtn.style.display = this.state.currentStep === 1 ? 'none' : 'block';
        }

        if (nextBtn && finishBtn) {
            if (this.state.currentStep === this.state.totalSteps) {
                nextBtn.style.display = 'none';
                finishBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                finishBtn.style.display = 'none';
            }
        }
    }

    nextStep() {
        console.log('Next step called');
        if (this.state.currentStep < this.state.totalSteps) {
            this.state.currentStep++;
            this.showStep(this.state.currentStep);
            this.updateProgressBar();
            this.updateNavigationButtons();
        }
    }

    previousStep() {
        console.log('Previous step called');
        if (this.state.currentStep > 1) {
            this.state.currentStep--;
            this.showStep(this.state.currentStep);
            this.updateProgressBar();
            this.updateNavigationButtons();
        }
    }

    selectOptionCard(card) {
        if (!card) return;

        const container = card.parentNode;
        const value = card.dataset.value;

        // Remove selection from siblings
        container.querySelectorAll('.option-card').forEach(sibling => {
            sibling.classList.remove('selected');
        });

        // Select current card
        card.classList.add('selected');
        console.log('Option selected:', value);
    }

    async finishOnboarding() {
        console.log('Finishing onboarding...');

        // Show generation page
        this.showPage('generation-page');

        // Simulate AI generation
        await this.simulateAIGeneration();

        // Go to dashboard
        this.showPage('dashboard-page');
        this.initializeDashboard();
    }

    async simulateAIGeneration() {
        const steps = [
            { message: 'Analyzing your profile...', progress: 20 },
            { message: 'Creating workout plan...', progress: 50 },
            { message: 'Designing nutrition plan...', progress: 80 },
            { message: 'Finalizing your plan...', progress: 100 }
        ];

        for (const step of steps) {
            await this.updateGenerationProgress(step.message, step.progress);
            await this.delay(800);
        }
    }

    async updateGenerationProgress(message, progress) {
        const statusElement = document.getElementById('generation-status');
        const progressElement = document.getElementById('generation-progress');

        if (statusElement) {
            statusElement.innerHTML = `<p>${message}</p>`;
        }

        if (progressElement) {
            progressElement.style.width = `${progress}%`;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initializeDashboard() {
        console.log('Dashboard initialized');
        this.showDashboardSection('dashboard');
    }

    handleDashboardNavigation(navItem) {
        if (!navItem) return;

        const targetSection = navItem.dataset.page;
        if (!targetSection) return;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');

        // Show the section
        this.showDashboardSection(targetSection);
    }

    showDashboardSection(sectionName) {
        console.log('Showing dashboard section:', sectionName);

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        let targetSection = document.getElementById(`${sectionName}-content`);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            // Create basic section if it doesn't exist
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                targetSection = document.createElement('div');
                targetSection.className = 'content-section active';
                targetSection.id = `${sectionName}-content`;
                targetSection.innerHTML = `
                    <div class="section-header">
                        <h1>${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h1>
                        <p>This section is coming soon!</p>
                    </div>
                `;
                mainContent.appendChild(targetSection);
            }
        }
    }

    // Chat functionality
    async sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');

        if (!chatInput || !chatMessages) return;

        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message user-message';
        userMessage.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        chatMessages.appendChild(userMessage);

        // Clear input
        chatInput.value = '';

        // Add AI response (simplified)
        const aiMessage = document.createElement('div');
        aiMessage.className = 'chat-message ai-message';
        aiMessage.innerHTML = `
            <div class="message-content">
                <p>I'm here to help with your fitness questions! However, the AI chat is currently being set up. Please check that your OpenRouter API key is configured correctly.</p>
            </div>
        `;
        chatMessages.appendChild(aiMessage);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Notification system
    showNotification(message, type = 'info') {
        console.log('Notification:', message, type);

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Simple workout functions
    startWorkout() {
        this.showNotification('Workout started! (Feature in development)', 'success');
    }

    logMeal() {
        this.showNotification('Meal logging feature in development', 'info');
    }

    exportData() {
        this.showNotification('Data export feature coming soon!', 'info');
    }
}

// Initialize app
let app;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    console.log('Initializing FitCoach AI App...');
    app = new FitCoachApp();

    // Add global functions for onclick handlers
    window.startOnboarding = () => {
        console.log('startOnboarding called');
        app.startOnboarding();
    };

    window.nextStep = () => {
        console.log('nextStep called');
        app.nextStep();
    };

    window.previousStep = () => {
        console.log('previousStep called');
        app.previousStep();
    };

    window.finishOnboarding = () => {
        console.log('finishOnboarding called');
        app.finishOnboarding();
    };

    window.startWorkout = () => app.startWorkout();
    window.exportData = () => app.exportData();

    console.log('FitCoach AI App initialized successfully');
}

// Add basic notification styles if they don't exist
if (!document.querySelector('.notification-styles')) {
    const style = document.createElement('style');
    style.className = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        }

        .notification-info {
            background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%);
            color: white;
        }

        .notification-success {
            background: linear-gradient(135deg, #00E676 0%, #00C853 100%);
            color: white;
        }

        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }

        .notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.2rem;
            cursor: pointer;
        }

        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}
