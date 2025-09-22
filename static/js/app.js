// FitCoach AI - COMPLETE Navigation Fix
// Issue: Dashboard navigation buttons (AI Coach, Progress, etc.) not working

class FitCoachApp {
    // Add this method to your FitCoachApp class
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
        <div class="message-avatar">👤</div>
    `;
    chatMessages.appendChild(userMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Show typing indicator
    const typingMessage = document.createElement('div');
    typingMessage.className = 'chat-message ai-message typing';
    typingMessage.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>Thinking... 💭</p>
        </div>
    `;
    chatMessages.appendChild(typingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // Call your Flask API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: message,
                user_id: 'demo-user'
            })
        });
        
        // Remove typing indicator
        typingMessage.remove();
        
        if (response.ok) {
            const result = await response.json();
            const aiResponse = result.response || "I'm here to help with your fitness questions!";
            
            // Add AI response
            const aiMessage = document.createElement('div');
            aiMessage.className = 'chat-message ai-message';
            aiMessage.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>${aiResponse}</p>
                </div>
            `;
            chatMessages.appendChild(aiMessage);
        } else {
            throw new Error('API request failed');
        }
        
    } catch (error) {
        // Remove typing indicator
        typingMessage.remove();
        
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'chat-message ai-message';
        errorMessage.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>Sorry, I'm having trouble connecting right now. Please check your OpenRouter API key and try again.</p>
            </div>
        `;
        chatMessages.appendChild(errorMessage);
        
        console.error('Chat error:', error);
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

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
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // FIXED: Dashboard navigation events - use event delegation
        document.addEventListener('click', (e) => {
            // Handle navigation items in dashboard
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                this.handleDashboardNavigation(navItem);
                return;
            }
            
            // Handle option cards (Steps 2, 4, 5)
            const optionCard = e.target.closest('.option-card');
            if (optionCard) {
                e.preventDefault();
                this.selectOptionCard(optionCard);
                return;
            }
            
            // Handle checkbox cards (Step 3 - Goals) 
            const checkboxCard = e.target.closest('.checkbox-card');
            if (checkboxCard) {
                e.preventDefault();
                this.toggleCheckboxCard(checkboxCard);
                return;
            }
        });
        
        // Form validation - use event delegation
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e);
            }
        }, true);
        
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.handleInputChange(e);
            }
        });
        
        // Checkbox handling for goals
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name === 'goals') {
                console.log('Goal checkbox changed:', e.target.value, e.target.checked);
                this.saveGoalsData();
            }
        });
        
        console.log('Event listeners set up successfully');
    }
    
    // FIXED: Dashboard Navigation Handler
    handleDashboardNavigation(navItem) {
        if (!navItem) return;
        
        const targetSection = navItem.dataset.page;
        console.log(`Dashboard navigation clicked: ${targetSection}`);
        
        if (!targetSection) {
            console.error('No data-page attribute found on nav item');
            return;
        }
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');
        
        // Show the corresponding content section
        this.showDashboardSection(targetSection);
        
        // Update state
        this.state.currentDashboardSection = targetSection;
        
        console.log(`Switched to dashboard section: ${targetSection}`);
    }
    
    // FIXED: Show Dashboard Content Sections
    showDashboardSection(sectionName) {
        console.log(`Showing dashboard section: ${sectionName}`);
        
        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section or create it if it doesn't exist
        let targetSection = document.getElementById(`${sectionName}-content`);
        
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`Found and activated section: ${sectionName}-content`);
        } else {
            // Create the section dynamically if it doesn't exist
            console.log(`Creating new section: ${sectionName}`);
            targetSection = this.createDashboardSection(sectionName);
        }
        
        // Initialize section-specific content
        this.initializeDashboardSection(sectionName);
    }
    
    // FIXED: Create Dashboard Sections Dynamically
    createDashboardSection(sectionName) {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('Main content area not found');
            return null;
        }
        
        // Create new section
        const section = document.createElement('div');
        section.className = 'content-section active';
        section.id = `${sectionName}-content`;
        
        // Add content based on section type
        const sectionContent = this.getDashboardSectionContent(sectionName);
        section.innerHTML = sectionContent;
        
        // Append to main content
        mainContent.appendChild(section);
        
        console.log(`Created section: ${sectionName}-content`);
        return section;
    }
    
    // FIXED: Get Content for Each Dashboard Section
    getDashboardSectionContent(sectionName) {
        const contentTemplates = {
            dashboard: `
                <header class="section-header">
                    <div class="header-content">
                        <h1>Welcome back, <span id="user-name">Champion</span>!</h1>
                        <p class="header-subtitle">Here's your fitness overview for today</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-secondary" onclick="exportData()">📊 Export Data</button>
                    </div>
                </header>
                
                <div class="dashboard-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-content">
                            <h3>Goals Achieved</h3>
                            <div class="stat-value" id="goals-achieved">3</div>
                            <div class="stat-change positive">+1 this week</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💪</div>
                        <div class="stat-content">
                            <h3>Workouts Completed</h3>
                            <div class="stat-value" id="workouts-completed">12</div>
                            <div class="stat-change positive">+2 this week</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⚖️</div>
                        <div class="stat-content">
                            <h3>Weight Progress</h3>
                            <div class="stat-value" id="weight-progress">-2.5kg</div>
                            <div class="stat-change positive">On track</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-content">
                            <h3>Streak</h3>
                            <div class="stat-value" id="current-streak">7 days</div>
                            <div class="stat-change positive">Personal best!</div>
                        </div>
                    </div>
                </div>
            `,
            
            workouts: `
                <header class="section-header">
                    <div class="header-content">
                        <h1>💪 Your Workouts</h1>
                        <p class="header-subtitle">Personalized workout plans designed for your goals</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-primary" onclick="app.startWorkout()">🚀 Start Today's Workout</button>
                    </div>
                </header>
                
                <div class="workouts-grid">
                    <div class="workout-card">
                        <div class="workout-header">
                            <h3>Upper Body Strength</h3>
                            <span class="workout-duration">45 minutes</span>
                        </div>
                        <div class="workout-details">
                            <p><strong>Difficulty:</strong> Intermediate</p>
                            <p><strong>Equipment:</strong> Dumbbells, Pull-up bar</p>
                            <p><strong>Focus:</strong> Chest, Back, Arms</p>
                        </div>
                        <div class="workout-exercises">
                            <div class="exercise">Push-ups: 3 × 12-15 reps</div>
                            <div class="exercise">Pull-ups: 3 × 8-12 reps</div>
                            <div class="exercise">Dumbbell Press: 3 × 10-12 reps</div>
                        </div>
                        <button class="btn-primary small">Start Workout</button>
                    </div>
                    
                    <div class="workout-card">
                        <div class="workout-header">
                            <h3>Lower Body Power</h3>
                            <span class="workout-duration">40 minutes</span>
                        </div>
                        <div class="workout-details">
                            <p><strong>Difficulty:</strong> Advanced</p>
                            <p><strong>Equipment:</strong> Bodyweight, Optional weights</p>
                            <p><strong>Focus:</strong> Legs, Glutes, Core</p>
                        </div>
                        <div class="workout-exercises">
                            <div class="exercise">Squats: 4 × 15-20 reps</div>
                            <div class="exercise">Lunges: 3 × 12 each leg</div>
                            <div class="exercise">Deadlifts: 3 × 8-10 reps</div>
                        </div>
                        <button class="btn-secondary small">View Details</button>
                    </div>
                </div>
            `,
            
            nutrition: `
                <header class="section-header">
                    <div class="header-content">
                        <h1>🥗 Nutrition Plan</h1>
                        <p class="header-subtitle">Personalized meal plans for your fitness goals</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-primary">📋 Generate New Plan</button>
                    </div>
                </header>
                
                <div class="nutrition-overview">
                    <div class="nutrition-stats">
                        <div class="macro-card">
                            <h3>Daily Targets</h3>
                            <div class="macro-stat">
                                <span class="macro-label">Calories</span>
                                <span class="macro-value">2,000 kcal</span>
                            </div>
                            <div class="macro-stat">
                                <span class="macro-label">Protein</span>
                                <span class="macro-value">150g (30%)</span>
                            </div>
                            <div class="macro-stat">
                                <span class="macro-label">Carbs</span>
                                <span class="macro-value">200g (40%)</span>
                            </div>
                            <div class="macro-stat">
                                <span class="macro-label">Fats</span>
                                <span class="macro-value">67g (30%)</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="meals-section">
                    <h3>Today's Meal Plan</h3>
                    <div class="meals-grid">
                        <div class="meal-card">
                            <div class="meal-header">
                                <h4>🌅 Breakfast</h4>
                                <span class="meal-calories">400 kcal</span>
                            </div>
                            <div class="meal-content">
                                <p><strong>Protein Oatmeal Bowl</strong></p>
                                <p>Oats with protein powder, berries, and nuts</p>
                                <p><strong>Macros:</strong> 25g protein, 45g carbs, 8g fat</p>
                            </div>
                        </div>
                        
                        <div class="meal-card">
                            <div class="meal-header">
                                <h4>🌞 Lunch</h4>
                                <span class="meal-calories">500 kcal</span>
                            </div>
                            <div class="meal-content">
                                <p><strong>Chicken Power Bowl</strong></p>
                                <p>Grilled chicken, quinoa, mixed vegetables</p>
                                <p><strong>Macros:</strong> 35g protein, 40g carbs, 15g fat</p>
                            </div>
                        </div>
                        
                        <div class="meal-card">
                            <div class="meal-header">
                                <h4>🌙 Dinner</h4>
                                <span class="meal-calories">600 kcal</span>
                            </div>
                            <div class="meal-content">
                                <p><strong>Salmon & Sweet Potato</strong></p>
                                <p>Baked salmon with roasted sweet potato and broccoli</p>
                                <p><strong>Macros:</strong> 32g protein, 35g carbs, 22g fat</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            
            progress: `
                <header class="section-header">
                    <div class="header-content">
                        <h1>📈 Progress Tracking</h1>
                        <p class="header-subtitle">Track your fitness journey and achievements</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-primary">📊 Log Progress</button>
                    </div>
                </header>
                
                <div class="progress-overview">
                    <div class="progress-stats">
                        <div class="progress-card">
                            <h3>📊 This Month</h3>
                            <div class="progress-metrics">
                                <div class="metric">
                                    <span class="metric-label">Workouts Completed</span>
                                    <span class="metric-value">12/16</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Weight Change</span>
                                    <span class="metric-value">-2.5kg</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Consistency</span>
                                    <span class="metric-value">75%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="progress-card">
                            <h3>🏆 Achievements</h3>
                            <div class="achievements-mini">
                                <div class="achievement-mini earned">
                                    <span class="achievement-icon-mini">🎯</span>
                                    <span>First Workout</span>
                                </div>
                                <div class="achievement-mini earned">
                                    <span class="achievement-icon-mini">🔥</span>
                                    <span>Week Warrior</span>
                                </div>
                                <div class="achievement-mini">
                                    <span class="achievement-icon-mini">👑</span>
                                    <span>Month Champion</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="progress-chart-section">
                    <h3>📈 Weight Progress</h3>
                    <div class="chart-container">
                        <canvas id="progress-weight-chart" width="400" height="200"></canvas>
                    </div>
                </div>
            `,
            
            chat: `
                <header class="section-header">
                    <div class="header-content">
                        <h1>💬 AI Fitness Coach</h1>
                        <p class="header-subtitle">Get personalized guidance and answers to your fitness questions</p>
                    </div>
                </header>
                
                <div class="chat-container">
                    <div class="chat-messages" id="chat-messages">
                        <div class="chat-message ai-message">
                            <div class="message-avatar">🤖</div>
                            <div class="message-content">
                                <p>Hi ${this.state.userData.name || 'there'}! I'm your AI fitness coach. How can I help you today?</p>
                                <p>You can ask me about:</p>
                                <ul>
                                    <li>Exercise techniques and form</li>
                                    <li>Nutrition and meal planning</li>
                                    <li>Workout modifications</li>
                                    <li>Progress tracking tips</li>
                                    <li>Motivation and goal setting</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quick-questions">
                        <h4>Quick Questions:</h4>
                        <div class="question-buttons">
                            <button class="question-btn" onclick="app.askQuestion('How many sets for muscle growth?')">
                                💪 Sets for muscle growth?
                            </button>
                            <button class="question-btn" onclick="app.askQuestion('Best post-workout nutrition?')">
                                🥗 Post-workout nutrition?
                            </button>
                            <button class="question-btn" onclick="app.askQuestion('How to improve flexibility?')">
                                🧘 Improve flexibility?
                            </button>
                        </div>
                    </div>
                    
                    <div class="chat-input-section">
                        <div class="chat-input-container">
                            <input type="text" id="chat-input" placeholder="Ask your fitness question..." />
                            <button class="btn-primary" onclick="app.sendChatMessage()">Send</button>
                        </div>
                    </div>
                </div>
            `,
            
            settings: `
                <header class="section-header">
                    <div class="header-content">
                        <h1>⚙️ Settings</h1>
                        <p class="header-subtitle">Customize your FitCoach AI experience</p>
                    </div>
                </header>
                
                <div class="settings-sections">
                    <div class="settings-section">
                        <h3>👤 Profile Settings</h3>
                        <div class="settings-form">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" value="${this.state.userData.name || ''}" />
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Age</label>
                                    <input type="number" value="${this.state.userData.age || ''}" />
                                </div>
                                <div class="form-group">
                                    <label>Weight (kg)</label>
                                    <input type="number" value="${this.state.userData.weight || ''}" />
                                </div>
                            </div>
                            <button class="btn-primary">Update Profile</button>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>🎯 Fitness Preferences</h3>
                        <div class="settings-options">
                            <div class="setting-option">
                                <label>Fitness Level</label>
                                <select>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate" ${this.state.userData.fitness_level === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div class="setting-option">
                                <label>Preferred Workout Duration</label>
                                <select>
                                    <option value="15">15 minutes</option>
                                    <option value="30" selected>30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>📱 App Settings</h3>
                        <div class="settings-toggles">
                            <div class="setting-toggle">
                                <label>Push Notifications</label>
                                <input type="checkbox" checked />
                            </div>
                            <div class="setting-toggle">
                                <label>Daily Reminders</label>
                                <input type="checkbox" checked />
                            </div>
                            <div class="setting-toggle">
                                <label>Progress Sharing</label>
                                <input type="checkbox" />
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>📊 Data & Privacy</h3>
                        <div class="data-actions">
                            <button class="btn-secondary" onclick="app.exportData()">📥 Export My Data</button>
                            <button class="btn-secondary">🔄 Reset Progress</button>
                            <button class="btn-danger">🗑️ Delete Account</button>
                        </div>
                    </div>
                </div>
            `
        };
        
        return contentTemplates[sectionName] || `
            <div class="section-placeholder">
                <h2>${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} Section</h2>
                <p>This section is under development.</p>
            </div>
        `;
    }
    
    // FIXED: Initialize Section-Specific Content
    initializeDashboardSection(sectionName) {
        console.log(`Initializing section: ${sectionName}`);
        
        switch (sectionName) {
            case 'dashboard':
                this.updateUserName();
                this.updateDashboardStats();
                break;
            case 'workouts':
                this.loadWorkoutData();
                break;
            case 'nutrition':
                this.loadNutritionData();
                break;
            case 'progress':
                this.loadProgressData();
                this.createProgressChart();
                break;
            case 'chat':
                this.initializeChatSection();
                break;
            case 'settings':
                this.loadUserSettings();
                break;
        }
    }
    
    // Additional methods for specific sections
    loadWorkoutData() {
        console.log('Loading workout data...');
        // Implementation for workout data
    }
    
    loadNutritionData() {
        console.log('Loading nutrition data...');
        // Implementation for nutrition data
    }
    
    loadProgressData() {
        console.log('Loading progress data...');
        // Implementation for progress data
    }
    
    createProgressChart() {
        // Create a simple progress chart
        const canvas = document.getElementById('progress-weight-chart');
        if (canvas && window.Chart) {
            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Weight (kg)',
                        data: [75, 74.5, 74, 73.5],
                        borderColor: '#6C5CE7',
                        backgroundColor: 'rgba(108, 92, 231, 0.1)',
                        borderWidth: 3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: { color: '#B4B4B4' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#B4B4B4' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }
    }
    
    initializeChatSection() {
        console.log('Initializing chat section...');
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }
    
    loadUserSettings() {
        console.log('Loading user settings...');
        // Implementation for user settings
    }
    
    // Chat functionality
    askQuestion(question) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = question;
        }
        this.sendChatMessage();
    }
    
    // FIXED sendChatMessage function - replace the existing one in your app.js
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
        <div class="message-avatar">👤</div>
    `;
    chatMessages.appendChild(userMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Show typing indicator
    const typingMessage = document.createElement('div');
    typingMessage.className = 'chat-message ai-message typing';
    typingMessage.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>🤔 Thinking with DeepSeek R1...</p>
        </div>
    `;
    chatMessages.appendChild(typingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // FIXED: Call your REAL Flask API instead of simulation
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: message,
                user_id: 'demo-user'
            })
        });
        
        // Remove typing indicator
        typingMessage.remove();
        
        if (response.ok) {
            const result = await response.json();
            const aiResponse = result.response || "I'm here to help with your fitness questions!";
            
            // Add REAL AI response from OpenRouter
            const aiMessage = document.createElement('div');
            aiMessage.className = 'chat-message ai-message';
            aiMessage.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>${aiResponse}</p>
                    <small style="opacity: 0.6; font-size: 0.8em;">Powered by DeepSeek R1 via OpenRouter</small>
                </div>
            `;
            chatMessages.appendChild(aiMessage);
        } else {
            throw new Error(`API request failed: ${response.status}`);
        }
        
    } catch (error) {
        // Remove typing indicator
        typingMessage.remove();
        
        // Show error message with debugging info
        const errorMessage = document.createElement('div');
        errorMessage.className = 'chat-message ai-message';
        errorMessage.innerHTML = `
            <div class="message-avatar">⚠️</div>
            <div class="message-content">
                <p>Sorry, I'm having trouble connecting to OpenRouter.</p>
                <p><strong>Debug info:</strong> ${error.message}</p>
                <p>Please check:</p>
                <ul>
                    <li>Your OpenRouter API key is set correctly</li>
                    <li>You have credits/quota remaining</li>
                    <li>Network connection is working</li>
                </ul>
            </div>
        `;
        chatMessages.appendChild(errorMessage);
        
        console.error('Chat error:', error);
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
    
    // Rest of the original methods (keeping them as they were working)
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                console.log('Loading screen hidden');
            }
        }, 1500);
    }
    
    showPage(pageId) {
        console.log(`Showing page: ${pageId}`);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.state.currentPage = pageId;
            console.log(`Successfully switched to page: ${pageId}`);
            
            // If switching to onboarding, initialize it
            if (pageId === 'onboarding-page') {
                this.initializeOnboarding();
            }
            
            // If switching to dashboard, initialize it
            if (pageId === 'dashboard-page') {
                this.initializeDashboard();
            }
        } else {
            console.error(`Page not found: ${pageId}`);
        }
    }
    
    startOnboarding() {
        console.log('Starting onboarding...');
        this.showPage('onboarding-page');
    }
    
    initializeOnboarding() {
        console.log('Initializing onboarding...');
        this.state.currentStep = 1;
        this.showStep(1);
        this.updateProgressBar();
        this.updateNavigationButtons();
    }
    
    nextStep() {
        console.log(`Next step called, current step: ${this.state.currentStep}`);
        
        if (this.validateCurrentStep()) {
            if (this.state.currentStep < this.state.totalSteps) {
                this.state.currentStep++;
                this.showStep(this.state.currentStep);
                this.updateProgressBar();
                this.updateNavigationButtons();
                console.log(`Moved to step ${this.state.currentStep}`);
            }
        } else {
            console.log('Validation failed for current step');
        }
    }
    
    previousStep() {
        console.log(`Previous step called, current step: ${this.state.currentStep}`);
        
        if (this.state.currentStep > 1) {
            this.state.currentStep--;
            this.showStep(this.state.currentStep);
            this.updateProgressBar();
            this.updateNavigationButtons();
            console.log(`Moved to step ${this.state.currentStep}`);
        }
    }
    
    showStep(stepNumber) {
        console.log(`Showing step ${stepNumber}`);
        
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show current step
        const currentStep = document.getElementById(`step-${stepNumber}`);
        if (currentStep) {
            currentStep.style.display = 'block';
            currentStep.style.animation = 'slideInRight 0.4s ease';
            console.log(`Step ${stepNumber} displayed successfully`);
        } else {
            console.error(`Step ${stepNumber} element not found`);
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
            prevBtn.style.display = this.state.currentStep > 1 ? 'block' : 'none';
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
    
    validateCurrentStep() {
        console.log(`Validating step ${this.state.currentStep}`);
        
        const currentStepElement = document.getElementById(`step-${this.state.currentStep}`);
        if (!currentStepElement) {
            console.log('No validation needed for this step');
            return true;
        }
        
        const requiredFields = currentStepElement.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                console.log(`Required field missing: ${field.name || field.id}`);
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        // Special validation for step 3 (goals)
        if (this.state.currentStep === 3) {
            const checkedGoals = document.querySelectorAll('input[name="goals"]:checked');
            console.log(`Goals selected: ${checkedGoals.length}`);
            
            if (checkedGoals.length === 0) {
                console.log('No goals selected');
                this.showNotification('Please select at least one fitness goal', 'warning');
                isValid = false;
            }
        }
        
        // Validation for option cards (steps 2, 4, 5)
        if ([2, 4, 5].includes(this.state.currentStep)) {
            const selectedOptions = currentStepElement.querySelectorAll('.option-card.selected');
            if (selectedOptions.length === 0) {
                console.log('No option selected for step', this.state.currentStep);
                this.showNotification('Please select an option', 'warning');
                isValid = false;
            }
        }
        
        console.log(`Step validation result: ${isValid}`);
        return isValid;
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#FF5252';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '4px';
        
        field.parentNode.appendChild(errorDiv);
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    handleInputChange(event) {
        const field = event.target;
        console.log(`Input changed: ${field.name || field.id} = ${field.value}`);
        this.saveFormData(field);
    }
    
    saveFormData(field) {
        const fieldName = field.name || field.id;
        const fieldValue = field.type === 'checkbox' ? field.checked : field.value;
        
        this.state.userData[fieldName] = fieldValue;
        console.log('User data updated:', this.state.userData);
        
        // Store in localStorage
        try {
            localStorage.setItem('fitcoach_userData', JSON.stringify(this.state.userData));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }
    
    selectOptionCard(card) {
        if (!card) return;
        
        const container = card.parentNode;
        const value = card.dataset.value;
        
        console.log(`Option card selected: ${value}`);
        
        // Remove selection from siblings
        container.querySelectorAll('.option-card').forEach(sibling => {
            sibling.classList.remove('selected');
        });
        
        // Select current card
        card.classList.add('selected');
        
        // Save selection based on step
        let fieldName = 'selected_option';
        switch (this.state.currentStep) {
            case 2:
                fieldName = 'fitness_level';
                break;
            case 4:
                fieldName = 'equipment';
                break;
            case 5:
                fieldName = 'diet_preference';
                break;
        }
        
        this.state.userData[fieldName] = value;
        console.log(`Saved ${fieldName}: ${value}`);
        
        // Store in localStorage
        try {
            localStorage.setItem('fitcoach_userData', JSON.stringify(this.state.userData));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }
    
    toggleCheckboxCard(card) {
        if (!card) return;
        
        console.log('Checkbox card clicked:', card);
        
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (!checkbox) {
            console.error('No checkbox found in card');
            return;
        }
        
        console.log(`Toggling checkbox: ${checkbox.value}, currently: ${checkbox.checked}`);
        
        // Toggle checkbox state
        checkbox.checked = !checkbox.checked;
        
        // Update visual state immediately
        this.updateCheckboxCardVisual(card, checkbox.checked);
        
        // Trigger change event
        const changeEvent = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(changeEvent);
        
        console.log(`Checkbox ${checkbox.value} is now: ${checkbox.checked}`);
    }
    
    updateCheckboxCardVisual(card, isChecked) {
        if (isChecked) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
        
        // Update checkbox content visual state
        const checkboxContent = card.querySelector('.checkbox-content');
        if (checkboxContent) {
            if (isChecked) {
                checkboxContent.style.borderColor = '#6C5CE7';
                checkboxContent.style.background = 'linear-gradient(145deg, #1E1E2F 0%, rgba(108, 92, 231, 0.1) 100%)';
            } else {
                checkboxContent.style.borderColor = 'transparent';
                checkboxContent.style.background = '#1E1E2F';
            }
        }
    }
    
    saveGoalsData() {
        const checkedGoals = document.querySelectorAll('input[name="goals"]:checked');
        const goals = Array.from(checkedGoals).map(checkbox => checkbox.value);
        this.state.userData.fitness_goals = goals;
        
        console.log('Goals saved:', goals);
        
        // Update visual state for all checkbox cards
        document.querySelectorAll('.checkbox-card').forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox) {
                this.updateCheckboxCardVisual(card, checkbox.checked);
            }
        });
        
        // Store in localStorage
        try {
            localStorage.setItem('fitcoach_userData', JSON.stringify(this.state.userData));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }
    
    async finishOnboarding() {
        console.log('Finishing onboarding...');
        
        if (!this.validateCurrentStep()) {
            return;
        }
        
        // Collect all form data
        this.collectAllFormData();
        
        console.log('Final user data:', this.state.userData);
        
        // Show generation page
        this.showPage('generation-page');
        
        // Start AI generation process
        await this.simulateAIGeneration();
    }
    
    collectAllFormData() {
        console.log('Collecting all form data...');
        
        // Collect data from all form fields
        document.querySelectorAll('#onboarding-page input, #onboarding-page select, #onboarding-page textarea').forEach(field => {
            if (field.name || field.id) {
                const key = field.name || field.id;
                if (field.type === 'checkbox' && field.name === 'goals') {
                    return; // Goals handled separately
                } else if (field.value) {
                    this.state.userData[key] = field.value;
                }
            }
        });
        
        // Ensure goals are collected
        this.saveGoalsData();
        
        console.log('Collected form data:', this.state.userData);
    }
    
    async simulateAIGeneration() {
        console.log('Starting AI generation simulation...');
        
        const steps = [
            { message: "🧬 Analyzing your profile...", progress: 15 },
            { message: "🎯 Determining optimal workout structure...", progress: 30 },
            { message: "💪 Creating personalized exercises...", progress: 50 },
            { message: "🥗 Designing nutrition plan...", progress: 70 },
            { message: "📊 Calculating calorie and macro targets...", progress: 85 },
            { message: "✨ Finalizing your personalized plan...", progress: 100 }
        ];
        
        for (const step of steps) {
            await this.updateGenerationProgress(step.message, step.progress);
            await this.delay(800);
        }
        
        console.log('AI generation complete, redirecting to dashboard...');
        
        // Show dashboard after generation
        setTimeout(() => {
            this.showPage('dashboard-page');
        }, 1000);
    }
    
    async updateGenerationProgress(message, progress) {
        const statusElement = document.getElementById('generation-status');
        const progressElement = document.getElementById('generation-progress');
        const progressText = document.getElementById('progress-text');
        
        if (statusElement) {
            statusElement.innerHTML = `<p>${message}</p>`;
        }
        
        if (progressElement) {
            progressElement.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
        
        console.log(`Progress: ${progress}% - ${message}`);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    initializeDashboard() {
        console.log('Initializing dashboard...');
        this.updateUserName();
        this.showNotification('Welcome to your personalized fitness dashboard!', 'success');
        
        // Set dashboard as default section
        this.showDashboardSection('dashboard');
    }
    
    updateUserName() {
        const userName = this.state.userData.name || 'Champion';
        const nameElements = document.querySelectorAll('#user-name');
        nameElements.forEach(element => {
            if (element) element.textContent = userName;
        });
    }
    
    updateDashboardStats() {
        // Simulate realistic user progress data
        const stats = {
            goalsAchieved: Math.floor(Math.random() * 5) + 2,
            workoutsCompleted: Math.floor(Math.random() * 20) + 8,
            weightProgress: (Math.random() * 5 - 2.5).toFixed(1),
            currentStreak: Math.floor(Math.random() * 14) + 3
        };
        
        // Update stat displays
        const elements = {
            'goals-achieved': stats.goalsAchieved,
            'workouts-completed': stats.workoutsCompleted,
            'weight-progress': `${stats.weightProgress}kg`,
            'current-streak': `${stats.currentStreak} days`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    showNotification(message, type = 'info') {
        console.log(`Notification: ${message} (${type})`);
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles if not present
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
                .notification-info { background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%); color: white; }
                .notification-success { background: linear-gradient(135deg, #00E676 0%, #00C853 100%); color: white; }
                .notification-warning { background: linear-gradient(135deg, #FFD93D 0%, #FFC312 100%); color: #1A1A2E; }
                .notification-content { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
                .notification-message { flex: 1; font-weight: 500; }
                .notification-close { background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; }
                @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    startWorkout() {
        this.showNotification('Starting workout! 💪', 'success');
    }
    
    viewMealPlan() {
        this.showDashboardSection('nutrition');
        this.showNotification('Viewing your meal plan 🥗', 'info');
    }
    
    exportData() {
        console.log('Exporting data:', this.state.userData);
        this.showNotification('Data export feature coming soon! 📊', 'info');
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
    window.viewMealPlan = () => app.viewMealPlan();
    window.exportData = () => app.exportData();
    
    console.log('FitCoach AI App initialized successfully');
}

// Add CSS for dashboard sections
const dashboardStyles = `
    /* Dashboard Section Styles */
    .workouts-grid, .meals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .workout-card, .meal-card {
        background: var(--bg-card);
        border-radius: var(--border-radius-large);
        padding: 24px;
        border: 1px solid rgba(108, 92, 231, 0.2);
        transition: var(--transition);
    }
    
    .workout-card:hover, .meal-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-medium);
    }
    
    .workout-header, .meal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }
    
    .workout-header h3, .meal-header h4 {
        color: var(--text-primary);
        margin-bottom: 0;
    }
    
    .workout-duration, .meal-calories {
        color: var(--text-secondary);
        font-size: 0.9rem;
        padding: 4px 12px;
        background: rgba(108, 92, 231, 0.2);
        border-radius: 20px;
    }
    
    .workout-details, .meal-content {
        margin-bottom: 16px;
        color: var(--text-secondary);
    }
    
    .workout-exercises .exercise {
        padding: 8px 0;
        color: var(--text-secondary);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .progress-stats, .nutrition-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .progress-card, .macro-card {
        background: var(--bg-card);
        border-radius: var(--border-radius-large);
        padding: 24px;
        border: 1px solid rgba(108, 92, 231, 0.2);
    }
    
    .metric, .macro-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .metric:last-child, .macro-stat:last-child {
        border-bottom: none;
    }
    
    .metric-label, .macro-label {
        color: var(--text-secondary);
    }
    
    .metric-value, .macro-value {
        color: var(--text-primary);
        font-weight: 600;
    }
    
    /* Chat Styles */
    .chat-container {
        max-width: 800px;
        margin: 0 auto;
    }
    
    .chat-messages {
        background: var(--bg-card);
        border-radius: var(--border-radius-large);
        padding: 20px;
        margin-bottom: 20px;
        max-height: 400px;
        overflow-y: auto;
    }
    
    .chat-message {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        align-items: flex-start;
    }
    
    .chat-message.user-message {
        flex-direction: row-reverse;
    }
    
    .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        font-size: 1rem;
        flex-shrink: 0;
    }
    
    .message-content {
        flex: 1;
        padding: 12px 16px;
        border-radius: 12px;
        background: rgba(108, 92, 231, 0.1);
        border: 1px solid rgba(108, 92, 231, 0.2);
    }
    
    .user-message .message-content {
        background: rgba(255, 217, 61, 0.1);
        border-color: rgba(255, 217, 61, 0.2);
    }
    
    .quick-questions {
        margin-bottom: 20px;
    }
    
    .question-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 10px;
    }
    
    .question-btn {
        padding: 8px 16px;
        background: var(--bg-card);
        border: 1px solid rgba(108, 92, 231, 0.2);
        color: var(--text-primary);
        border-radius: 20px;
        cursor: pointer;
        transition: var(--transition);
        font-size: 0.9rem;
    }
    
    .question-btn:hover {
        background: rgba(108, 92, 231, 0.1);
        border-color: var(--primary-color);
    }
    
    .chat-input-container {
        display: flex;
        gap: 12px;
    }
    
    .chat-input-container input {
        flex: 1;
        padding: 12px 16px;
        background: var(--bg-card);
        border: 1px solid rgba(108, 92, 231, 0.2);
        border-radius: var(--border-radius);
        color: var(--text-primary);
    }
    
    .chat-input-container input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
    }
    
    /* Settings Styles */
    .settings-sections {
        max-width: 600px;
        margin: 0 auto;
    }
    
    .settings-section {
        background: var(--bg-card);
        border-radius: var(--border-radius-large);
        padding: 30px;
        margin-bottom: 30px;
        border: 1px solid rgba(108, 92, 231, 0.2);
    }
    
    .settings-section h3 {
        margin-bottom: 20px;
        color: var(--text-primary);
    }
    
    .settings-form .form-group {
        margin-bottom: 16px;
    }
    
    .settings-form .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    
    .settings-form label {
        display: block;
        margin-bottom: 6px;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .settings-form input, .settings-form select {
        width: 100%;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--border-radius);
        color: var(--text-primary);
    }
    
    .data-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }
    
    .btn-danger {
        background: linear-gradient(135deg, #FF5252 0%, #F44336 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: var(--transition);
    }
    
    .btn-danger:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-medium);
    }
    
    /* Chart container */
    .chart-container {
        background: var(--bg-card);
        border-radius: var(--border-radius-large);
        padding: 20px;
        margin-top: 20px;
        height: 300px;
        position: relative;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .workouts-grid, .meals-grid {
            grid-template-columns: 1fr;
        }
        
        .progress-stats, .nutrition-stats {
            grid-template-columns: 1fr;
        }
        
        .question-buttons {
            flex-direction: column;
        }
        
        .data-actions {
            flex-direction: column;
        }
    }
`;

// Inject dashboard styles
const dashboardStyleSheet = document.createElement('style');
dashboardStyleSheet.textContent = dashboardStyles;
document.head.appendChild(dashboardStyleSheet);