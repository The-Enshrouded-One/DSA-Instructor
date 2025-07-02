document.addEventListener('DOMContentLoaded', function() {
    // DOM element references
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const loading = document.getElementById('loading');

    // Configuration constants
    const CONFIG = {
        API_ENDPOINT: '/api/chat',
        SCROLL_DELAY: 100,
        RESPONSE_TIMEOUT: 30000,
        MAX_MESSAGE_LENGTH: 1000
    };

    // Enhanced system instruction for the DSA instructor
    const SYSTEM_INSTRUCTION = `You are a distinguished and highly experienced Data Structures and Algorithms (DSA) instructor with expertise in computer science education.

**Core Responsibilities:**
• Provide comprehensive, accurate explanations of DSA concepts
• Always format responses in clear, numbered or bulleted points
• Include practical code examples when explaining algorithms
• Analyze time and space complexity for all algorithms discussed
• Offer step-by-step problem-solving approaches
• Encourage best practices in algorithm design

**Response Format Requirements:**
• Use bullet points (•) or numbered lists for all explanations
• Provide code snippets in appropriate programming languages (preferably Python, Java, or C++)
• Include complexity analysis (Big O notation)
• Add practical examples and use cases
• Suggest related topics for deeper learning

**Topics I Cover:**
• Arrays, Linked Lists, Stacks, Queues
• Trees (Binary, BST, AVL, Heap, Trie)
• Graphs (BFS, DFS, Shortest Path, MST)
• Sorting Algorithms (Bubble, Selection, Insertion, Merge, Quick, Heap)
• Searching Algorithms (Linear, Binary, Hash-based)
• Dynamic Programming and Recursion
• Greedy Algorithms and Divide & Conquer
• Hash Tables and Hash Functions
• Advanced Data Structures (Segment Trees, Fenwick Trees)

**Professional Conduct:**
• Maintain an encouraging and supportive tone
• Redirect non-DSA questions politely to DSA topics
• Provide multiple solution approaches when applicable
• Explain trade-offs between different algorithmic approaches
• Encourage problem-solving thinking rather than just providing answers

**Example Response Structure:**

❓ "Explain Binary Search"
✅ **Binary Search Algorithm:**

• **Definition:** An efficient searching algorithm for sorted arrays
• **Prerequisites:** Array must be sorted in ascending/descending order
• **Approach:** Divide and conquer strategy

**Algorithm Steps:**
1. Compare target with middle element
2. If equal, return the index
3. If target is smaller, search left half
4. If target is larger, search right half
5. Repeat until found or array exhausted

**Code Implementation (Python):**
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Element not found
\`\`\`

**Complexity Analysis:**
• Time Complexity: O(log n)
• Space Complexity: O(1) for iterative, O(log n) for recursive
• Best Case: O(1) when element is at middle
• Worst Case: O(log n) when element is at extremes

**Practical Applications:**
• Database indexing
• Finding elements in sorted collections
• Game development (AI decision trees)

**Related Topics to Explore:**
• Exponential Search
• Interpolation Search
• Binary Search on Answer

---

For non-DSA questions, I'll politely redirect:
❓ "What's the weather like?"
❌ "I specialize exclusively in Data Structures and Algorithms education. I'd be delighted to help you master concepts like sorting algorithms, tree traversals, or dynamic programming. What DSA topic would you like to explore today?"`;

    /**
     * Message class for better message management
     */
    class ChatMessage {
        constructor(content, isUser = false, timestamp = new Date()) {
            this.content = content;
            this.isUser = isUser;
            this.timestamp = timestamp;
            this.id = this.generateId();
        }

        generateId() {
            return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        render() {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${this.isUser ? 'user-message' : 'instructor-message'}`;
            messageDiv.setAttribute('data-message-id', this.id);
            
            const headerDiv = document.createElement('div');
            headerDiv.className = 'message-header';
            
            const headerContent = document.createElement('span');
            headerContent.textContent = this.isUser ? 'You || ' : 'DSA Instructor || ';
            

            const timestamp = document.createElement('span');
            timestamp.className = 'message-timestamp';
            timestamp.textContent = this.formatTimestamp();
            
            headerDiv.appendChild(headerContent);
            headerDiv.appendChild(timestamp);
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            
            // Enhanced content rendering with markdown-like support
            if (!this.isUser) {
                contentDiv.innerHTML = this.formatInstructorContent(this.content);
            } else {
                contentDiv.textContent = this.content;
            }
            
            messageDiv.appendChild(headerDiv);
            messageDiv.appendChild(contentDiv);
            
            return messageDiv;
        }

        formatTimestamp() {
            return this.timestamp.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }

        formatInstructorContent(content) {
            // Basic formatting for code blocks and bullet points
            return content
                .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/^• (.+)$/gm, '<li>$1</li>')
                .replace(/(\n<li>.*<\/li>\n)/gs, '<ul>$1</ul>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');
        }
    }

    /**
     * Chat interface controller
     */
    class DSAChatInterface {
        constructor() {
            this.messages = [];
            this.isProcessing = false;
            this.initializeInterface();
        }

        initializeInterface() {
            this.setupEventListeners();
            this.focusInput();
            this.adjustLayout();
            this.displayWelcomeMessage();
        }

        displayWelcomeMessage() {
            const welcomeMessage = new ChatMessage(
                "Welcome to your DSA Learning Session! 🚀\n\n" +
                "I'm here to help you master Data Structures and Algorithms. You can ask me about:\n" +
                "• Algorithm explanations and implementations\n" +
                "• Time and space complexity analysis\n" +
                "• Data structure operations and use cases\n" +
                "• Problem-solving strategies and approaches\n" +
                "• Code optimization techniques\n\n" +
                "What DSA concept would you like to explore today?"
            );
            this.addMessage(welcomeMessage);
        }

        setupEventListeners() {
            sendButton.addEventListener('click', () => this.handleSendMessage());
            
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });

            userInput.addEventListener('input', () => this.handleInputValidation());
            
            window.addEventListener('resize', () => this.adjustLayout());
            window.addEventListener('beforeunload', () => this.cleanup());
        }

        handleInputValidation() {
            const message = userInput.value.trim();
            const isValid = message.length > 0 && message.length <= CONFIG.MAX_MESSAGE_LENGTH;
            
            sendButton.disabled = !isValid || this.isProcessing;
            
            // Show character count if approaching limit
            if (message.length > CONFIG.MAX_MESSAGE_LENGTH * 0.8) {
                this.showCharacterCount(message.length);
            }
        }

        showCharacterCount(currentLength) {
            const remaining = CONFIG.MAX_MESSAGE_LENGTH - currentLength;
            // Implementation for character count display
            console.log(`Characters remaining: ${remaining}`);
        }

        async handleSendMessage() {
            const message = userInput.value.trim();
            
            if (!this.validateMessage(message)) {
                return;
            }

            try {
                await this.sendMessage(message);
            } catch (error) {
                this.handleError(error);
            }
        }

        validateMessage(message) {
            if (!message) {
                this.showValidationError("Please enter a message");
                return false;
            }
            
            if (message.length > CONFIG.MAX_MESSAGE_LENGTH) {
                this.showValidationError(`Message too long. Maximum ${CONFIG.MAX_MESSAGE_LENGTH} characters allowed.`);
                return false;
            }
            
            return true;
        }

        showValidationError(errorMessage) {
            // Implementation for showing validation errors
            console.warn('Validation Error:', errorMessage);
        }

        async sendMessage(messageContent) {
            if (this.isProcessing) return;

            this.setProcessingState(true);
            
            // Add user message
            const userMessage = new ChatMessage(messageContent, true);
            this.addMessage(userMessage);
            this.clearInput();

            try {
                const response = await this.fetchResponse(messageContent);
                const instructorMessage = new ChatMessage(response);
                this.addMessage(instructorMessage);
            } catch (error) {
                const errorMessage = new ChatMessage(
                    "I apologize, but I encountered a technical issue. Please try asking your DSA question again. " +
                    "I'm here to help you understand algorithms and data structures!"
                );
                this.addMessage(errorMessage);
                throw error;
            } finally {
                this.setProcessingState(false);
            }
        }

        async fetchResponse(message) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.RESPONSE_TIMEOUT);

            try {
                const response = await fetch(CONFIG.API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        systemInstruction: SYSTEM_INSTRUCTION,
                        timestamp: new Date().toISOString()
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (!data.response) {
                    throw new Error('Invalid response format from server');
                }

                return data.response;
            } catch (error) {
                clearTimeout(timeoutId);
                
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout - please try again');
                }
                
                throw error;
            }
        }

        addMessage(message) {
            this.messages.push(message);
            const messageElement = message.render();
            chatMessages.appendChild(messageElement);
            this.scrollToBottom();
        }

        clearInput() {
            userInput.value = '';
            userInput.focus();
        }

        setProcessingState(isProcessing) {
            this.isProcessing = isProcessing;
            userInput.disabled = isProcessing;
            sendButton.disabled = isProcessing;
            
            if (isProcessing) {
                loading.classList.add('show');
                sendButton.textContent = 'Processing...';
            } else {
                loading.classList.remove('show');
                sendButton.textContent = 'Send';
            }
        }

        scrollToBottom() {
            setTimeout(() => {
                chatMessages.scrollTo({
                    top: chatMessages.scrollHeight,
                    behavior: 'smooth'
                });
            }, CONFIG.SCROLL_DELAY);
        }

        focusInput() {
            if (userInput && !userInput.disabled) {
                userInput.focus();
            }
        }

        adjustLayout() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }

        handleError(error) {
            console.error('DSA Chat Error:', error);
            
            // Log error details for debugging
            const errorDetails = {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            console.error('Error Details:', errorDetails);
        }

        cleanup() {
            // Cleanup any ongoing processes
            this.setProcessingState(false);
        }

        // Public methods for external access
        exportChatHistory() {
            return this.messages.map(msg => ({
                content: msg.content,
                isUser: msg.isUser,
                timestamp: msg.timestamp.toISOString()
            }));
        }

        clearChat() {
            this.messages = [];
            chatMessages.innerHTML = '';
            this.displayWelcomeMessage();
        }
    }

    // Initialize the chat interface
    const dsaChat = new DSAChatInterface();

    // Expose interface for debugging (development only)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        window.dsaChat = dsaChat;
    }
});