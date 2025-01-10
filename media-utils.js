// Basic filename parsing for future use
function parseMediaFilename(filename) {
    if (!filename) return null;
    return {
        filename: filename.replace(/\./g, ' ').trim()
    };
}

// Placeholder for future media info fetching
async function fetchMediaInfo(mediaData) {
    return null;
}

// Basic card generation (currently returns empty string)
function generateMediaCard(mediaInfo) {
    return '';
}

export { parseMediaFilename, fetchMediaInfo, generateMediaCard }; 