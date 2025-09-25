document.addEventListener('DOMContentLoaded', function () {
    // Set last updated date
    document.getElementById('lastUpdated').textContent = new Date().toLocaleString();

    // Initialize map
    initMap();

    // Initialize geolocation
    initGeolocation();

    // Initialize charts
    initCharts();

    // Mobile menu toggle
    document.querySelector('.mobile-menu-btn')?.addEventListener('click', function () {
        document.querySelector('.nav-links')?.classList.toggle('active');
    });

    // Initialize chatbot
    initChatbot();
    // Apply location-based accent
    setAccentByLocation();
});

function initGeolocation() {
    const locationBanner = document.getElementById('locationBanner');
    const locationElement = document.getElementById('detectedLocation');
    const accuracyElement = document.getElementById('locationAccuracy');

    if (!locationBanner || !locationElement || !accuracyElement) return;

    if (navigator.geolocation) {
        locationBanner.style.display = 'flex';

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                // Reverse geocoding to get location name
                fetchLocationName(lat, lng)
                    .then(locationName => {
                        locationElement.innerHTML = locationName;
                        accuracyElement.textContent = `±${Math.round(accuracy)} meters`;
                        addUserLocationMarker(lat, lng, accuracy, locationName);
                    })
                    .catch(error => {
                        console.error('Geocoding error:', error);
                        locationElement.innerHTML = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
                        accuracyElement.textContent = `±${Math.round(accuracy)} meters`;
                        addUserLocationMarker(lat, lng, accuracy);
                    });
            },
            function (error) {
                console.error('Geolocation error:', error);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        locationElement.textContent = "Location access denied";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        locationElement.textContent = "Location unavailable";
                        break;
                    case error.TIMEOUT:
                        locationElement.textContent = "Location request timed out";
                        break;
                    default:
                        locationElement.textContent = "Error getting location";
                }
                accuracyElement.textContent = "Enable location services for better experience";
            },
            options
        );
    } else {
        locationBanner.style.display = 'flex';
        locationElement.textContent = 'Geolocation not supported by your browser';
    }

    document.getElementById('closeBanner')?.addEventListener('click', function () {
        locationBanner.style.display = 'none';
    });
}

