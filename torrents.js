const BASE_URL = 'https://api.real-debrid.com/rest/1.0';
const apiKey = localStorage.getItem('rd_api_key');

if (!apiKey) {
    window.location.href = 'index.html';
}

let allTorrents = []; // Store all torrents for filtering
let currentFilter = 'all';
let currentSearch = '';

async function loadTorrents() {
    const torrentsList = document.getElementById('torrents-list');
    
    try {
        const response = await fetch(`${BASE_URL}/torrents`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.status === 401) {
            showToast('Invalid API key', 'error');
            window.location.href = 'index.html';
            return;
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allTorrents = await response.json();

        if (allTorrents.length === 0) {
            torrentsList.innerHTML = '<div class="text-center text-gray-400">No active torrents found</div>';
            return;
        }

        applyFiltersAndSearch();
    } catch (error) {
        console.error('Torrents error:', error);
        showToast(error.message || 'Failed to load torrents', 'error');
    }
}

function applyFiltersAndSearch() {
    let filteredTorrents = allTorrents;

    // Apply status filter
    if (currentFilter !== 'all') {
        filteredTorrents = filteredTorrents.filter(torrent => 
            torrent.status === currentFilter
        );
    }

    // Apply search
    if (currentSearch) {
        filteredTorrents = filteredTorrents.filter(torrent =>
            torrent.filename.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }

    renderTorrents(filteredTorrents);
}

function renderTorrents(torrents) {
    const torrentsList = document.getElementById('torrents-list');
    torrentsList.innerHTML = '';

    if (torrents.length === 0) {
        torrentsList.innerHTML = '<div class="text-center text-gray-400">No matching torrents found</div>';
        return;
    }

    torrents.forEach(torrent => {
        const torrentItem = document.createElement('div');
        torrentItem.className = 'glass-effect p-4 rounded-lg mb-3';
        
        const statusColors = {
            'downloading': 'text-yellow-400',
            'downloaded': 'text-green-400',
            'error': 'text-red-400',
            'queued': 'text-blue-400',
            'magnet_conversion': 'text-purple-400'
        };

        const statusColor = statusColors[torrent.status] || 'text-gray-400';
        
        torrentItem.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="flex-1 min-w-0">
                    <div class="font-semibold truncate mb-1">${torrent.filename || 'Unnamed torrent'}</div>
                    <div class="text-sm text-gray-400 truncate">
                        ${formatBytes(torrent.bytes)} • 
                        <span class="${statusColor}">${torrent.status}</span>
                        ${torrent.progress ? ` • ${torrent.progress}%` : ''}
                        ${torrent.speed ? ` • ${formatBytes(torrent.speed)}/s` : ''}
                    </div>
                    ${torrent.progress ? `
                        <div class="bg-gray-700 rounded-full h-2 mt-2">
                            <div class="bg-blue-500 rounded-full h-2 transition-all duration-300" 
                                 style="width: ${torrent.progress}%">
                            </div>
                        </div>
                    ` : ''}
                </div>
                ${torrent.links && torrent.links.length > 0 ? `
                    <a href="${torrent.links[0]}" 
                       class="btn-primary w-10 h-10 rounded-lg flex items-center justify-center shrink-0" 
                       target="_blank">
                        <i class="fas fa-download"></i>
                    </a>
                ` : ''}
            </div>
        `;
        torrentsList.appendChild(torrentItem);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    let debounceTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            currentSearch = e.target.value;
            applyFiltersAndSearch();
        }, 300);
    });
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.btn-filter');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.id.replace('filter-', '');
            applyFiltersAndSearch();
        });
    });
}

function formatBytes(bytes, decimals = 2) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded-lg shadow-lg`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTorrents();
    setupSearch();
    setupFilters();
});