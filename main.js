document.addEventListener('DOMContentLoaded', () => {
    init();
});

// State management
let apiKey = localStorage.getItem('rd_api_key');
const BASE_URL = 'https://api.real-debrid.com/rest/1.0';

// Initialize app
function init() {
    if (!apiKey) {
        document.getElementById('api-modal').classList.remove('hidden');
    } else {
        showMainContent();
    }
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    const saveApiKeyButton = document.getElementById('save-api-key');
    if (saveApiKeyButton) {
        saveApiKeyButton.addEventListener('click', saveApiKey);
    } else {
        console.error('Element with ID "save-api-key" not found.');
    }
    document.getElementById('unrestrict-button').addEventListener('click', unrestrictLink);
    document.getElementById('add-torrent-button').addEventListener('click', addTorrent);
    document.getElementById('logout-button').addEventListener('click', logout);
    
    document.getElementById('show-downloads').addEventListener('click', () => {
        window.location.href = 'downloads.html';
    });

    document.getElementById('show-torrents').addEventListener('click', () => {
        window.location.href = 'torrents.html';
    });
    
    document.querySelectorAll('.close-section').forEach(button => {
        button.addEventListener('click', (e) => {
            const section = e.target.closest('.glass-effect');
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            setTimeout(() => {
                section.classList.add('hidden');
            }, 300);
        });
    });
}

async function saveApiKey() {
    const input = document.getElementById('api-key-input');
    const key = input.value.trim();
    
    if (!key) {
        showToast('Please enter an API key', 'error');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/user`, {
            headers: { 'Authorization': `Bearer ${key}` }
        });

        if (!response.ok) throw new Error('Invalid API key');

        localStorage.setItem('rd_api_key', key);
        apiKey = key;
        showMainContent();
        showToast('Successfully connected!', 'success');
    } catch (error) {
        showToast('Invalid API key', 'error');
        input.value = '';
    }
}

function showMainContent() {
    document.getElementById('api-modal').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
}

async function unrestrictLink() {
    const link = document.getElementById('link-input').value.trim();
    if (!link) {
        showToast('Please enter a link', 'error');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/unrestrict/link`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `link=${encodeURIComponent(link)}`
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to unrestrict link');

        addDownloadToList(data);
        document.getElementById('link-input').value = '';
        showToast('Link unrestricted successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function addTorrent() {
    const magnetLink = document.getElementById('magnet-input').value.trim();
    if (!magnetLink) {
        showToast('Please enter a magnet link', 'error');
        return;
    }

    try {
        // First add the magnet
        const addResponse = await fetch(`${BASE_URL}/torrents/addMagnet`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `magnet=${encodeURIComponent(magnetLink)}`
        });

        if (!addResponse.ok) throw new Error('Failed to add torrent');
        const addData = await addResponse.json();

        // Then select all files
        const selectResponse = await fetch(`${BASE_URL}/torrents/selectFiles/${addData.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'files=all'
        });

        if (!selectResponse.ok) throw new Error('Failed to select files');

        document.getElementById('magnet-input').value = '';
        showToast('Torrent added successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function addDownloadToList(data) {
    const downloadItem = document.createElement('div');
    downloadItem.className = 'glass-effect rounded-lg p-4 slide-up';
    downloadItem.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
                <h3 class="font-semibold truncate">${data.filename}</h3>
                <p class="text-sm text-gray-400">${formatBytes(data.filesize)}</p>
            </div>
            <a href="${data.download}" target="_blank" 
                class="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg ml-4">
                <i class="fas fa-download"></i>
            </a>
        </div>
    `;
    const downloadsList = document.getElementById('downloads-list');
    downloadsList.prepend(downloadItem);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded-lg shadow-lg`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatBytes(bytes, decimals = 2) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('rd_api_key');
        location.reload();
    }
}

async function loadRecentContent() {
    try {
        // Load downloads
        const downloadsResponse = await fetch(`${BASE_URL}/downloads`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const downloads = await downloadsResponse.json();

        // Load torrents
        const torrentsResponse = await fetch(`${BASE_URL}/torrents`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const torrents = await torrentsResponse.json();

        updateContentList(downloads, torrents);
    } catch (error) {
        showToast('Failed to load recent content', 'error');
    }
}

function updateContentList(downloads, torrents) {
    const contentList = document.getElementById('downloads-list');
    contentList.innerHTML = ''; // Clear existing content

    // Combine and sort both downloads and torrents by date
    const allContent = [
        ...downloads.map(d => ({...d, type: 'download', date: new Date(d.generated)})),
        ...torrents.map(t => ({...t, type: 'torrent', date: new Date(t.added)}))
    ].sort((a, b) => b.date - a.date);

    allContent.forEach(item => {
        const div = document.createElement('div');
        div.className = 'glass-effect rounded-xl p-4 flex items-center justify-between';
        
        const isVideo = item.filename.match(/\.(mp4|mkv|avi|mov|m4v)$/i);
        const infuseLink = isVideo ? `infuse://x-callback-url/play?url=${encodeURIComponent(item.download || item.links[0])}` : null;

        div.innerHTML = `
            <div class="flex items-center gap-4 flex-1">
                <i class="fas ${item.type === 'download' ? 'fa-file' : 'fa-magnet'} text-xl 
                    ${item.type === 'download' ? 'text-blue-400' : 'text-purple-400'}"></i>
                <div class="flex-1">
                    <h3 class="font-semibold truncate">${item.filename}</h3>
                    <p class="text-sm text-gray-400">
                        ${formatBytes(item.bytes || item.filesize)} • 
                        ${item.date.toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                ${isVideo ? `
                    <a href="${infuseLink}" 
                        class="btn-secondary px-3 py-2 rounded-lg" 
                        title="Play in Infuse">
                        <i class="fas fa-play"></i>
                    </a>
                ` : ''}
                <a href="${item.download || item.links[0]}" 
                    class="btn-primary px-3 py-2 rounded-lg" 
                    target="_blank" 
                    download>
                    <i class="fas fa-download"></i>
                </a>
            </div>
        `;
        contentList.appendChild(div);
    });
}

async function loadDownloads() {
    try {
        const response = await fetch(`${BASE_URL}/downloads`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        if (!response.ok) throw new Error('Failed to load downloads');
        
        const data = await response.json();
        const downloadsList = document.getElementById('downloads-list');
        downloadsList.innerHTML = '';
        
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'glass-effect p-4 rounded-lg';
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-semibold truncate">${item.filename}</h3>
                        <p class="text-sm text-gray-400">${formatBytes(item.filesize)}</p>
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                        <a href="${item.download}" 
                            class="btn-primary px-3 py-2 rounded-lg" 
                            target="_blank">
                            <i class="fas fa-download"></i>
                        </a>
                    </div>
                </div>
            `;
            downloadsList.appendChild(div);
        });
    } catch (error) {
        showToast('Failed to load downloads', 'error');
        console.error('Downloads error:', error);
    }
}

async function loadTorrents() {
    try {
        const response = await fetch(`${BASE_URL}/torrents`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        if (!response.ok) throw new Error('Failed to load torrents');
        
        const data = await response.json();
        const torrentsList = document.getElementById('torrents-list');
        torrentsList.innerHTML = '';
        
        data.forEach(torrent => {
            const div = document.createElement('div');
            div.className = 'glass-effect p-4 rounded-lg';
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-semibold truncate">${torrent.filename}</h3>
                        <div class="flex items-center gap-4 text-sm text-gray-400">
                            <span>${formatBytes(torrent.bytes)}</span>
                            <span>${torrent.status}</span>
                            ${torrent.progress < 100 ? 
                                `<div class="w-32 bg-gray-700 rounded-full h-2">
                                    <div class="bg-blue-500 rounded-full h-2" 
                                         style="width: ${torrent.progress}%">
                                    </div>
                                </div>` : ''
                            }
                        </div>
                    </div>
                    ${torrent.links && torrent.links.length > 0 ? `
                        <div class="flex items-center gap-2 ml-4">
                            <a href="${torrent.links[0]}" 
                                class="btn-primary px-3 py-2 rounded-lg" 
                                target="_blank">
                                <i class="fas fa-download"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
            torrentsList.appendChild(div);
        });
    } catch (error) {
        showToast('Failed to load torrents', 'error');
        console.error('Torrents error:', error);
    }
}

function toggleProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal.classList.contains('hidden')) {
        loadProfile();
    }
    modal.classList.toggle('hidden');
}

async function loadProfile() {
    try {
        const response = await fetch(`${BASE_URL}/user`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        if (!response.ok) throw new Error('Failed to load profile');
        
        const data = await response.json();
        
        // Update profile content with proper error handling
        const elements = {
            username: document.getElementById('profile-username'),
            email: document.getElementById('profile-email'),
            premium: document.getElementById('profile-premium'),
            points: document.getElementById('profile-points'),
            expiration: document.getElementById('profile-expiration')
        };

        if (elements.username) elements.username.textContent = data.username;
        if (elements.email) elements.email.textContent = data.email;
        
        if (elements.premium) {
            const daysLeft = Math.floor(data.premium / 86400);
            elements.premium.textContent = data.type === 'premium' ? 
                `Premium (${daysLeft} days left)` : 'Free Account';
            elements.premium.className = data.type === 'premium' ? 
                'text-lg font-semibold text-green-400' : 'text-lg font-semibold text-gray-400';
        }
        
        if (elements.points) {
            elements.points.textContent = data.points.toLocaleString();
        }
        
        if (elements.expiration && data.expiration) {
            const expDate = new Date(data.expiration);
            elements.expiration.textContent = expDate.toLocaleDateString();
        }
        
    } catch (error) {
        showToast('Failed to load profile data', 'error');
        console.error('Profile loading error:', error);
    }
}

// Add these styles to your CSS if not already present
const style = document.createElement('style');
style.textContent = `
    #downloads-section, #torrents-section {
        transition: opacity 0.3s ease, transform 0.3s ease;
        transform: translateY(20px);
    }
    
    #downloads-section:not(.hidden), 
    #torrents-section:not(.hidden) {
        transform: translateY(0);
        opacity: 1;
    }
`;
document.head.appendChild(style);

async function validateApiKey(apiKey) {
    const response = await fetch('https://api.real-debrid.com/rest/1.0/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert('Invalid API Key: ' + errorData.error);
    } else {
        const userData = await response.json();
        console.log('User Data:', userData);
        // Proceed with your application logic
    }
}
