const chatBody = document.getElementById('chat-body');
const chatScreen = document.getElementById('chat-screen');

let currentLanguage = 'en';

const translations = {
    en: {
        greeting: "Hello, I am your SkyHigh Airlines assistant. ✈️<br><br>I'm here to help you rebook or get a refund using AI-powered analysis of real-time data to find the best recommendations for you.<br><br>We apologize to inform you that the flight SH102 has been cancelled.",
        details: "Here are your flight details:<br><strong>PNR:</strong> XJ92KL<br><strong>Passenger:</strong> Jean-Pierre Dubois<br><strong>Flight:</strong> SH102 (CDG - LHR)<br><strong>Date:</strong> {date}<br><strong>Time:</strong> 10:00",
        options_text: "How would you like to proceed?",
        option_next: "Rebook on next available flight",
        option_other: "View other flight options",
        option_refund: "Request a full refund",
        lang_select: "Change Language / Changer la langue",
        processing: "Excellent choice. I'm processing that for you right now. Please wait a moment...",
        status_header: "Rebooking Status",
        req_received: "Request Received",
        req_received_desc: "We have received your rebooking choice.",
        processing_approval: "Processing Approval",
        processing_desc: "Waiting for manager approval.",
        est_time: "Est. 15 mins",
        confirmation: "Confirmation",
        confirmation_desc: "Ticket issuance.",
        change_req: "Change Request",
        req_cancelled: "Request #{id} has been cancelled.",
        lang_changed: "Language changed to English. Restarting chat...",
        change_req_user: "Change Request"
    },
    fr: {
        greeting: "Bonjour, je suis votre assistant SkyHigh Airlines. ✈️<br><br>Je suis là pour vous aider à réserver de nouveau ou à obtenir un remboursement grâce à une analyse IA des données en temps réel pour trouver les meilleures recommandations.<br><br>Je vois que votre vol SH102 pour Londres a été annulé.",
        details: "Voici les détails de votre vol :<br><strong>PNR :</strong> XJ92KL<br><strong>Passager :</strong> Jean-Pierre Dubois<br><strong>Vol :</strong> SH102 (CDG - LHR)<br><strong>Date :</strong> {date}<br><strong>Heure :</strong> 10:00",
        options_text: "Comment souhaitez-vous procéder ?",
        option_next: "Réserver le prochain vol disponible",
        option_other: "Voir d'autres options de vol",
        option_refund: "Demander un remboursement complet",
        lang_select: "Change Language / Changer la langue",
        processing: "Excellent choix. Je traite cela pour vous en ce moment. Veuillez patienter un instant...",
        status_header: "Statut de la réservation",
        req_received: "Demande reçue",
        req_received_desc: "Nous avons bien reçu votre choix de modification.",
        processing_approval: "Traitement en cours",
        processing_desc: "En attente de l'approbation du responsable.",
        est_time: "Est. 15 min",
        confirmation: "Confirmation",
        confirmation_desc: "Émission du billet.",
        change_req: "Modifier la demande",
        req_cancelled: "La demande #{id} a été annulée.",
        lang_changed: "Langue changée en Français. Redémarrage du chat...",
        change_req_user: "Modifier la demande"
    }
};

// Helper to get text
function t(key, params = {}) {
    let text = translations[currentLanguage][key] || key;
    for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, v);
    }
    return text;
}
function generateRandomPNR() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pnr = "";
    for (let i = 0; i < 6; i++) {
        pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
}

// Helper to get current time
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Helper to get dynamic date string (e.g., "26 Nov 2025")
function getDynamicDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Helper to get short date (e.g., "27 Nov")
function getShortDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Add Message to Chat
function addMessage(text, type = 'bot', options = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;

    let content = `<div>${text}</div>`;

    msgDiv.innerHTML = content;

    if (options) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options-container';
        options.forEach(opt => {
            if (opt.separator) {
                const sep = document.createElement('div');
                sep.className = 'option-separator';
                optionsDiv.appendChild(sep);
            }
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt.label;
            btn.onclick = () => handleOptionClick(opt);
            optionsDiv.appendChild(btn);
        });
        msgDiv.appendChild(optionsDiv);
    }

    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Random Data Generators
