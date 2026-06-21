// Check Auth
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

// Auto-populate on GST entry
document.getElementById('biz-gst').addEventListener('input', function(e) {
    const val = e.target.value.trim().toUpperCase();
    if (val.length === 15) {
        const loader = document.getElementById('gst-loader');
        if(loader) loader.classList.remove('hidden');
        
        // Simulate API delay
        setTimeout(() => {
            if(loader) loader.classList.add('hidden');
            
            // Auto-fill mock details
            document.getElementById('biz-name').value = "M/s " + val.substring(0, 5) + " Enterprises";
            document.getElementById('biz-type').value = "Retail Shop";
            document.getElementById('biz-year').value = "2019";
            document.getElementById('biz-turnover').value = "12000000"; // 1.2Cr
            document.getElementById('biz-employees').value = "6-20";
            
            // Map first two chars to a state code (mocked)
            const stateCode = val.substring(0, 2);
            let stateName = "Delhi";
            if (stateCode === "27") stateName = "Maharashtra";
            else if (stateCode === "29") stateName = "Karnataka";
            else if (stateCode === "24") stateName = "Gujarat";
            else if (stateCode === "33") stateName = "Tamil Nadu";
            else if (stateCode === "09") stateName = "Uttar Pradesh";
            
            document.getElementById('biz-state').value = stateName;
            
            // Flash fields to indicate auto-fill
            ['biz-name', 'biz-type', 'biz-year', 'biz-turnover', 'biz-state'].forEach(id => {
                const el = document.getElementById(id);
                el.classList.add('ring-2', 'ring-green-500', 'bg-green-50', 'dark:bg-green-900/20');
                setTimeout(() => el.classList.remove('ring-2', 'ring-green-500', 'bg-green-50', 'dark:bg-green-900/20'), 1000);
            });
            
        }, 1200);
    }
});

document.getElementById('onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Initializing Environment...';
    btn.disabled = true;

    const profile = {
        name: document.getElementById('biz-name').value,
        type: document.getElementById('biz-type').value,
        year: document.getElementById('biz-year').value || new Date().getFullYear(),
        turnover: document.getElementById('biz-turnover').value,
        employees: document.getElementById('biz-employees').value,
        state: document.getElementById('biz-state').value,
        gstNumber: document.getElementById('biz-gst').value,
        email: document.getElementById('biz-email').value
    };
    
    // Save to local storage for Dashboard to pick up
    localStorage.setItem('businessProfile', JSON.stringify(profile));
    
    // Simulate slight delay for AI initialization feel
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 800);
});
