// Translations
const translations = {
    en: {
        pending: "Pending",
        approved_today: "Approved Today",
        cancelled: "Cancelled",
        req_id: "Request ID",
        passenger: "Passenger",
        pnr: "PNR",
        original_flight: "Original Flight",
        requested_option: "Requested Option",
        status: "Status",
        action: "Action",
        req_details: "Request Details",
        flight_info: "Flight Information",
        ai_analysis: "AI Analysis & Options",
        ai_desc: "Review the available options and AI recommendations before taking action.",
        reject: "Reject",
        approve: "Approve Request",
        take_action: "Take Action",
        ai_reason_avail: "<strong>Availability:</strong> High availability on this flight. Good option for rebooking.",
        ai_reason_partner: "<strong>Partner Airline:</strong> Cost-effective partner agreement. Recommended.",
        ai_reason_disrupt: "<strong>Less Disruption:</strong> Closest time to original flight. Best for passenger satisfaction.",
        ai_reason_refund: "<strong>Revenue Risk:</strong> Refund request. Try to offer voucher if possible.",
        ai_reason_comp: "<strong>Competitor:</strong> Higher cost. Only approve if no other options.",
        status_pending: "Pending",
        status_approved: "Approved",
        status_rejected: "Rejected"
    },
    fr: {
        pending: "En attente",
        approved_today: "Approuvé aujourd'hui",
        cancelled: "Annulé",
        req_id: "ID Demande",
        passenger: "Passager",
        pnr: "PNR",
        original_flight: "Vol d'origine",
        requested_option: "Option demandée",
        status: "Statut",
        action: "Action",
        req_details: "Détails de la demande",
        flight_info: "Informations sur le vol",
        ai_analysis: "Analyse IA et Options",
        ai_desc: "Examinez les options disponibles et les recommandations de l'IA avant d'agir.",
        reject: "Rejeter",
        approve: "Approuver",
        take_action: "Traiter",
        ai_reason_avail: "<strong>Disponibilité :</strong> Grande disponibilité sur ce vol. Bonne option.",
        ai_reason_partner: "<strong>Compagnie partenaire :</strong> Accord rentable. Recommandé.",
        ai_reason_disrupt: "<strong>Moins de perturbation :</strong> Heure la plus proche du vol initial. Idéal pour le passager.",
        ai_reason_refund: "<strong>Risque de revenu :</strong> Demande de remboursement. Essayez d'offrir un bon si possible.",
        ai_reason_comp: "<strong>Concurrent :</strong> Coût plus élevé. Approuver seulement si aucune autre option.",
        status_pending: "En attente",
        status_approved: "Approuvé",
        status_rejected: "Rejeté"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-opt').forEach(el => el.classList.remove('active'));
    document.querySelector(`.lang-opt[onclick="setLanguage('${lang}')"]`).classList.add('active');
    updateUIText();
    renderTable(); // Re-render table to translate statuses/buttons
}

function t(key) {
    return translations[currentLang][key] || key;
}

function updateUIText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = t(key);
    });
}

// Random Data Generators
const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const destinations = ["London (LHR)", "Munich (MUC)", "Barcelona (BCN)", "Rome (FCO)", "Amsterdam (AMS)", "Frankfurt (FRA)", "Madrid (MAD)"];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomPassenger() {
    const count = getRandomInt(1, 3); // 1 to 3 passengers
    if (count === 1) {
        return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
    } else {
        const familyName = getRandomElement(lastNames);
        return `${getRandomElement(firstNames)} & ${getRandomElement(firstNames)} ${familyName} (${count} Pax)`;
    }
}

function generateRandomPNR() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pnr = "";
    for (let i = 0; i < 6; i++) {
        pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
}

// Helper to create dates
function addHours(h) {
    const d = new Date();
    d.setHours(d.getHours() + h);
    return d.toISOString();
}

// Load Requests from LocalStorage
let requests = JSON.parse(localStorage.getItem('flightRequests')) || [];

