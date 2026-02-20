// Get DOM elements
const taskInput = document.getElementById('taskInput');
const taskDateTime = document.getElementById('taskDateTime');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const toastContainer = document.getElementById('toastContainer');
const micBtn = document.getElementById('micBtn');

// Initialize tasks from localStorage or empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Current filter state
let currentFilter = 'all';

// Web Speech API setup
const synth = window.speechSynthesis;

// Speech Recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;
let baseText = ''; // Store the text before starting recognition

// Initialize speech recognition if available
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening until stopped
    recognition.interimResults = true; // Show interim results in real-time
    recognition.lang = 'en-US'; // Set language to English
    
    // Handle recognition results
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results since the last event
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update base text with final transcripts
        if (finalTranscript) {
            baseText += finalTranscript;
        }
        
        // Update input field with base text + interim results in real-time
        taskInput.value = (baseText + interimTranscript).trim();
    };
    
    // Handle recognition errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isRecording = false;
        micBtn.classList.remove('recording');
        
        if (event.error === 'no-speech') {
            showToast('No speech detected. Try again!', 'error');
            speakText('No speech detected. Please try again');
        } else if (event.error === 'network') {
            showToast('Network error. Please check your connection.', 'error');
        } else if (event.error === 'not-allowed') {
            showToast('Microphone permission denied. Please allow microphone access.', 'error');
            speakText('Microphone permission denied. Please allow microphone access');
        } else {
            showToast('Speech recognition error. Please try again.', 'error');
        }
    };
    
    // Handle recognition end
    recognition.onend = () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        // Update final value
        taskInput.value = baseText.trim();
    };
} else {
    // Browser doesn't support speech recognition
    if (micBtn) {
        micBtn.style.display = 'none';
    }
    console.warn('Speech recognition not supported in this browser');
}

// Load and render tasks on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set default date/time to now
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    taskDateTime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // Speak greeting on page load
    const greeting = getGreeting();
    speakText(greeting);
    
    renderTasks();
});

// Filter button event listeners
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Set current filter
        const filterType = btn.getAttribute('data-filter');
        currentFilter = filterType;
        
        // Speak filter change
        const filterMessages = {
            'all': 'Showing all tasks',
            'active': 'Showing active tasks',
            'completed': 'Showing completed tasks'
        };
        speakText(filterMessages[filterType] || 'Filter changed');
        
        // Re-render tasks
        renderTasks();
    });
});

// Add task when button is clicked
addTaskBtn.addEventListener('click', addTask);

// Add task when Enter key is pressed
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Microphone button click handler
if (micBtn && recognition) {
    micBtn.addEventListener('click', toggleSpeechRecognition);
}

// Function to toggle speech recognition
function toggleSpeechRecognition() {
    if (!recognition) {
        showToast('Speech recognition not supported in this browser', 'error');
        return;
    }
    
    if (isRecording) {
        // Stop recording
        recognition.stop();
        isRecording = false;
        micBtn.classList.remove('recording');
        showToast('Recording stopped', 'info');
        speakText('Recording stopped');
    } else {
        // Start recording
        try {
            // Store current input value as base text
            baseText = taskInput.value.trim() + (taskInput.value.trim() ? ' ' : '');
            
            recognition.start();
            isRecording = true;
            micBtn.classList.add('recording');
            showToast('Listening... Speak now!', 'info');
            speakText('Recording started. Please speak now');
        } catch (error) {
            console.error('Error starting recognition:', error);
            showToast('Error starting speech recognition', 'error');
            isRecording = false;
            micBtn.classList.remove('recording');
        }
    }
}

// Function to show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Function to speak text using Web Speech API
function speakText(text) {
    if (synth && synth.speak) {
        // Cancel any ongoing speech
        synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        synth.speak(utterance);
    }
}

// Function to get greeting based on time of day
function getGreeting() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
        return 'Good morning mam';
    } else if (hour >= 12 && hour < 17) {
        return 'Good afternoon mam';
    } else if (hour >= 17 && hour < 22) {
        return 'Good evening mam';
    } else {
        return 'Good night mam';
    }
}

// Function to format date and time for display
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    let dateStr = date.toLocaleDateString('en-US', options);
    
    // Add relative time indicator
    if (diffDays === 0) {
        dateStr += ' (Today)';
    } else if (diffDays === 1) {
        dateStr += ' (Tomorrow)';
    } else if (diffDays === -1) {
        dateStr += ' (Yesterday)';
    } else if (diffDays > 0) {
        dateStr += ` (In ${diffDays} days)`;
    } else {
        dateStr += ` (${Math.abs(diffDays)} days ago)`;
    }
    
    return dateStr;
}

// Function to add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    const taskDate = taskDateTime.value;
    
    // Validate input
    if (taskText === '') {
        showToast('Please enter a task!', 'error');
        speakText('Please enter a task');
        return;
    }
    
    // Create new task object
    const newTask = {
        id: Date.now(), // Unique ID using timestamp
        text: taskText,
        completed: false,
        dateTime: taskDate || null
    };
    
    // Add task to array
    tasks.push(newTask);
    
    // Save to localStorage
    saveTasks();
    
    // Clear input field
    taskInput.value = '';
    
    // Show toast notification
    showToast('Task added successfully!', 'success');
    
    // Speak confirmation using Web Speech API
    speakText('Task added successfully');
    
    // Render updated task list
    renderTasks();
}