const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

let currentUser = {
    name: "Jean-Pierre Dubois",
    pnr: "XJ92KL"
};

function generateRandomUser() {
    currentUser.name = `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pnr = "";
    for (let i = 0; i < 6; i++) {
        pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentUser.pnr = pnr;
}

// Generate Random Request ID
function generateRequestId() {
    return 'REQ-' + Math.floor(1000 + Math.random() * 9000);
}

// Show Rebooking Options
function showRebookingOptions() {
    const dateStr = getShortDate(1); // Tomorrow

    const options = [
        { label: `${t('option_next')} (Tomorrow, ${dateStr} 10:00)`, action: 'next' },
        { label: t('option_other'), action: 'other' },
        { label: t('option_refund'), action: 'refund' },
        { label: t('lang_select'), action: 'lang', separator: true }
    ];
    sendBotMessage(t('options_text'), options);
}

// Restart Chat
function restartChat(lang) {
    currentLanguage = lang;
    chatBody.innerHTML = '<div class="date-divider"><span>Today</span></div>'; // Clear chat
    startChatFlow();
}

// Save Request to LocalStorage
function saveRequest(requestId, selectedOption) {
    const now = new Date();
    const flightTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // Mock flight time: 2 hours from now

    const request = {
        id: requestId,
        passenger: currentUser.name,
        pnr: currentUser.pnr,
        original: 'SH102 (CDG-LHR)',
        option: selectedOption.label,
        status: 'Pending',
        timestamp: now.toISOString(),
        flightTime: flightTime,
        alternatives: [
            `Rebook on next available flight (Tomorrow, ${getShortDate(1)} 10:00)`,
            "08:00 - Air France (Direct)",
            "13:30 - British Airways (Direct)",
            "16:45 - Lufthansa (1 Stop)",
            "Refund"
        ]
    };

    let requests = JSON.parse(localStorage.getItem('flightRequests')) || [];
    requests.unshift(request); // Add to top
    localStorage.setItem('flightRequests', JSON.stringify(requests));

    // Persist active session
    localStorage.setItem('activeRequestId', requestId);

    // Start polling for this request
    startPolling(requestId);
}

// Polling Mechanism
let pollInterval;
function startPolling(requestId) {
    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(() => {
        const requests = JSON.parse(localStorage.getItem('flightRequests')) || [];
        const req = requests.find(r => r.id === requestId);

        if (req && req.status !== 'Pending') {
            clearInterval(pollInterval);
            handleStatusChange(req);
        }
    }, 2000);
}

// Handle Status Change
function handleStatusChange(req) {
    if (req.status === 'Approved') {
        // Hide timeline
        const timeline = document.querySelector('.timeline-card');
        if (timeline) timeline.style.display = 'none';

        sendBotMessage("Congratulations! Your flight change has been approved. Here is your updated travel plan:", null, 1000);

        setTimeout(() => {
            showBoardingPass(req);
        }, 2000);
    } else if (req.status === 'Rejected') {
        // Hide timeline
        const timeline = document.querySelector('.timeline-card');
        if (timeline) timeline.style.display = 'none';

        sendBotMessage("We apologize, but your specific request could not be confirmed at this time.", null, 1000);

        setTimeout(() => {
            showRejectionCard(req);
        }, 2000);
    }
}

// Restore State on Load
function restoreState() {
    const activeId = localStorage.getItem('activeRequestId');
    if (!activeId) return;

    const requests = JSON.parse(localStorage.getItem('flightRequests')) || [];
    const req = requests.find(r => r.id === activeId);

    if (req) {
        if (req.status === 'Pending') {
            // Restore UI to pending state (simplified for demo: just start polling)
            // In a real app, we'd rebuild the chat history. 
            // Here, we assume the user hasn't closed the tab, or if they did, we just resume polling.
            startPolling(activeId);
        } else {
            // If already approved/rejected, we might want to show the result if not already shown.
            // For simplicity, we won't replay the whole animation on reload unless necessary.
        }
    }
}

// Call restore on load
restoreState();

// Show Boarding Pass
function showBoardingPass(req) {
    // Check if already exists to avoid duplicates
    if (document.querySelector('.boarding-pass-container')) return;

    // Parse option label to get time and airline if possible, otherwise default
    // Format ex: "08:00 - Air France (Direct)" or "Rebook on next available flight (Tomorrow, 27 Nov 10:00)"
    let time = "10:00";
    let airline = "SkyHigh Airlines";
    let flightNum = "SH204";

    if (req.option.includes("Air France")) {
        airline = "Air France";
        flightNum = "AF123";
        time = "08:00";
    } else if (req.option.includes("British Airways")) {
        airline = "British Airways";
        flightNum = "BA456";
        time = "13:30";
    } else if (req.option.includes("Lufthansa")) {
        airline = "Lufthansa";
        flightNum = "LH789";
        time = "16:45";
    }

    const passDiv = document.createElement('div');
    passDiv.className = 'message bot boarding-pass-container';
    passDiv.innerHTML = `
        <div class="boarding-pass" onclick="openFullBoardingPass('${req.passenger}', '${airline}', '${flightNum}', '${time}')">
            <div class="pass-header">
                <i class="fas fa-plane"></i> ${airline}
            </div>
            <div class="pass-body">
                <div class="pass-row">
                    <div class="pass-item">
                        <label>Passenger</label>
                        <span>${req.passenger}</span>
                    </div>
                    <div class="pass-item right">
                        <label>Class</label>
                        <span>Economy</span>
                    </div>
                </div>
                <div class="pass-row">
                    <div class="pass-item">
                        <label>Flight</label>
                        <span>${flightNum}</span>
                    </div>
                    <div class="pass-item right">
                        <label>Date</label>
                        <span>${getShortDate(1)}</span>
                    </div>
                </div>
                <div class="pass-row">
                    <div class="pass-item">
                        <label>From</label>
                        <span>CDG</span>
                    </div>
                    <div class="pass-item center">
                        <i class="fas fa-long-arrow-alt-right"></i>
                    </div>
                    <div class="pass-item right">
                        <label>To</label>
                        <span>LHR</span>
                    </div>
                </div>
                <div class="pass-row highlight">
                    <div class="pass-item">
                        <label>Departs</label>
                        <span>${time}</span>
                    </div>
                    <div class="pass-item right">
                        <label>Seat</label>
                        <span>14B</span>
                    </div>
                </div>
            </div>
            <div class="pass-footer">
                <div class="qr-code"></div>
                <span>Tap to view full pass</span>
            </div>
        </div>
    `;
    chatBody.appendChild(passDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function openFullBoardingPass(passenger, airline, flightNum, time) {
    const modal = document.createElement('div');
    modal.className = 'boarding-pass-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="back-btn" onclick="closeBoardingPassModal()"><i class="fas fa-arrow-left"></i> Back to Chat</button>
            <div class="full-pass">
                <div class="pass-header">
                    <i class="fas fa-plane"></i> ${airline}
                </div>
                <div class="pass-body-large">
                    <div class="qr-code-large"></div>
                    <h2>${passenger}</h2>
                    <div class="flight-info-grid">
                        <div class="info-item">
                            <label>Flight</label>
                            <span>${flightNum}</span>
                        </div>
                        <div class="info-item">
                            <label>Date</label>
                            <span>${getDynamicDate(1)}</span>
                        </div>
                        <div class="info-item">
                            <label>Departs</label>
                            <span>${time}</span>
                        </div>
                        <div class="info-item">
                            <label>Gate</label>
                            <span>B12</span>
                        </div>
                        <div class="info-item">
                            <label>Seat</label>
                            <span>14B</span>
                        </div>
                        <div class="info-item">
                            <label>Class</label>
                            <span>Economy</span>
                        </div>
                    </div>
                    <div class="route-large">
                        <span>CDG</span> <i class="fas fa-plane"></i> <span>LHR</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeBoardingPassModal() {
    const modal = document.querySelector('.boarding-pass-modal');
    if (modal) modal.remove();
}

// Show Rejection Card
function showRejectionCard(req) {
    // Check if already exists
    if (document.querySelector('.rejection-card-container')) return;

    // Determine alternative suggestion
    // If user selected British Airways, suggest Lufthansa. Otherwise suggest British Airways.
    let suggestedOption = "British Airways (13:30 - Direct)";
    let suggestedAirline = "British Airways";

    if (req.option && req.option.includes("British Airways")) {
        suggestedOption = "Lufthansa (16:45 - 1 Stop)";
        suggestedAirline = "Lufthansa";
    }

    const cardDiv = document.createElement('div');
    cardDiv.className = 'message bot rejection-card-container';
    cardDiv.innerHTML = `
        <div class="rejection-card">
            <div class="rejection-header">
                <i class="fas fa-exclamation-circle"></i> Alternative Suggestion
            </div>
            <div class="rejection-body">
                <p>Our AI analysis suggests this is the best available option for you based on current network status.</p>
                <div class="suggested-option">
                    <div class="opt-details">
                        <span class="opt-airline">${suggestedAirline}</span>
                        <span class="opt-time">${suggestedOption.split('(')[1].replace(')', '')}</span>
                    </div>
                    <div class="rejection-actions">
                        <p class="auto-book-note"><i class="fas fa-bolt"></i> Clicking Accept will confirm booking instantly.</p>
                        <button class="btn-accept" onclick="acceptSuggestion('${req.id}', '${suggestedOption}')">Accept & Book</button>
                        <button class="btn-callback" onclick="requestCallback('${req.id}')">Request Call Back</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    chatBody.appendChild(cardDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function acceptSuggestion(id, option) {
    addMessage("Accept & Book", "user");
    sendBotMessage("Great! We are booking this alternative for you immediately.", null, 1000);

    // Simulate processing delay then show boarding pass
    setTimeout(() => {
        // Create a mock request object for the new booking
        const newReq = {
            passenger: currentUser.name,
            option: option,
            pnr: generateRandomPNR() // New PNR for the new booking
        };

        showBoardingPass(newReq);

        // Optional: Update status message
        sendBotMessage(`Booking confirmed! Your new PNR is ${newReq.pnr}. Safe travels! ✈️`, null, 500);
    }, 2500);
}

function requestCallback(id) {
    addMessage("Request Call Back", "user");
    sendBotMessage("We have received your request. An agent will call you shortly to discuss your options.", null, 1000);

    // Update status in local storage for dashboard
    let requests = JSON.parse(localStorage.getItem('flightRequests')) || [];
    const reqIndex = requests.findIndex(r => r.id === id);
    if (reqIndex !== -1) {
        requests[reqIndex].status = 'Callback Requested';
        localStorage.setItem('flightRequests', JSON.stringify(requests));
    }
}

// Handle Option Click
function handleOptionClick(option) {
    // Remove options from previous message
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'default';
    });

    // Add User Response
    addMessage(option.label, 'user');

    // Process Response
    setTimeout(() => {
        if (option.action === 'next' || option.action.startsWith('select_')) {
            sendBotMessage(t('processing'), null, 1500);
            setTimeout(() => {
                const reqId = generateRequestId();
                saveRequest(reqId, option);
                showApprovalCard(reqId);
            }, 2500);
        } else if (option.action === 'other') {
            const otherOptions = [
                { label: "08:00 - Air France (Direct)", action: 'select_af' },
                { label: "13:30 - British Airways (Direct)", action: 'select_ba' },
                { label: "16:45 - Lufthansa (1 Stop)", action: 'select_lh' }
            ];
            sendBotMessage("Here are some other flights available for tomorrow:", otherOptions);
        } else if (option.action === 'refund') {
            sendBotMessage("I've processed your refund request. You will receive a confirmation email shortly.");
        } else if (option.action === 'lang') {
            sendBotMessage("Please select your language / Veuillez sélectionner votre langue :", [
                { label: "English", action: 'set_lang_en' },
                { label: "Français", action: 'set_lang_fr' }
            ], 1000);
        } else if (option.action === 'set_lang_en') {
            addMessage(translations['en']['lang_changed'], 'bot'); // Immediate feedback
            setTimeout(() => restartChat('en'), 2000);
        } else if (option.action === 'set_lang_fr') {
            addMessage(translations['fr']['lang_changed'], 'bot'); // Immediate feedback
            setTimeout(() => restartChat('fr'), 2000);
        }
    }, 500);
}

