const API_URL = 'http://localhost:3000';

const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
const profileStr = localStorage.getItem('businessProfile');

if (!token || !userStr || !profileStr) {
    window.location.href = 'login.html';
}

const user = JSON.parse(userStr);
const profile = JSON.parse(profileStr);

const displayName = document.getElementById('user-display-name');
if(displayName) displayName.innerText = user.username;

if (user.isPremium) {
    setTimeout(() => {
        const badges = document.querySelectorAll('.pro-badge');
        badges.forEach(b => b.classList.add('hidden'));
        const unlockDoc = document.querySelector('.icon-unlock-doc');
        if(unlockDoc) unlockDoc.classList.remove('hidden');
        const unlockTax = document.querySelector('.icon-unlock-tax');
        if(unlockTax) unlockTax.classList.remove('hidden');
    }, 100);
}

// Theme
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
function initTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
initTheme();
if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark';
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.theme = 'light';
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}

// Number Animation
function animateValue(obj, start, end, duration, prefix = '', suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        if(obj) obj.innerHTML = `${prefix}${current.toLocaleString()}${suffix}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            if(obj) obj.innerHTML = `${prefix}${end.toLocaleString()}${suffix}`;
        }
    };
    window.requestAnimationFrame(step);
}

// Circle Chart Animation
function updateCircle(idText, idCircle, percentage) {
    const textEl = document.getElementById(idText);
    const circleEl = document.getElementById(idCircle);
    if(textEl && circleEl) {
        animateValue(textEl, 0, percentage, 1500, '', '%');
        setTimeout(() => {
            circleEl.style.strokeDasharray = `${percentage}, 100`;
        }, 100);
    }
}

// Fetch Dashboard Data
async function loadDashboard() {
    try {
        const res = await fetch(`${API_URL}/business/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(profile)
        });
        if (res.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            return;
        }
        const data = await res.json();
        
        // Populate KPIs
        if(data.businessImpact) {
            const numPenalty = parseInt(data.businessImpact.penaltySavings.replace(/[^0-9]/g, ''));
            animateValue(document.getElementById('val-penalty-savings'), 0, numPenalty, 1500, '₹');
            animateValue(document.getElementById('val-improvement-pct'), 0, parseInt(data.businessImpact.improvementPct), 1500, '', '%');
            animateValue(document.getElementById('val-benefits-claimed'), 0, parseInt(data.businessImpact.benefitsClaimed), 1000);
            animateValue(document.getElementById('val-time-saved'), 0, parseInt(data.businessImpact.timeSaved), 1500, '', ' Hrs');
        }

        // Growth Score
        if(data.growthScore) {
            animateValue(document.getElementById('val-growth-score'), 0, data.growthScore, 1500, '', '%');
            setTimeout(() => {
                const bar = document.getElementById('bar-growth-score');
                if(bar) bar.style.width = `${data.growthScore}%`;
            }, 100);
        }

        // Risk Prediction
        if(data.aiRiskPrediction) {
            const riskEl = document.getElementById('val-risk-prediction');
            const penEl = document.getElementById('val-penalty-exposure');
            if(riskEl) {
                riskEl.innerText = data.aiRiskPrediction.level;
                riskEl.className = `font-extrabold text-sm ${data.aiRiskPrediction.level.includes('LOW') ? 'text-green-500' : (data.aiRiskPrediction.level.includes('MODERATE') ? 'text-warning' : 'text-red-500 animate-pulse')}`;
            }
            if(penEl) penEl.innerText = data.aiRiskPrediction.penaltyExposure;
        }

        // Health Circles
        if(data.healthMetrics) {
            updateCircle('pct-comp', 'circle-comp', data.healthMetrics.compliance);
            updateCircle('pct-fin', 'circle-fin', data.healthMetrics.financial);
            updateCircle('pct-leg', 'circle-leg', data.healthMetrics.legal);
            updateCircle('pct-ops', 'circle-ops', data.healthMetrics.operational);
        }

        // AI Insights
        const insightsContainer = document.getElementById('ai-insights-container');
        if(insightsContainer && data.aiInsights) {
            insightsContainer.innerHTML = '';
            data.aiInsights.forEach(insight => {
                const isWarning = insight.includes('⚠');
                insightsContainer.innerHTML += `
                    <div class="p-3 rounded-lg flex items-start border ${isWarning ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'}">
                        <i class="${isWarning ? 'fas fa-exclamation-triangle text-red-500' : 'fas fa-check-circle text-green-500'} mt-1 mr-3"></i>
                        <p class="text-sm font-medium ${isWarning ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}">${insight}</p>
                    </div>`;
            });
        }

        // Timeline
        const timelineContainer = document.getElementById('timeline-container');
        if(timelineContainer) {
            timelineContainer.innerHTML = '';
            const events = [
                { date: 'May 12', title: 'GST Filing Due', icon: 'fa-file-invoice-dollar', color: 'text-primary' },
                { date: 'May 20', title: 'Trade License Renewal', icon: 'fa-id-card', color: 'text-warning' },
                { date: 'June 01', title: 'Labor Compliance Update', icon: 'fa-users', color: 'text-secondary' }
            ];
            if(data.deadlines && data.deadlines.length > 0) {
                events[0] = { date: data.deadlines[0].date, title: data.deadlines[0].task, icon: 'fa-exclamation-circle', color: 'text-red-500' };
            }
            events.forEach((ev, idx) => {
                timelineContainer.innerHTML += `
                    <div class="relative pl-6">
                        <div class="absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white dark:border-darkCard bg-white dark:bg-darkCard shadow flex items-center justify-center">
                            <div class="w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}"></div>
                        </div>
                        <p class="text-xs font-bold text-gray-500 mb-1">${ev.date}</p>
                        <p class="text-sm font-bold text-gray-900 dark:text-white"><i class="fas ${ev.icon} ${ev.color} mr-1"></i> ${ev.title}</p>
                    </div>
                `;
            });
        }

        // Integrations
        const intContainer = document.getElementById('integration-container');
        if(intContainer && data.integrationStatus) {
            intContainer.innerHTML = '';
            for(const [key, val] of Object.entries(data.integrationStatus)) {
                intContainer.innerHTML += `
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span class="font-bold text-sm uppercase"><i class="fas fa-network-wired text-gray-400 mr-2"></i> ${key}</span>
                        ${val ? '<span class="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-2 py-1 rounded font-bold border border-green-200 dark:border-green-800"><i class="fas fa-check mr-1"></i> Ready</span>' 
                              : '<span class="bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 text-[10px] px-2 py-1 rounded font-bold border border-gray-300 dark:border-gray-600">Pending</span>'}
                    </div>
                `;
            }
        }

        // Legacy Lists
        const chkContainer = document.getElementById('checklist-container');
        if(chkContainer) {
            chkContainer.innerHTML = '';
            data.checklist.forEach(item => {
                chkContainer.innerHTML += `<li><i class="fas fa-chevron-right text-xs text-primary mr-2"></i> ${item}</li>`;
            });
        }

        const schContainer = document.getElementById('schemes-container');
        if(schContainer) {
            schContainer.innerHTML = '';
            data.schemes.forEach(item => {
                schContainer.innerHTML += `<li><i class="fas fa-check-circle text-secondary mr-2"></i> ${item}</li>`;
            });
        }
        
        // Central Laws
        const clContainer = document.getElementById('central-laws-container');
        if(clContainer && data.centralLaws) {
            clContainer.innerHTML = '';
            data.centralLaws.forEach(law => {
                clContainer.innerHTML += `<li><i class="fas fa-balance-scale text-gray-400 mr-2"></i> ${law}</li>`;
            });
            if(data.centralLaws.length === 0) clContainer.innerHTML = `<li>No specific central alerts.</li>`;
        }

        const lawsContainer = document.getElementById('state-laws-container');
        if(lawsContainer) {
            lawsContainer.innerHTML = '';
            data.stateLaws.forEach(law => {
                lawsContainer.innerHTML += `<li><i class="fas fa-gavel text-gray-400 mr-2"></i> ${law}</li>`;
            });
            if(data.stateLaws.length === 0) lawsContainer.innerHTML = `<li>No specific state alerts.</li>`;
        }
        
    } catch(err) {
        console.error("Dashboard Load Error:", err);
    }
}

