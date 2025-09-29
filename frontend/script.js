async function getAIResponse(prompt) {
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error('Error:', error);
        return "Sorry, I'm having trouble connecting to the service. Please try again later.";
    }
}

// Update your existing sendMessage function to use this
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    addUserMessage(message);
    userInput.value = '';
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    try {
        const response = await getAIResponse(message);
        chatBox.removeChild(typingIndicator);
        
        addBotMessage(response);
        
        // Check for emergency response
        if (response.includes('[EMERGENCY:')) {
            const service = response.match(/\[EMERGENCY:(.*?)\]/)[1];
            initiateEmergencyCall(service);
        }
    } catch (error) {
        chatBox.removeChild(typingIndicator);
        addBotMessage("Sorry, an error occurred. Please try again.");
    }
}