// Show Approval Card (Embedded)
function showApprovalCard(requestId) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'timeline-card';
    cardDiv.id = `card-${requestId}`;
    cardDiv.innerHTML = `
        <div class="timeline-header">
            <span>${t('status_header')}</span>
            <span class="req-id">#${requestId}</span>
        </div>
        <div class="timeline-container">
            <div class="timeline-item completed">
                <div class="dot"></div>
                <div class="content">
                    <h3>${t('req_received')}</h3>
                    <p>${t('req_received_desc')}</p>
                    <span class="time">${getCurrentTime()}</span>
                </div>
            </div>
            <div class="timeline-item active">
                <div class="dot pulsing"></div>
                <div class="content">
                    <h3>${t('processing_approval')}</h3>
                    <p>${t('processing_desc')}</p>
                    <span class="time">${t('est_time')}</span>
                </div>
            </div>
            <div class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                    <h3>${t('confirmation')}</h3>
                    <p>${t('confirmation_desc')}</p>
                </div>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn-change" onclick="handleChangeRequest('${requestId}')">${t('change_req')}</button>
        </div>
    `;
    chatBody.appendChild(cardDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Handle Change Request
function handleChangeRequest(requestId) {
    // Disable the button
    const card = document.getElementById(`card-${requestId}`);
    const btn = card.querySelector('.btn-change');
    btn.disabled = true;
    btn.innerText = t('req_cancelled', { id: '' }).replace(' .', '');
    btn.style.opacity = "0.6";

    addMessage(t('change_req_user'), 'user');

    setTimeout(() => {
        sendBotMessage(t('req_cancelled', { id: requestId }), null, 1000);
        setTimeout(() => {
            showRebookingOptions();
        }, 2500);
    }, 500);
}

// Show Typing Indicator
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Hide Typing Indicator
function hideTyping() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Send Bot Message with Typing Delay
function sendBotMessage(text, options = null, delay = 1500) {
    showTyping();
    setTimeout(() => {
        hideTyping();
        addMessage(text, 'bot', options);
    }, delay);
}

// Start Chat Flow
function startChatFlow() {
    setTimeout(() => {
        sendBotMessage(t('greeting'), null, 1000);
    }, 500);

    setTimeout(() => {
        const detailsText = t('details')
            .replace('Jean-Pierre Dubois', currentUser.name)
            .replace('XJ92KL', currentUser.pnr)
            .replace('{date}', getDynamicDate());
        sendBotMessage(detailsText, null, 2000);
    }, 2500);

    setTimeout(() => {
        showRebookingOptions();
    }, 6000);
}

// Initial Flow
window.onload = () => {
    generateRandomUser();
    startChatFlow();
};