// Chat logic
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const btnSendChat = document.getElementById('btn-send-chat');

function addMessage(msg, isBot) {
    if(!chatBox) return;
    const align = isBot ? 'self-start' : 'self-end';
    const bg = isBot ? 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none' : 'bg-primary text-white rounded-tr-none';
    chatBox.innerHTML += `<div class="flex flex-col"><div class="p-3 rounded-2xl max-w-[85%] text-sm ${bg} ${align}">${msg}</div></div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addTyping() {
    if(!chatBox) return null;
    const id = 'typing-' + Date.now();
    chatBox.innerHTML += `<div id="${id}" class="flex flex-col"><div class="p-3 rounded-2xl max-w-[85%] text-sm bg-gray-200 dark:bg-gray-800 self-start rounded-tl-none"><i class="fas fa-ellipsis-h animate-pulse"></i></div></div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}
function removeMessage(id) { document.getElementById(id)?.remove(); }

async function sendChat() {
    const text = chatInput.value.trim();
    if(!text) return;
    addMessage(text, false);
    chatInput.value = '';
    
    const typingId = addTyping();
    try {
        const res = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        removeMessage(typingId);
        addMessage(data.reply, true);
    } catch(err) {
        removeMessage(typingId);
        addMessage("Sorry, the enterprise AI engine is currently busy.", true);
    }
}