// Populate with mock items if empty
if (requests.length <= 1) {
    const mockData = [];
    for (let i = 0; i < 15; i++) {
        const dest = getRandomElement(destinations);
        const isRefund = Math.random() > 0.8;
        const option = isRefund ? "Refund" : `SkyHigh to ${dest.split(' ')[0]} (14:00)`;

        mockData.push({
            id: `REQ-${9000 + i}`,
            passenger: generateRandomPassenger(),
            pnr: generateRandomPNR(),
            original: `SH102 (CDG-${dest.split(' ')[0].substring(0, 3).toUpperCase()})`,
            option: option,
            status: i % 3 === 0 ? 'Approved' : (i % 4 === 0 ? 'Rejected' : 'Pending'),
            timestamp: addHours(-Math.random() * 5),
            flightTime: addHours(Math.random() * 24),
            alternatives: [
                `SkyHigh to ${dest.split(' ')[0]} (18:00)`,
                `Air France to ${dest.split(' ')[0]} (12:00)`,
                `Lufthansa to ${dest.split(' ')[0]} (16:30)`
            ]
        });
    }

    // Merge with existing (keeping user created ones)
    requests = [...requests, ...mockData];
    // Deduplicate by ID
    requests = Array.from(new Map(requests.map(item => [item.id, item])).values());
    localStorage.setItem('flightRequests', JSON.stringify(requests));
}

const tableBody = document.getElementById('requests-body');
const modal = document.getElementById('info-modal');
let currentRequestId = null;

// Calculate Priority
function getPriority(flightTimeStr) {
    if (!flightTimeStr) return 'Low';
    const flightTime = new Date(flightTimeStr);
    const now = new Date();
    const diffHours = (flightTime - now) / (1000 * 60 * 60);

    if (diffHours < 3) return 'High';
    if (diffHours < 12) return 'Medium';
    return 'Low';
}

