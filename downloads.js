const BASE_URL = 'https://api.real-debrid.com/rest/1.0';
const apiKey = localStorage.getItem('rd_api_key');

if (!apiKey) {
    window.location.href = 'index.html';
}

let allDownloads = []; // Store all downloads for filtering
let currentFilter = 'all';
let currentSearch = '';

async function loadDownloads() {
    try {
        const response = await fetch(`${BASE_URL}/downloads`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.status === 401) {
            showToast('Invalid API key', 'error');
            window.location.href = 'index.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        allDownloads = data;
        applyFiltersAndSearch();
    } catch (error) {
        console.error('Error fetching downloads:', error);
    }
}

function applyFiltersAndSearch() {
    let filteredDownloads = allDownloads;

    // Apply type filter
    if (currentFilter !== 'all') {
        filteredDownloads = filteredDownloads.filter(download => {
            const ext = download.filename.split('.').pop().toLowerCase();
            switch (currentFilter) {
                case 'video':
                    return ['mp4', 'mkv', 'avi', 'mov'].includes(ext);
                case 'audio':
                    return ['mp3', 'wav', 'flac', 'm4a'].includes(ext);
                case 'archive':
                    return ['zip', 'rar', '7z'].includes(ext);
                default:
                    return true;
            }
        });
    }

    // Apply search
    if (currentSearch) {
        filteredDownloads = filteredDownloads.filter(download =>
            download.filename.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }

    renderDownloads(filteredDownloads);
}
  // Add this function to handle Infuse playback
  function getInfuseDeepLink(downloadUrl) {
      return `infuse://x-callback-url/play?url=${encodeURIComponent(downloadUrl)}`;
  }

  // Modify the renderDownloads function to include Infuse playback
  function renderDownloads(downloads) {
      const downloadsList = document.getElementById('downloads-list');
      downloadsList.innerHTML = '';

      if (downloads.length === 0) {
          downloadsList.innerHTML = '<div class="text-center text-gray-400">No matching downloads found</div>';
          return;
      }

      downloads.forEach(download => {
          const isVideo = download.filename.match(/\.(mp4|mkv|avi|mov|m4v)$/i);
          const downloadItem = document.createElement('div');
          downloadItem.className = 'glass-effect p-4 rounded-lg mb-3';
        
          downloadItem.innerHTML = `
              <div class="flex items-center gap-4">
                  <div class="flex-1 min-w-0">
                      <div class="font-semibold truncate mb-1">${download.filename || 'Unnamed file'}</div>
                      <div class="text-sm text-gray-400">
                          ${formatBytes(download.filesize)} • ${new Date(download.generated).toLocaleDateString()}
                      </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                      ${isVideo ? `
                          <a href="${getInfuseDeepLink(download.download)}" 
                           class="btn-secondary w-10 h-10 rounded-lg flex items-center justify-center"
                           title="Play in Infuse">
                              <i class="fas fa-play"></i>
                          </a>
                      ` : ''}
                      <a href="${download.download}" 
                       class="btn-primary w-10 h-10 rounded-lg flex items-center justify-center" 
                       target="_blank">
                          <i class="fas fa-download"></i>
                      </a>
                  </div>
              </div>
          `;
          downloadsList.appendChild(downloadItem);
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
    loadDownloads();
    setupSearch();
    setupFilters();
    document.getElementById('load-downloads').addEventListener('click', loadDownloads);
});