if(btnSendChat) btnSendChat.addEventListener('click', sendChat);
if(chatInput) chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendChat(); });

// Toggle Floating Chatbot
function toggleChatbot() {
    const modal = document.getElementById('floating-chat-modal');
    if(modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0', 'scale-95');
        }, 10);
    } else {
        modal.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

// Consultants
let globalConsultantsData = [];

async function loadConsultants() {
    const container = document.getElementById('consultants-container');
    if(!container) return;
    try {
        const res = await fetch(`${API_URL}/payment/consultants`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        globalConsultantsData = data.consultants;
        
        data.consultants.forEach(c => {
            container.innerHTML += `
                <div class="bg-white dark:bg-darkCard rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center text-center relative hover:shadow-xl transition-shadow group">
                    <div class="absolute top-4 right-4 flex space-x-1">
                        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online"></span>
                    </div>
                    <img src="${c.image}" class="w-24 h-24 rounded-full mb-4 object-cover shadow-md border-4 border-gray-50 dark:border-gray-800">
                    <h3 class="font-extrabold text-lg flex items-center">${c.name} <i class="fas fa-check-circle text-blue-500 text-xs ml-1" title="Govt Verified"></i></h3>
                    <p class="text-primary text-xs font-bold uppercase tracking-wider mb-2 mt-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">${c.specialty}</p>
                    <div class="flex items-center space-x-2 mb-4 w-full justify-center">
                        <span class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-[10px] px-2 py-1 rounded font-bold flex items-center border border-gray-200 dark:border-gray-700">
                            <i class="fas fa-star text-yellow-500 mr-1"></i> ${c.rating || '4.8'}
                        </span>
                        <span class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-[10px] px-2 py-1 rounded font-bold border border-gray-200 dark:border-gray-700">${c.experience || '10+ Years'}</span>
                    </div>
                    <p class="text-gray-500 text-xs mb-1 font-bold">Consultation Fee</p>
                    <p class="text-gray-900 dark:text-white font-black text-xl mb-6">${c.fees}</p>
                    <button onclick="openConsultantProfile(${c.id})" class="w-full py-3 bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-bold rounded-xl transition-all shadow-md group-hover:-translate-y-0.5">View Profile</button>
                </div>`;
        });
    } catch(err) { container.innerHTML = '<p class="text-red-500">Failed to load experts.</p>'; }
}

const consultantProfileModal = document.getElementById('consultant-profile-modal');
function openConsultantProfile(id) {
    const c = globalConsultantsData.find(x => x.id === id);
    if(!c || !consultantProfileModal) return;
    
    document.getElementById('profile-modal-img').src = c.image;
    document.getElementById('profile-modal-name').innerHTML = `${c.name} <i class="fas fa-check-circle text-blue-500 text-sm ml-2" title="Verified"></i>`;
    document.getElementById('profile-modal-specialty').innerText = c.specialty;
    document.getElementById('profile-modal-rating').innerHTML = `<i class="fas fa-star text-yellow-500 mr-1.5"></i> ${c.rating}`;
    document.getElementById('profile-modal-exp').innerText = c.experience || '10+ Years Exp';
    document.getElementById('profile-modal-terms').innerText = c.terms || 'Standard consultation terms apply.';
    document.getElementById('profile-modal-fees').innerText = c.fees;
    
    document.getElementById('btn-proceed-book').onclick = () => {
        closeConsultantProfile();
        setTimeout(() => {
            openBookingModal(c.id, c.fees.replace(/[^0-9]/g, ''));
        }, 300);
    };
    
    consultantProfileModal.classList.remove('hidden');
    setTimeout(() => {
        consultantProfileModal.classList.remove('opacity-0');
        document.getElementById('consultant-profile-content').classList.remove('scale-95');
    }, 10);
}
function closeConsultantProfile() {
    if(!consultantProfileModal) return;
    consultantProfileModal.classList.add('opacity-0');
    document.getElementById('consultant-profile-content').classList.add('scale-95');
    setTimeout(() => consultantProfileModal.classList.add('hidden'), 300);
}

// Premium & Booking
const premiumModal = document.getElementById('premium-modal');
function openPremiumModal() {
    if(!premiumModal) return;
    premiumModal.classList.remove('hidden');
    setTimeout(() => {
        premiumModal.classList.remove('opacity-0');
        document.getElementById('premium-modal-content').classList.remove('scale-95');
    }, 10);
}
function closePremiumModal() {
    if(!premiumModal) return;
    premiumModal.classList.add('opacity-0');
    document.getElementById('premium-modal-content').classList.add('scale-95');
    setTimeout(() => premiumModal.classList.add('hidden'), 300);
}

async function upgradeToPremium() {
    try {
        const res = await fetch(`${API_URL}/auth/upgrade`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('token', data.token);
            user.isPremium = true;
            localStorage.setItem('user', JSON.stringify(user));
            alert("Upgraded to Enterprise Pro Successfully!");
            window.location.reload();
        }
    } catch(err) { alert("Upgrade failed."); }
}

const bookingModal = document.getElementById('booking-modal');
function openBookingModal(id, feeStr) {
    if(!bookingModal) return;
    document.getElementById('book-consultant-id').value = id;
    document.getElementById('book-fee-display').innerText = `₹${feeStr}`;
    bookingModal.classList.remove('hidden');
    setTimeout(() => {
        bookingModal.classList.remove('opacity-0');
        document.getElementById('booking-modal-content').classList.remove('scale-95');
    }, 10);
}
function closeBookingModal() {
    if(!bookingModal) return;
    bookingModal.classList.add('opacity-0');
    document.getElementById('booking-modal-content').classList.add('scale-95');
    setTimeout(() => bookingModal.classList.add('hidden'), 300);
}

const bookingForm = document.getElementById('booking-form');
if(bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const processing = document.getElementById('payment-processing');
        processing.classList.remove('hidden');
        
        const payload = {
            consultantId: document.getElementById('book-consultant-id').value,
            date: document.getElementById('book-date').value,
            time: document.getElementById('book-time').value,
            amount: document.getElementById('book-fee-display').innerText.replace('₹','')
        };
        
        try {
            const res = await fetch(`${API_URL}/payment/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            setTimeout(() => {
                processing.classList.add('hidden');
                if (data.success) {
                    alert(`Booking Confirmed!\nMeeting Link: ${data.meetingLink}`);
                    closeBookingModal();
                } else {
                    alert("Booking failed: " + data.error);
                }
            }, 1500);
        } catch(err) {
            processing.classList.add('hidden');
            alert("Network error.");
        }
    });
}

// Workflows & Vault
function generateDoc() {
    if (!user.isPremium) { openPremiumModal(); return; }
    
    const btn = document.getElementById('btn-doc-gen');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating...';
    
    setTimeout(() => {
        alert("Enterprise AI Draft Generator Initialized! (Demo)");
        btn.innerHTML = originalText;
    }, 1500);
}

async function autoFileTax() {
    if (!user.isPremium) { openPremiumModal(); return; }
    
    const btn = document.getElementById('btn-tax-file');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Connecting to Bank...';
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_URL}/payment/auto-file-tax`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ email: profile.email, gstNumber: profile.gstNumber })
        });
        const data = await res.json();
        
        if (data.success) {
            btn.innerHTML = '<i class="fas fa-check-circle mr-2 text-green-500"></i> Scheduled';
            btn.classList.add('border', 'border-green-500');
            
            let alertMsg = `Bank Connected. Monthly GST Auto-Filing Scheduled!\nFiling ID: ${data.filingId}`;
            if (data.previewUrl) {
                alertMsg += `\n\nA confirmation receipt has been generated.`;
                const container = btn.parentElement;
                let linkDiv = document.getElementById('tax-receipt-link');
                if (!linkDiv) {
                    linkDiv = document.createElement('div');
                    linkDiv.id = 'tax-receipt-link';
                    linkDiv.className = 'mt-3 text-center';
                    container.appendChild(linkDiv);
                }
                linkDiv.innerHTML = `<a href="${data.previewUrl}" target="_blank" class="text-primary hover:underline font-bold text-sm"><i class="fas fa-external-link-alt mr-1"></i> View Filing Receipt</a>`;
            }
            alert(alertMsg);
        } else {
            alert("Error: " + data.error);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch(err) {
        alert("Failed to connect to bank server.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function uploadDocument() {
    const icon = document.getElementById('vault-icon');
    const text = document.getElementById('vault-text');
    const dropzone = document.getElementById('vault-dropzone');
    if(!icon) return;
    
    icon.className = 'fas fa-spinner fa-spin text-2xl text-secondary mb-3 transition-colors';
    text.innerText = 'Encrypting...';
    dropzone.classList.add('pointer-events-none');
    
    setTimeout(() => {
        icon.className = 'fas fa-shield-check text-2xl text-green-500 mb-3 transition-colors';
        text.innerText = 'Vault Secured';
        text.classList.add('text-green-600');
        dropzone.classList.replace('border-gray-100', 'border-green-500');
        dropzone.classList.replace('dark:border-gray-800', 'dark:border-green-500');
        dropzone.classList.add('bg-green-50', 'dark:bg-green-900/20');
        setTimeout(() => { dropzone.classList.remove('pointer-events-none'); }, 1000);
    }, 1500);
}

// Crisis Engine
const crisisModal = document.getElementById('crisis-modal');
const crisisLogs = document.getElementById('crisis-logs');
const crisisSuccessBlock = document.getElementById('crisis-success-block');

function triggerCrisis(type) {
    if(!crisisModal) return;
    crisisLogs.innerHTML = '';
    crisisSuccessBlock.classList.add('hidden');
    
    document.querySelector('#crisis-modal-content > div').classList.remove('bg-green-600', 'border-green-800');
    document.querySelector('#crisis-modal-content > div').classList.add('bg-red-600', 'border-red-800');
    document.querySelector('#crisis-title').innerText = "CRISIS DETECTED";
    document.querySelector('#crisis-subtitle').innerText = "Initiating Enterprise Automation Protocol...";
    
    const icon = document.querySelector('#crisis-modal-content i.text-6xl');
    if (icon) icon.className = 'fas fa-exclamation-triangle text-6xl mb-4 animate-pulse';

    crisisModal.classList.remove('hidden');
    setTimeout(() => {
        crisisModal.classList.remove('opacity-0');
        document.getElementById('crisis-modal-content').classList.remove('scale-95');
        runCrisisSimulation(type);
    }, 10);
}

function closeCrisisModal() {
    if(!crisisModal) return;
    crisisModal.classList.add('opacity-0');
    document.getElementById('crisis-modal-content').classList.add('scale-95');
    setTimeout(() => crisisModal.classList.add('hidden'), 300);
}

async function runCrisisSimulation(type) {
    const logs = type === 'gst' ? [
        "Analyzing Midnight Govt Gazette Notification...",
        "Identifying affected HSN codes across your inventory...",
        "Drafting Enterprise Extension Petition for late filing...",
        "Recalculating Financial Risk Exposure Model...",
        "Petition Auto-Filed via VyapaarMitra Legal API."
    ] : [
        "Scanning legal notice received from client via OCR...",
        "Identifying assigned CA negligence & liability...",
        "Drafting Legal Notice of Damages against Consultant...",
        "Escalating case to Premium Crisis Expert Panel...",
        "Reassigning to Shri R.K. Narayan, CA for immediate resolution."
    ];
    
    for(let i=0; i<logs.length; i++) {
        await new Promise(r => setTimeout(r, 800));
        crisisLogs.innerHTML += `
            <div class="flex items-start opacity-0 animate-fade-in-up">
                <div class="mt-1.5 mr-4"><div class="w-3 h-3 bg-red-500 rounded-full animate-ping"></div></div>
                <p class="text-gray-800 dark:text-gray-200 font-bold text-lg">${logs[i]}</p>
            </div>
        `;
    }
    
    await new Promise(r => setTimeout(r, 1000));
    const icon = document.querySelector('#crisis-modal-content i.text-6xl');
    if (icon) icon.className = 'fas fa-shield-check text-6xl mb-4';
    document.getElementById('crisis-title').innerText = "CRISIS CONTAINED";
    document.getElementById('crisis-subtitle').innerText = "All enterprise automated protocols executed successfully.";
    
    const header = document.querySelector('#crisis-modal-content > div');
    header.classList.replace('bg-red-600', 'bg-green-600');
    header.classList.replace('border-red-800', 'border-green-800');
    
    crisisSuccessBlock.classList.remove('hidden');
}

// Add animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
`;
document.head.appendChild(style);

// Init Application
loadDashboard();
loadConsultants();