// Render Table
function renderTable() {
    requests = JSON.parse(localStorage.getItem('flightRequests')) || [];

    // Sort by Priority then Timestamp
    requests.sort((a, b) => {
        const pA = getPriority(a.flightTime);
        const pB = getPriority(b.flightTime);
        const pMap = { 'High': 3, 'Medium': 2, 'Low': 1 };

        if (pMap[pA] !== pMap[pB]) {
            return pMap[pB] - pMap[pA];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    tableBody.innerHTML = '';
    requests.forEach(req => {
        const priority = getPriority(req.flightTime);
        const row = document.createElement('tr');

        // Translate status
        let displayStatus = req.status;
        if (req.status === 'Pending') displayStatus = t('status_pending');
        if (req.status === 'Approved') displayStatus = t('status_approved');
        if (req.status === 'Rejected') displayStatus = t('status_rejected');

        row.innerHTML = `
            <td>
                <div>#${req.id}</div>
                <span class="priority-badge ${priority.toLowerCase()}">${priority}</span>
            </td>
            <td><div style="font-weight: 500;">${req.passenger}</div></td>
            <td>${req.pnr}</td>
            <td>${req.original}</td>
            <td>${req.option}</td>
            <td><span class="status-badge ${req.status.toLowerCase()}">${displayStatus}</span></td>
            <td>
                <div class="actions">
                    ${req.status === 'Pending' ? `
                        <button class="btn-action btn-take-action" onclick="showMoreInfo('${req.id}')">${t('take_action')}</button>
                    ` : '-'}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update Status
function updateStatus(id, newStatus) {
    const req = requests.find(r => r.id === id);
    if (req) {
        req.status = newStatus;
        localStorage.setItem('flightRequests', JSON.stringify(requests));
        renderTable();
        closeModal();
    }
}

// AI Analysis Logic
function getAIAnalysis(optionText) {
    // Randomize reasoning for demo purposes if generic
    const reasons = [
        { key: 'ai_reason_avail', type: 'approve', badge: 'Recommended', tagClass: 'tag-positive' },
        { key: 'ai_reason_partner', type: 'approve', badge: 'Partner Deal', tagClass: 'tag-positive' },
        { key: 'ai_reason_disrupt', type: 'approve', badge: 'Best Fit', tagClass: 'tag-positive' }
    ];

    if (optionText.includes('Refund')) {
        return { key: 'ai_reason_refund', type: 'reject', badge: 'Revenue Risk', tagClass: 'tag-negative' };
    } else if (optionText.includes('British Airways') || optionText.includes('Lufthansa')) {
        return { key: 'ai_reason_comp', type: 'review', badge: 'Competitor', tagClass: 'tag-neutral' };
    }

    // Random good reason for others
    return getRandomElement(reasons);
}

// Show More Info Modal (Take Action)
function showMoreInfo(id) {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    currentRequestId = id;

    document.getElementById('modal-req-id').innerText = '#' + req.id;
    document.getElementById('modal-passenger').innerText = req.passenger;
    document.getElementById('modal-pnr').innerText = req.pnr;
    document.getElementById('modal-original').innerText = req.original;
    document.getElementById('modal-option').innerText = req.option;

    // Populate Options List with AI Tooltips
    const optionsList = document.getElementById('modal-options-list');
    optionsList.innerHTML = '';

    // Combine requested option + alternatives to show full context
    let allOptions = [req.option];
    if (req.alternatives) {
        allOptions = [...allOptions, ...req.alternatives];
    }
    // Dedupe
    allOptions = [...new Set(allOptions)];

    allOptions.forEach(opt => {
        const isSelected = opt === req.option;
        const analysis = getAIAnalysis(opt);

        const card = document.createElement('div');
        card.className = `option-card ${isSelected ? 'selected' : ''}`;

        // Determine tag text
        let tagText = analysis.badge;
        if (isSelected) {
            tagText = "User Selection";
        } else if (analysis.type === 'approve') {
            tagText = "Suggested Alternative";
        }

        // Determine tag class
        let tagClass = analysis.tagClass;
        if (isSelected) tagClass = 'tag-neutral'; // User selection is neutral unless analyzed otherwise, but let's keep it simple
        if (isSelected && analysis.type === 'approve') tagClass = 'tag-positive'; // If user picked a good one
        if (isSelected && analysis.type === 'reject') tagClass = 'tag-negative'; // If user picked a bad one

        card.innerHTML = `
            <div class="option-header">
                <span class="option-label">${opt}</span>
                <span class="recommendation-tag ${tagClass}">${tagText}</span>
            </div>
            <div class="ai-inline-reasoning">
                <i class="fas fa-robot"></i> ${t(analysis.key)}
            </div>
        `;
        optionsList.appendChild(card);
    });

    modal.style.display = 'flex';
}

// Close Modal
function closeModal() {
    modal.style.display = 'none';
    currentRequestId = null;
}

// Handle Modal Actions
function handleModalAction(status) {
    if (currentRequestId) {
        updateStatus(currentRequestId, status);
    }
}

// Close on outside click
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

// Initial Render
updateUIText();
renderTable();

// Poll for updates
// Poll for updates
setInterval(renderTable, 2000);

// Live Ops Simulation
function updateLiveOps() {
    const cancelled = document.getElementById('live-cancelled');
    const delayed = document.getElementById('live-delayed');

    if (cancelled && delayed) {
        // Randomly fluctuate
        if (Math.random() > 0.7) {
            let val = parseInt(cancelled.innerText);
            val += Math.random() > 0.5 ? 1 : -1;
            if (val < 10) val = 10;
            cancelled.innerText = val;
        }

        if (Math.random() > 0.7) {
            let val = parseInt(delayed.innerText);
            val += Math.random() > 0.5 ? 1 : -1;
            if (val < 2) val = 2;
            delayed.innerText = val;
        }
    }
}

setInterval(updateLiveOps, 3000);
