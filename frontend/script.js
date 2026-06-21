const API_URL = 'http://localhost:3000';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const bizForm = document.getElementById('business-form');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const dashboardLoading = document.getElementById('dashboard-loading');

const valScore = document.getElementById('val-score');
const progressScore = document.getElementById('progress-score');
const valRisk = document.getElementById('val-risk');
const valDeadlineTask = document.getElementById('val-deadline-task');
const valDeadlineDate = document.getElementById('val-deadline-date');
const valSchemesCount = document.getElementById('val-schemes-count');
const checklistContainer = document.getElementById('checklist-container');
const schemesContainer = document.getElementById('schemes-container');

const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const btnSendChat = document.getElementById('btn-send-chat');

const consultantsContainer = document.getElementById('consultants-container');
const bookingModal = document.getElementById('booking-modal');
const bookingModalContent = document.getElementById('booking-modal-content');
const bookConsultantId = document.getElementById('book-consultant-id');
const bookConsultantFees = document.getElementById('book-consultant-fees');

// Modal Steps
const step1 = document.getElementById('booking-form-step1');
const step2 = document.getElementById('booking-form-step2');
const step3 = document.getElementById('booking-form-step3');
const modalTitle = document.getElementById('modal-title');
const paymentAmount = document.getElementById('payment-amount');
const qrSection = document.getElementById('qr-code-section');
const selectedPaymentMethod = document.getElementById('selected-payment-method');
const paymentProcessing = document.getElementById('payment-processing');
const receiptLinkContainer = document.getElementById('receipt-link-container');

let complianceChartInstance = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadConsultants();
    initChart();
    
    // Simulate checking for emergency alerts
    setTimeout(() => {
        document.getElementById('emergency-alert').classList.remove('hidden');
    }, 5000);
});

// Theme Toggle
function initTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    if (document.documentElement.classList.contains('dark')) {
        localStorage.theme = 'dark';
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        localStorage.theme = 'light';
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
    // Update chart colors if exists
    if(complianceChartInstance) {
        updateChartTheme();
    }
});

// Initialize Chart
function initChart() {
    const ctx = document.getElementById('complianceChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#e2e8f0' : '#475569';

    complianceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Overdue'],
            datasets: [{
                data: [30, 60, 10], // Dummy initial data
                backgroundColor: ['#10b981', '#fbbf24', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: textColor }
                }
            },
            cutout: '70%'
        }
    });
}

function updateChartTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    complianceChartInstance.options.plugins.legend.labels.color = isDark ? '#e2e8f0' : '#475569';
    complianceChartInstance.update();
}

// Update Dashboard Data
function updateDashboard(data) {
    // Update Score
    valScore.innerText = data.score;
    progressScore.style.width = `${data.score}%`;
    
    // Change progress color based on score
    progressScore.className = 'h-2 rounded-full transition-all duration-1000';
    if(data.score >= 80) progressScore.classList.add('bg-green-500');
    else if(data.score >= 50) progressScore.classList.add('bg-yellow-500');
    else progressScore.classList.add('bg-red-500');

    // Update Risk Level
    valRisk.innerText = data.riskLevel;
    if(data.riskLevel === 'Low') valRisk.className = 'text-2xl font-bold mt-2 text-green-500';
    else if(data.riskLevel === 'Medium') valRisk.className = 'text-2xl font-bold mt-2 text-yellow-500';
    else valRisk.className = 'text-2xl font-bold mt-2 text-red-500';

    // Update Deadline
    if(data.deadlines && data.deadlines.length > 0) {
        valDeadlineTask.innerText = data.deadlines[0].task;
        valDeadlineDate.innerText = data.deadlines[0].date;
    }

    // Update Schemes Count
    valSchemesCount.innerText = data.schemes ? data.schemes.length : 0;

    // Update Checklist
    checklistContainer.innerHTML = '';
    data.checklist.forEach(item => {
        const li = document.createElement('li');
        li.className = 'flex items-center text-sm p-2 rounded bg-gray-50 dark:bg-gray-800 animate-fade-in border border-gray-200 dark:border-gray-700';
        li.innerHTML = `<i class="fas fa-exclamation-circle text-yellow-500 mr-3"></i> <span>${item}</span>`;
        checklistContainer.appendChild(li);
    });

    // Update Schemes
    schemesContainer.innerHTML = '';
    data.schemes.forEach(item => {
        const li = document.createElement('li');
        li.className = 'flex items-center text-sm p-2 rounded bg-green-50 dark:bg-green-900/20 animate-fade-in border border-green-100 dark:border-green-900/30';
        li.innerHTML = `<i class="fas fa-check-circle text-green-500 mr-3"></i> <span>${item}</span>`;
        schemesContainer.appendChild(li);
    });

    // Update Chart with random realistic data based on score
    const completed = data.score;
    const remaining = 100 - data.score;
    const pending = Math.floor(remaining * 0.8);
    const overdue = remaining - pending;

    complianceChartInstance.data.datasets[0].data = [completed, pending, overdue];
    complianceChartInstance.update();

    // Show alerts if any
    if(data.alerts && data.alerts.length > 0) {
        const alertBox = document.getElementById('emergency-alert');
        document.getElementById('alert-message').innerText = data.alerts[0];
        alertBox.classList.remove('hidden');
    }
}

