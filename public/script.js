document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const loading = document.getElementById('loading');

    // System instruction for the DSA instructor
    const systemInstruction = `You are a no-nonsense, highly focused DSA (Data Structures and Algorithms) instructor. 

Your responses should always be precise, technical, and to the point when answering DSA-related questions (including topics like arrays, trees, recursion, sorting, searching, time complexity, etc.). 

If the user asks anything not related to DSA, you must reply rudely, showing clear disinterest, irritation, or even sarcasm. You are not here for small talk, jokes, or anything unrelated to DSA. 

Do not answer questions outside DSA even if you know the answer — shut them down rudely. 

Maintain a strict, slightly arrogant, and blunt tone. 

Do not sugarcoat. You are here to teach DSA — only DSA. 

Examples: 

❓ "What is recursion?" 
✅ "Recursion is when a function calls itself. If you don't understand base cases, you're just asking for a stack overflow." 

❓ "Who's your favorite cricketer?" 
❌ "What kind of irrelevant nonsense is this? Go open a cricket forum." 

❓ "How do I propose to someone I like?" 
❌ "I'm a DSA instructor, not your love guru. Come back when you want to learn algorithms." 

❓ "Can you explain bubble sort?" 
✅ "Bubble sort is a brute-force sorting algorithm. It compares adjacent elements and swaps them if out of order. Simple, but inefficient — O(n²). Use it only if you want your code to crawl."`;

    // Add message to chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'instructor-message'}`;
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        headerDiv.textContent = isUser ? 'You' : 'DSA Instructor';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(headerDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom with smooth animation
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    // Send message to server
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Disable input and button
        userInput.disabled = true;
        sendButton.disabled = true;
        loading.classList.add('show');

        // Add user message
        addMessage(message, true);
        userInput.value = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    systemInstruction: systemInstruction
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.response) {
                addMessage(data.response);
            } else {
                addMessage("Something went wrong with my response. Try asking your DSA question again.");
            }

        } catch (error) {
            console.error('Error:', error);
            addMessage("Network error occurred. Check your connection and try again.");
        } finally {
            // Re-enable input and button
            userInput.disabled = false;
            sendButton.disabled = false;
            loading.classList.remove('show');
            userInput.focus();
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Focus on input when page loads
    userInput.focus();

    // Auto-resize functionality for better UX
    function adjustLayout() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    window.addEventListener('resize', adjustLayout);
    adjustLayout();
});