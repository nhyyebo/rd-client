const BASE_URL = 'https://api.real-debrid.com/rest/1.0';
const apiKey = localStorage.getItem('rd_api_key');

if (!apiKey) {
    window.location.href = 'index.html';
}

// Initialize settings
async function init() {
    await Promise.all([
        loadAccountInfo(),
        loadHostSettings(),
        setupEventListeners()
    ]);
}

function setupEventListeners() {
    // API Key controls
    document.getElementById('show-api-key').addEventListener('click', toggleApiKeyVisibility);
    document.getElementById('copy-api-key').addEventListener('click', copyApiKey);
    document.getElementById('change-api-key').addEventListener('click', changeApiKey);

    // Download settings
    document.getElementById('download-dir').addEventListener('change', saveDownloadSettings);
    document.getElementById('auto-start').addEventListener('change', saveDownloadSettings);

    // Load saved settings
    loadSavedSettings();
}

async function loadAccountInfo() {
    try {
        const response = await fetch(`${BASE_URL}/user`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!response.ok) throw new Error('Failed to load account info');
        const data = await response.json();

        // Update account information
        document.getElementById('username').textContent = data.username;
        document.getElementById('email').textContent = data.email;
        document.getElementById('account-type').textContent = data.type.charAt(0).toUpperCase() + data.type.slice(1);
        document.getElementById('points').textContent = data.points.toLocaleString();
        
        const daysLeft = Math.floor(data.premium / 86400);
        document.getElementById('premium-days').textContent = 
            data.type === 'premium' ? `${daysLeft} days` : 'N/A';

        // Set API key field
        const apiKeyInput = document.getElementById('api-key');
        apiKeyInput.value = apiKey;

    } catch (error) {
        showToast('Failed to load account information', 'error');
        console.error('Account info error:', error);
    }
}

async function loadHostSettings() {
    try {
        const response = await fetch(`${BASE_URL}/hosts`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!response.ok) throw new Error('Failed to load hosts');
        const hosts = await response.json();

        const hostsList = document.getElementById('hosts-list');
        hostsList.innerHTML = '';

        Object.entries(hosts).forEach(([host, info]) => {
            const hostElement = document.createElement('div');
            hostElement.className = 'flex items-center justify-between p-3 glass-effect rounded-lg';
            hostElement.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${info.image}" alt="${host}" class="w-6 h-6">
                    <span class="font-semibold">${host}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm ${info.status ? 'text-green-400' : 'text-red-400'}">
                        ${info.status ? 'Active' : 'Inactive'}
                    </span>
                    <div class="status-dot ${info.status ? 'active' : 'inactive'}"></div>
                </div>
            `;
            hostsList.appendChild(hostElement);
        });

    } catch (error) {
        showToast('Failed to load hosts', 'error');
        console.error('Hosts error:', error);
    }
}

function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('api-key');
    const eyeIcon = document.querySelector('#show-api-key i');
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        apiKeyInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

async function copyApiKey() {
    const apiKeyInput = document.getElementById('api-key');
    try {
        await navigator.clipboard.writeText(apiKeyInput.value);
        showToast('API key copied to clipboard', 'success');
    } catch (error) {
        showToast('Failed to copy API key', 'error');
    }
}

function changeApiKey() {
    if (confirm('Are you sure you want to change your API key? You will be logged out.')) {
        localStorage.removeItem('rd_api_key');
        window.location.href = 'index.html';
    }
}

function loadSavedSettings() {
    const settings = JSON.parse(localStorage.getItem('rd_settings') || '{}');
    
    document.getElementById('download-dir').value = settings.downloadDir || '';
    document.getElementById('auto-start').checked = settings.autoStart || false;
}

function saveDownloadSettings() {
    const settings = {
        downloadDir: document.getElementById('download-dir').value,
        autoStart: document.getElementById('auto-start').checked
    };
    
    localStorage.setItem('rd_settings', JSON.stringify(settings));
    showToast('Settings saved successfully', 'success');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded-lg shadow-lg`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize the settings page
init(); 