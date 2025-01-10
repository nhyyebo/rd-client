// Common functionality (auth check, sidebar, notifications, etc.)
const apiKey = localStorage.getItem('rd_api_key');

// Check authentication
if (!apiKey) {
    window.location.href = 'index.html';
}

// Load sidebar
document.getElementById('sidebar').innerHTML = `
    <div class="sidebar fixed inset-y-0 left-0 w-64 glass-effect z-50">
        <!-- Sidebar content -->
    </div>
`;

// Setup notifications
function showToast(message, type = 'info') {
    // Toast implementation
}

// Format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Setup hamburger menu
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu implementation
}); 