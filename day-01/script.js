class Chatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Enable/disable send button based on input
        this.messageInput.addEventListener('input', () => {
            this.sendButton.disabled = !this.messageInput.value.trim();
        });
        
        // Initial state
        this.sendButton.disabled = true;
    }
    
    sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        this.sendButton.disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate bot response after delay
        setTimeout(() => {
            this.removeTypingIndicator();
            const botResponse = this.generateBotResponse(message);
            this.addMessage(botResponse, 'bot');
        }, 1000 + Math.random() * 1000);
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        this.chatMessages.appendChild(messageDiv);
        
        // Auto-scroll to bottom
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'message-content';
        typingContent.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
        
        typingDiv.appendChild(typingContent);
        this.chatMessages.appendChild(typingDiv);
        
        this.scrollToBottom();
    }
    
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Greeting patterns
        if (message.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
            return this.getRandomResponse([
                "Hello! How can I help you today?",
                "Hi there! What can I do for you?",
                "Hey! Nice to meet you! How may I assist you?",
                "Greetings! How can I be of service?"
            ]);
        }
        
        // Help patterns
        if (message.match(/^(help|what can you do|how can you help)/)) {
            return "I'm a simple chatbot that can respond to basic greetings, answer common questions, and have simple conversations. Try asking me about my name, how I'm doing, or tell me something about yourself!";
        }
        
        // Name patterns
        if (message.match(/what is your name|who are you|what's your name/)) {
            return this.getRandomResponse([
                "I'm a friendly chatbot assistant!",
                "You can call me ChatBot!",
                "I'm your virtual assistant, here to help!"
            ]);
        }
        
        // How are you patterns
        if (message.match(/how are you|how are you doing/)) {
            return this.getRandomResponse([
                "I'm doing great, thanks for asking!",
                "I'm functioning perfectly! How about you?",
                "All systems are running smoothly! How are you?"
            ]);
        }
        
        // Weather patterns
        if (message.match(/weather|rain|sunny|cloudy/)) {
            return "I don't have access to real-time weather data, but I hope the weather is nice where you are! You might want to check a weather app or website for current conditions.";
        }
        
        // Time patterns
        if (message.match(/what time|current time|time now/)) {
            return `The current time is ${this.getCurrentTime()}.`;
        }
        
        // Thank you patterns
        if (message.match(/thank you|thanks|thx/)) {
            return this.getRandomResponse([
                "You're welcome!",
                "Happy to help!",
                "My pleasure!",
                "No problem at all!"
            ]);
        }
        
        // Goodbye patterns
        if (message.match(/bye|goodbye|see you|farewell/)) {
            return this.getRandomResponse([
                "Goodbye! Have a great day!",
                "See you later! Take care!",
                "Bye! It was nice chatting with you!",
                "Farewell! Feel free to come back anytime!"
            ]);
        }
        
        // Question patterns
        if (message.match(/\?/)) {
            return "That's an interesting question! While I may not have the specific answer, I'm here to chat. Could you tell me more about what you're curious about?";
        }
        
        // Default responses for unrecognized input
        return this.getRandomResponse([
            "That's interesting! Tell me more.",
            "I see! What else would you like to discuss?",
            "Thanks for sharing! How else can I help you today?",
            "I'm processing what you said. Could you elaborate a bit?",
            "That's cool! What's on your mind?",
            "I'm here to chat! What would you like to talk about?"
        ]);
    }
    
    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${displayHours}:${displayMinutes} ${ampm}`;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}

// Add typing dots animation
const style = document.createElement('style');
style.textContent = `
    .typing-dots {
        display: inline-block;
    }
    
    .typing-dots span {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #6c757d;
        margin: 0 2px;
        animation: typing 1.4s infinite;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typing {
        0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
        }
        30% {
            transform: translateY(-10px);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});