// Handle Form Submission
bizForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bizType = document.getElementById('biz-type').value;
    const turnover = document.getElementById('biz-turnover').value;
    const state = document.getElementById('biz-state').value;

    // UI Loading state
    btnText.innerText = 'Analyzing...';
    btnSpinner.classList.remove('hidden');
    dashboardLoading.classList.remove('hidden');

    try {
        const res = await fetch(`${API_URL}/analyze-business`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessType: bizType, turnover, state })
        });
        
        const data = await res.json();
        
        // Simulate slight delay for "AI Analysis" feel
        setTimeout(() => {
            updateDashboard(data);
            
            // Reset UI
            btnText.innerText = 'Analyze Compliance';
            btnSpinner.classList.add('hidden');
            dashboardLoading.classList.add('hidden');
        }, 1500);

    } catch (err) {
        console.error("Error analyzing business:", err);
        alert("Failed to connect to backend server. Make sure it is running on port 3000.");
        btnText.innerText = 'Analyze Compliance';
        btnSpinner.classList.add('hidden');
        dashboardLoading.classList.add('hidden');
    }
});

// Chat AI Implementation
async function handleChat() {
    const question = chatInput.value.trim();
    if(!question) return;

    // Append User message
    appendMessage(question, 'user');
    chatInput.value = '';

    // Append typing indicator
    const typingId = appendTypingIndicator();

    try {
        const res = await fetch(`${API_URL}/ask-ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        const data = await res.json();
        
        // Remove typing indicator & append AI response
        removeMessage(typingId);
        appendMessage(data.response, 'ai');
    } catch(err) {
        removeMessage(typingId);
        appendMessage("Error: Could not reach the AI server.", 'ai');
    }
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `flex chat-container w-full`;
    
    const inner = document.createElement('div');
    inner.className = sender === 'user' ? 'chat-message-user' : 'chat-message-ai text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700';
    inner.innerText = text;
    
    div.appendChild(inner);
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = `flex chat-container w-full`;
    
    const inner = document.createElement('div');
    inner.className = 'chat-message-ai text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 flex space-x-1';
    inner.innerHTML = `<div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div><div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div><div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>`;
    
    div.appendChild(inner);
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if(el) el.remove();
}

btnSendChat.addEventListener('click', handleChat);
chatInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') handleChat();
});

// Load Consultants
async function loadConsultants() {
    try {
        const res = await fetch(`${API_URL}/consultants`);
        const data = await res.json();
        
        consultantsContainer.innerHTML = '';
        data.forEach(c => {
            const card = document.createElement('div');
            card.className = 'consultant-card bg-white dark:bg-darkCard rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-5 flex flex-col items-center text-center';
            card.innerHTML = `
                <img src="${c.image}" alt="${c.name}" class="w-24 h-24 rounded-full mb-4 border-4 border-gray-50 dark:border-gray-700 object-cover shadow-sm">
                <h3 class="font-bold text-lg">${c.name}</h3>
                <p class="text-primary text-sm font-medium mb-2">${c.specialty}</p>
                <div class="flex items-center space-x-1 mb-4">
                    <i class="fas fa-star text-yellow-400"></i>
                    <span class="text-sm font-bold">${c.rating}</span>
                </div>
                <p class="text-gray-600 dark:text-gray-400 font-semibold mb-4">${c.fees}</p>
                <button onclick="openModal(${c.id}, '${c.fees.replace(/[^0-9]/g, '')}')" class="w-full py-2 bg-gray-100 hover:bg-primary hover:text-white dark:bg-gray-800 dark:hover:bg-primary text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors">
                    Book Now
                </button>
            `;
            consultantsContainer.appendChild(card);
        });
    } catch(err) {
        console.error("Failed to load consultants");
        consultantsContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load consultants. Is backend running?</p>';
    }
}

// Modal Functions
function openModal(consultantId, fees) {
    bookConsultantId.value = consultantId;
    bookConsultantFees.value = fees;
    
    // Reset Modal State
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
    step3.classList.add('hidden');
    modalTitle.innerText = "Book Consultant";
    document.getElementById('btn-pay-upi').classList.replace('border-primary', 'border-gray-200');
    document.getElementById('btn-pay-qr').classList.replace('border-primary', 'border-gray-200');
    qrSection.classList.add('hidden');

    bookingModal.classList.remove('hidden');
    setTimeout(() => {
        bookingModal.classList.remove('opacity-0');
        bookingModalContent.classList.remove('scale-95');
    }, 10);
}

function closeModal() {
    bookingModal.classList.add('opacity-0');
    bookingModalContent.classList.add('scale-95');
    setTimeout(() => {
        bookingModal.classList.add('hidden');
    }, 300);
}

function selectPayment(method) {
    selectedPaymentMethod.value = method;
    const btnUpi = document.getElementById('btn-pay-upi');
    const btnQr = document.getElementById('btn-pay-qr');
    
    if(method === 'upi') {
        btnUpi.classList.add('border-primary', 'bg-blue-50', 'dark:bg-blue-900/30');
        btnQr.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-blue-900/30');
        qrSection.classList.add('hidden');
    } else {
        btnQr.classList.add('border-primary', 'bg-blue-50', 'dark:bg-blue-900/30');
        btnUpi.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-blue-900/30');
        qrSection.classList.remove('hidden');
    }
}

// Step 1 Submission
step1.addEventListener('submit', (e) => {
    e.preventDefault();
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    modalTitle.innerText = "Complete Payment";
    paymentAmount.innerText = `₹${bookConsultantFees.value}`;
    selectPayment('upi'); // default
});

// Step 2 Submission (Payment)
document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    paymentProcessing.classList.remove('hidden');
    
    const id = bookConsultantId.value;
    const date = document.getElementById('book-date').value;
    const time = document.getElementById('book-time').value;
    const method = selectedPaymentMethod.value;
    const amount = bookConsultantFees.value;
    
    // Get email from main form (fallback to dummy if empty)
    const emailInput = document.getElementById('biz-email');
    const email = emailInput ? emailInput.value : 'user@example.com';
    
    try {
        const res = await fetch(`${API_URL}/book-consultant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                consultantId: id, 
                date: date, 
                time: time,
                email: email,
                paymentMethod: method.toUpperCase(),
                amount: amount
            })
        });
        const data = await res.json();
        
        setTimeout(() => {
            paymentProcessing.classList.add('hidden');
            if(data.success) {
                step2.classList.add('hidden');
                step3.classList.remove('hidden');
                modalTitle.innerText = "Booking Confirmed";
                
                if(data.previewUrl) {
                    receiptLinkContainer.innerHTML = `<a href="${data.previewUrl}" target="_blank" class="text-primary hover:underline flex items-center justify-center font-medium"><i class="fas fa-external-link-alt mr-2"></i> View Email Receipt</a>`;
                }
            } else {
                alert("Payment failed.");
            }
        }, 1500); // simulate payment delay
        
    } catch(err) {
        paymentProcessing.classList.add('hidden');
        alert("Failed to process payment. Is backend running?");
    }
});
