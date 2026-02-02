/*
 * Task Manager Pro
 * © 2026 Arun
 * Licensed under the MIT License
 * Free to use with attribution
 */


// ========================================
// Task Manager Application
// ========================================

class TaskManager {
    constructor() {
        // Initialize tasks from localStorage or empty array
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentSort = 'date-asc';
        this.editingTaskId = null;
        
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Initial render
        this.render();
        
        // Load theme preference
        this.loadTheme();
    }
    
    // ========================================
    // DOM Element Caching
    // ========================================
    cacheElements() {
        // Form elements
        this.taskForm = document.getElementById('taskForm');
        this.taskTitle = document.getElementById('taskTitle');
        this.taskDescription = document.getElementById('taskDescription');
        this.taskDate = document.getElementById('taskDate');
        this.taskPriority = document.getElementById('taskPriority');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitBtnText = document.getElementById('submitBtnText');
        
        // Display elements
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        
        // Filter and sort elements
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortBy');
        
        // Stats elements
        this.totalCount = document.getElementById('totalCount');
        this.pendingCount = document.getElementById('pendingCount');
        this.completedCount = document.getElementById('completedCount');
        
        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');
    }
    
    // ========================================
    // Event Listeners
    // ========================================
    initEventListeners() {
        // Form submission
        this.taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
        
        // Sort select
        this.sortSelect.addEventListener('change', (e) => this.handleSort(e));
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    // ========================================
    // LocalStorage Operations
    // ========================================
    loadTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }
    
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    loadTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            this.themeToggle.querySelector('.theme-icon').textContent = '☀️';
        }
    }
    
    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }
    
    // ========================================
    // Theme Toggle
    // ========================================
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        this.themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
        this.saveTheme(isDark ? 'dark' : 'light');
    }
    
    // ========================================
    // Task CRUD Operations
    // ========================================
    
    // Create a new task
    createTask(taskData) {
        const task = {
            id: Date.now().toString(),
            title: taskData.title.trim(),
            description: taskData.description.trim(),
            dueDate: taskData.dueDate,
            priority: taskData.priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task); // Add to beginning
        this.saveTasks();
        this.render();
        this.resetForm();
    }
    
    // Update an existing task
    updateTask(id, taskData) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title: taskData.title.trim(),
                description: taskData.description.trim(),
                dueDate: taskData.dueDate,
                priority: taskData.priority,
                updatedAt: new Date().toISOString()
            };
            this.saveTasks();
            this.render();
            this.resetForm();
        }
    }
    
    // Delete a task
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }
    
    // Toggle task completion status
    toggleTaskCompletion(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }
    
    // Prepare task for editing
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            this.taskTitle.value = task.title;
            this.taskDescription.value = task.description;
            this.taskDate.value = task.dueDate;
            this.taskPriority.value = task.priority;
            this.submitBtnText.textContent = 'Update Task';
            this.submitBtn.classList.add('editing');
            
            // Scroll to form
            this.taskForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.taskTitle.focus();
        }
    }
    
    // ========================================
    // Form Handling
    // ========================================
    handleSubmit(e) {
        e.preventDefault();
        
        const taskData = {
            title: this.taskTitle.value,
            description: this.taskDescription.value,
            dueDate: this.taskDate.value,
            priority: this.taskPriority.value
        };
        
        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, taskData);
            this.editingTaskId = null;
        } else {
            this.createTask(taskData);
        }
    }
    
    resetForm() {
        this.taskForm.reset();
        this.editingTaskId = null;
        this.submitBtnText.textContent = 'Add Task';
        this.submitBtn.classList.remove('editing');
    }
    
    // ========================================
    // Filtering
    // ========================================
    handleFilter(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;
        
        // Update active button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.render();
    }
    
    filterTasks(tasks) {
        switch (this.currentFilter) {
            case 'completed':
                return tasks.filter(t => t.completed);
            case 'pending':
                return tasks.filter(t => !t.completed);
            default:
                return tasks;
        }
    }
    
    // ========================================
    // Sorting
    // ========================================
    handleSort(e) {
        this.currentSort = e.target.value;
        this.render();
    }
    
    sortTasks(tasks) {
        const sorted = [...tasks];
        
        switch (this.currentSort) {
            case 'date-asc':
                return sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
            
            case 'date-desc':
                return sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(b.dueDate) - new Date(a.dueDate);
                });
            
            case 'priority-high':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            
            case 'priority-low':
                const priorityOrderLow = { high: 3, medium: 2, low: 1 };
                return sorted.sort((a, b) => priorityOrderLow[a.priority] - priorityOrderLow[b.priority]);
            
            default:
                return sorted;
        }
    }
    
    // ========================================
    // Statistics
    // ========================================
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.pendingCount.textContent = pending;
    }
    
    // ========================================
    // Rendering
    // ========================================
    render() {
        // Update statistics
        this.updateStats();
        
        // Get filtered and sorted tasks
        let tasksToDisplay = this.filterTasks(this.tasks);
        tasksToDisplay = this.sortTasks(tasksToDisplay);
        
        // Clear task list
        this.taskList.innerHTML = '';
        
        // Show/hide empty state
        if (tasksToDisplay.length === 0) {
            this.emptyState.classList.add('show');
            this.taskList.style.display = 'none';
        } else {
            this.emptyState.classList.remove('show');
            this.taskList.style.display = 'flex';
            
            // Render each task
            tasksToDisplay.forEach(task => {
                const taskElement = this.createTaskElement(task);
                this.taskList.appendChild(taskElement);
            });
        }
    }
    
    // Create task card element
    createTaskElement(task) {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card priority-${task.priority}${task.completed ? ' completed' : ''}`;
        
        // Check if task is overdue
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        
        taskCard.innerHTML = `
            <div class="task-header">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    data-id="${task.id}"
                >
                <div class="task-content">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                    
                    <div class="task-meta">
                        ${task.dueDate ? `
                            <span class="task-date${isOverdue ? ' overdue' : ''}">
                                📅 ${this.formatDate(task.dueDate)}
                                ${isOverdue ? ' (Overdue)' : ''}
                            </span>
                        ` : ''}
                        <span class="task-priority ${task.priority}">
                            ${this.getPriorityIcon(task.priority)} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                    </div>
                    
                    <div class="task-actions">
                        <button class="task-btn edit-btn" data-id="${task.id}">
                            ✏️ Edit
                        </button>
                        <button class="task-btn delete-btn" data-id="${task.id}">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        const checkbox = taskCard.querySelector('.task-checkbox');
        const editBtn = taskCard.querySelector('.edit-btn');
        const deleteBtn = taskCard.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => this.toggleTaskCompletion(task.id));
        editBtn.addEventListener('click', () => this.editTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        
        return taskCard;
    }
    
    // ========================================
    // Utility Functions
    // ========================================
    
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Reset time for comparison
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        
        if (compareDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (compareDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
    }
    
    // Get priority icon
    getPriorityIcon(priority) {
        const icons = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };
        return icons[priority] || '⚪';
    }
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ========================================
// Initialize Application
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const app = new TaskManager();
    
    // Make app globally accessible for debugging (optional)
    window.taskManager = app;
});