// Function to delete a task
function deleteTask(taskId) {
    // Get task text before deleting for speech
    const task = tasks.find(t => t.id === taskId);
    const taskText = task ? task.text : 'task';
    
    // Filter out the task with matching ID
    tasks = tasks.filter(task => task.id !== taskId);
    
    // Save to localStorage
    saveTasks();
    
    // Show toast notification
    showToast('Task deleted successfully!', 'success');
    
    // Speak confirmation using Web Speech API
    speakText(`Task deleted successfully. ${taskText} has been removed`);
    
    // Render updated task list
    renderTasks();
}

// Function to toggle task completion status
function toggleTask(taskId) {
    // Find task and toggle completed status
    let message = '';
    let taskText = '';
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            taskText = task.text;
            const updatedTask = { ...task, completed: !task.completed };
            
            // Show toast notification and prepare speech message
            if (updatedTask.completed) {
                showToast('Task marked as completed!', 'success');
                message = `Task marked as completed. ${taskText} is now done`;
            } else {
                showToast('Task marked as active!', 'info');
                message = `Task marked as active. ${taskText} is now active`;
            }
            
            return updatedTask;
        }
        return task;
    });
    
    // Save to localStorage
    saveTasks();
    
    // Speak confirmation using Web Speech API
    speakText(message);
    
    // Render updated task list
    renderTasks();
}

// Function to edit a task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Find the task item in DOM
    const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskItem) return;
    
    // Get current text and date
    const taskTextElement = taskItem.querySelector('.task-text');
    const taskDateElement = taskItem.querySelector('.task-date-time');
    
    // Create input for editing text
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = task.text;
    
    // Create input for editing date/time
    const editDateInput = document.createElement('input');
    editDateInput.type = 'datetime-local';
    editDateInput.className = 'task-edit-input';
    editDateInput.value = task.dateTime || '';
    
    // Replace text with input
    const textContainer = taskItem.querySelector('.task-text-container');
    textContainer.innerHTML = '';
    
    const newTextDiv = document.createElement('div');
    newTextDiv.style.display = 'flex';
    newTextDiv.style.flexDirection = 'column';
    newTextDiv.style.gap = '8px';
    newTextDiv.style.flex = '1';
    
    newTextDiv.appendChild(editInput);
    newTextDiv.appendChild(editDateInput);
    
    textContainer.appendChild(newTextDiv);
    
    // Focus on input
    editInput.focus();
    editInput.select();
    
    // Save function
    const saveEdit = () => {
        const newText = editInput.value.trim();
        const newDateTime = editDateInput.value;
        
        if (newText === '') {
            showToast('Task text cannot be empty!', 'error');
            speakText('Task text cannot be empty');
            renderTasks();
            return;
        }
        
        // Update task
        tasks = tasks.map(t => {
            if (t.id === taskId) {
                return { ...t, text: newText, dateTime: newDateTime || null };
            }
            return t;
        });
        
        // Save to localStorage
        saveTasks();
        
        // Show toast notification
        showToast('Task updated successfully!', 'success');
        
        // Speak confirmation using Web Speech API
        speakText(`Task updated successfully. ${newText} has been updated`);
        
        // Render updated task list
        renderTasks();
    };
    
    // Cancel function
    const cancelEdit = () => {
        renderTasks();
    };
    
    // Save on Enter key
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
    
    editDateInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
    
    // Save on blur
    editInput.addEventListener('blur', saveEdit);
    editDateInput.addEventListener('blur', saveEdit);
}

// Function to get filtered tasks
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Function to render all tasks
function renderTasks() {
    // Clear current list
    taskList.innerHTML = '';
    
    // Get filtered tasks
    const filteredTasks = getFilteredTasks();
    
    // Show empty state if no tasks
    if (filteredTasks.length === 0) {
        const emptyMessage = currentFilter === 'all' 
            ? 'No tasks yet. Add one above!'
            : currentFilter === 'active'
            ? 'No active tasks!'
            : 'No completed tasks!';
        taskList.innerHTML = `<li class="empty-state">${emptyMessage}</li>`;
        return;
    }
    
    // Sort tasks: incomplete first, then by date
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        if (a.dateTime && b.dateTime) {
            return new Date(a.dateTime) - new Date(b.dateTime);
        }
        if (a.dateTime) return -1;
        if (b.dateTime) return 1;
        return 0;
    });
    
    // Create and append each task item
    sortedTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.setAttribute('data-task-id', task.id);
        
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));
        
        // Create task text container
        const textContainer = document.createElement('div');
        textContainer.className = 'task-text-container';
        
        // Create task text
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        // Create date/time display
        const taskDateTime = document.createElement('span');
        taskDateTime.className = 'task-date-time';
        taskDateTime.textContent = task.dateTime ? formatDateTime(task.dateTime) : '';
        
        textContainer.appendChild(taskText);
        if (task.dateTime) {
            textContainer.appendChild(taskDateTime);
        }
        
        // Create action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'task-actions';
        
        // Create edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editTask(task.id));
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        actionsContainer.appendChild(editBtn);
        actionsContainer.appendChild(deleteBtn);
        
        // Append elements to task item
        taskItem.appendChild(checkbox);
        taskItem.appendChild(textContainer);
        taskItem.appendChild(actionsContainer);
        
        // Append task item to list
        taskList.appendChild(taskItem);
    });
}

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}