function fetchLocationName(lat, lng) {
    return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.address) {
                return data.address.city || data.address.town ||
                    data.address.village || data.address.county ||
                    `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            }
            return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        });
}

function initMap() {
    const mapElement = document.getElementById('disasterMap');
    if (!mapElement) return;

    window.map = L.map('disasterMap').setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(window.map);

    // Add disaster markers
    addDisasterMarkers();
}

async function setAccentByLocation() {
    try {
        if (!navigator.geolocation) return;
        await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 });
        }).then((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            // Simple rule: adjust blue hue based on latitude bands
            let hue = 210; // base blue
            if (lat > 25) hue = 215; // north slightly cooler blue
            if (lat < 15) hue = 205; // south slightly warmer blue
            const primary = `hsl(${hue}, 98%, 53%)`;
            const primaryLight = `hsla(${hue}, 98%, 53%, 0.12)`;
            document.documentElement.style.setProperty('--primary', primary);
            document.documentElement.style.setProperty('--primary-light', primaryLight);
            // Optional: accent tweak by longitude for subtle variety
            const accentHue = (hue + ((Math.round(lng) % 20) - 10)) % 360;
            document.documentElement.style.setProperty('--accent', `hsl(${accentHue}, 85%, 52%)`);
        }).catch(() => {});
    } catch (_) {}
}

function addUserLocationMarker(lat, lng, accuracy, name = 'Your location') {
    if (!window.map) return;

    // Create accuracy circle
    L.circle([lat, lng], {
        radius: accuracy,
        color: '#4a90e2',
        fillColor: '#4a90e2',
        fillOpacity: 0.1,
        weight: 1
    }).addTo(window.map);

    // Create custom user icon
    const userIcon = L.divIcon({
        className: 'user-location-icon',
        html: '<div style="color: #4a90e2; font-size: 20px;">📍</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    // Add user marker
    L.marker([lat, lng], {
        icon: userIcon,
        zIndexOffset: 1000
    }).addTo(window.map).bindPopup(`
        <strong>${name}</strong><br>
        Your current location<br>
        Accuracy: ±${Math.round(accuracy)} meters
    `).openPopup();

    // Adjust map view
    window.map.setView([lat, lng], 13);
}

function addDisasterMarkers() {
    if (!window.map) return;

    const disasters = [
        { type: 'flood', lat: 26.2006, lng: 92.9376, severity: 'high', title: 'Assam Floods 2024' },
        { type: 'earthquake', lat: 30.3753, lng: 79.4636, severity: 'medium', title: 'Uttarakhand Earthquake' },
        { type: 'cyclone', lat: 15.9129, lng: 80.4676, severity: 'high', title: 'Andhra Pradesh Cyclone' }
    ];

    disasters.forEach(disaster => {
        const marker = L.circleMarker([disaster.lat, disaster.lng], {
            radius: disaster.severity === 'high' ? 10 : 7,
            fillColor: getDisasterColor(disaster.type),
            color: '#fff',
            weight: 1,
            fillOpacity: 0.8
        }).addTo(window.map);

        marker.bindPopup(`
            <strong>${disaster.title}</strong><br>
            Type: ${disaster.type}<br>
            Severity: ${disaster.severity}
        `);
    });
}

function getDisasterColor(type) {
    const colors = {
        flood: '#ff6b6b',
        earthquake: '#feca57',
        cyclone: '#ff9ff3'
    };
    return colors[type] || '#4a90e2';
}

function initCharts() {
    // Disaster Frequency Chart
    const freqCtx = document.getElementById('disasterFrequencyChart')?.getContext('2d');
    if (freqCtx) {
        new Chart(freqCtx, {
            type: 'bar',
            data: {
                labels: ['Floods', 'Earthquakes', 'Cyclones', 'Droughts', 'Landslides', 'Heat Waves'],
                datasets: [{
                    label: 'Number of Incidents (2023-2024)',
                    data: [42, 18, 9, 15, 27, 33],
                    backgroundColor: [
                        '#ff6b6b',
                        '#feca57',
                        '#ff9ff3',
                        '#1dd1a1',
                        '#f368e0',
                        '#ff9f43'
                    ],
                    borderColor: [
                        '#ff5252',
                        '#f39c12',
                        '#e056fd',
                        '#10ac84',
                        '#be2edd',
                        '#ff7f50'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    // Resource Allocation Chart
    const allocCtx = document.getElementById('resourceAllocationChart')?.getContext('2d');
    if (allocCtx) {
        new Chart(allocCtx, {
            type: 'doughnut',
            data: {
                labels: ['Food', 'Water', 'Medicine', 'Shelter', 'Clothing', 'Other'],
                datasets: [{
                    data: [35, 25, 20, 12, 5, 3],
                    backgroundColor: [
                        '#4a90e2',
                        '#50e3c2',
                        '#ff6b6b',
                        '#feca57',
                        '#ff9ff3',
                        '#1dd1a1'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%'
            }
        });
    }

    // Response Time Chart
    const responseCtx = document.getElementById('responseTimeChart')?.getContext('2d');
    if (responseCtx) {
        new Chart(responseCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Average Response Time (hours)',
                    data: [48, 42, 36, 30, 28, 24, 22, 20, 18, 16, 14, 12],
                    fill: true,
                    backgroundColor: 'rgba(74, 144, 226, 0.2)',
                    borderColor: '#4a90e2',
                    tension: 0.4,
                    pointBackgroundColor: '#4a90e2',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Population Trend Chart
    const popCtx = document.getElementById('populationTrendChart')?.getContext('2d');
    if (popCtx) {
        new Chart(popCtx, {
            type: 'bar',
            data: {
                labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [{
                    label: 'Affected Population (millions)',
                    data: [5.2, 6.8, 7.5, 8.2, 9.1, 4.7],
                    backgroundColor: '#50e3c2',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function initChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotToggle = document.querySelector('.chatbot-toggle-btn');
    const chatbotClose = document.querySelector('.chatbot-close-btn');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');

    if (!chatbotContainer || !chatbotToggle || !chatbotClose || !chatbotMessages || !chatbotInput || !chatbotSend) return;

    // Toggle chatbot visibility
    chatbotToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        chatbotContainer.classList.toggle('active');
    });

    chatbotClose.addEventListener('click', function () {
        chatbotContainer.classList.remove('active');
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
        if (!chatbotContainer.contains(e.target) && e.target !== chatbotToggle) {
            chatbotContainer.classList.remove('active');
        }
    });

    // Send message function
    async function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatbotInput.value = '';
        showTypingIndicator();

        try {
            // Get response from backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    location: document.getElementById('detectedLocation')?.textContent || 'Unknown'
                })
            });

            if (!response.ok) throw new Error('Network response failed');

            const data = await response.json();
            addMessage(data.reply, 'bot');

            // Show emergency alert if needed
            if (message.toLowerCase().includes('emergency') ||
                message.toLowerCase().includes('help')) {
                showEmergencyAlert();
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            addMessage("⚠️ Couldn't connect to server. For emergencies, call: Police(100), Fire(101), Ambulance(102)", 'bot');
        } finally {
            removeTypingIndicator();
        }
    }

    // Helper functions
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatbotMessages.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) indicator.remove();
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;
        messageDiv.textContent = text;
        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function showEmergencyAlert() {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'emergency-alert';
        alertDiv.textContent = "🚨 Emergency services have been notified!";
        chatbotMessages.appendChild(alertDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Event listeners
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Sample quick questions
    const quickQuestions = [
        "What to do in a flood?",
        "Earthquake safety tips",
        "Emergency contact numbers",
        "Report an emergency"
    ];

    // Add quick questions to chat
    quickQuestions.forEach(question => {
        const btn = document.createElement('button');
        btn.className = 'quick-question';
        btn.textContent = question;
        btn.addEventListener('click', function () {
            chatbotInput.value = question;
            sendMessage();
        });
        chatbotMessages.appendChild(btn);
    });

    // Welcome message
    setTimeout(function () {
        addMessage("Hello! I'm your disaster response assistant. How can I help you today?", 'bot');
    }, 1000);
}

const EMERGENCY_NUMBER = "911"; // change as needed

const emergencyButton = document.getElementById('emergencyButton');
const emergencyModal = document.getElementById('emergencyModal');
const confirmEmergency = document.getElementById('confirmEmergency');
const cancelEmergency = document.getElementById('cancelEmergency');
const locationStatus = document.getElementById('locationStatus');
const locationWarning = document.getElementById('locationWarning');
const refreshLocationBtn = document.getElementById('refreshLocation');

let userLocation = null;
let locationError = null;
let locationAccuracy = null;

emergencyButton.addEventListener('click', showEmergencyModal);
confirmEmergency.addEventListener('click', initiateEmergencyCall);
cancelEmergency.addEventListener('click', hideEmergencyModal);

function updateLocationUI() {
    if (userLocation) {
        locationStatus.textContent = `Your location will be shared: ${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}`;
        locationAccuracy = userLocation.accuracy;
        if (locationAccuracy && locationAccuracy > 100) {
            locationWarning.textContent = `Warning: Location accuracy is ±${Math.round(locationAccuracy)} meters. Enable GPS/location for best results.`;
            locationWarning.style.display = 'block';
            refreshLocationBtn.style.display = 'inline-block';
        } else {
            locationWarning.style.display = 'none';
            refreshLocationBtn.style.display = 'none';
        }
    } else if (locationError) {
        locationStatus.textContent = "Location access denied or unavailable. Please provide your location verbally.";
        locationWarning.style.display = 'none';
        refreshLocationBtn.style.display = 'inline-block';
    } else {
        locationStatus.textContent = "Attempting to get your location...";
        locationWarning.style.display = 'none';
        refreshLocationBtn.style.display = 'none';
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                locationError = null;
                updateLocationUI();
            },
            error => {
                userLocation = null;
                locationError = error.message;
                updateLocationUI();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        userLocation = null;
        locationError = "Geolocation not supported. Provide your location verbally.";
        updateLocationUI();
    }
}
getLocation();
refreshLocationBtn.addEventListener('click', getLocation);

function showEmergencyModal() {
    emergencyModal.style.display = 'flex';
    updateLocationUI();
}

function hideEmergencyModal() {
    emergencyModal.style.display = 'none';
}

function initiateEmergencyCall() {
    hideEmergencyModal();
    let locationMessage = '';
    if (userLocation) {
        const mapsLink = `https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`;
        locationMessage = `Emergency at location: ${mapsLink} (Lat: ${userLocation.latitude}, Long: ${userLocation.longitude}, Accuracy: ±${Math.round(locationAccuracy)}m)`;
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            const smsNumber = EMERGENCY_NUMBER.replace(/[^0-9]/g, '');
            window.open(`sms:${smsNumber}?body=${encodeURIComponent(locationMessage)}`, '_blank');
        }
    }
    window.open(`tel:${EMERGENCY_NUMBER}`, '_blank');
    if (!/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && userLocation) {
        alert(`Calling emergency services. Please provide this location: ${locationMessage}`);
    }
}

const chatBtn = document.getElementById("chat-btn");
const chatBox = document.getElementById("chat-box");
const messagesDiv = document.getElementById("messages");
const userInput = document.getElementById("user-input");

chatBtn.addEventListener("click", () => {
    chatBox.style.display = chatBox.style.display === "none" ? "flex" : "none";
});

function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.textContent = sender + ": " + text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value;
    if (!text) return;
    appendMessage("You", text);
    userInput.value = "";

    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
    });

    const data = await response.json();
    appendMessage("Bot", data.reply);
}

// Add predefined disaster-related quick question buttons below the chat
document.addEventListener('DOMContentLoaded', function () {
    if (!messagesDiv) return;
    const quickContainer = document.createElement('div');
    quickContainer.style.display = 'flex';
    quickContainer.style.flexWrap = 'wrap';
    quickContainer.style.gap = '6px';
    quickContainer.style.margin = '8px 0';
    const quickQuestions = [
        'What to do in a flood?',
        'Earthquake safety tips',
        'Cyclone preparedness checklist',
        'Landslide safety advice',
        'Heat wave precautions',
        'Emergency contact numbers'
    ];
    quickQuestions.forEach(q => {
        const btn = document.createElement('button');
        btn.textContent = q;
        btn.style.padding = '6px 8px';
        btn.style.borderRadius = '12px';
        btn.style.border = '1px solid #ddd';
        btn.style.background = '#f7f7f7';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
            userInput.value = q;
            sendMessage();
        });
        quickContainer.appendChild(btn);
    });
    messagesDiv.appendChild(quickContainer);
});
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
});
