# RD Client

## Overview

RD Client is a web application that allows users to manage their downloads and torrents using the Real-Debrid API. The application provides a user-friendly interface to search, filter, and interact with media files, making it easier to manage your downloads and torrents efficiently.

## Features

- **User Authentication**: Securely log in using your Real-Debrid API key.
- **Download Management**: View, search, and filter your downloads.
- **Torrent Management**: View, search, and filter your active torrents.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Search Functionality**: Quickly find specific downloads or torrents using a search bar.
- **Filter Options**: Filter downloads and torrents by type or status.
- **Visual Feedback**: Clear indicators for active downloads, completed torrents, and errors.

## Security Notice

**Important**: This application does not store your Real-Debrid API key on any server. Your API key is stored locally in your browser's local storage. You can verify this by checking the following files:
- [common.js](common.js) - Retrieves the API key from local storage.
- [downloads.js](downloads.js) - Uses the API key from local storage to fetch downloads.
- [main.js](main.js) - Manages the API key and application initialization.
- [settings.js](settings.js) - Manages API key visibility and changes.

## Technologies Used

- **HTML**: Structure of the web application.
- **CSS**: Styling and layout using Tailwind CSS for a modern look.
- **JavaScript**: Client-side scripting for dynamic content and API interactions.
- **Real-Debrid API**: Integration with the Real-Debrid service for managing downloads and torrents.

## Contributing

We welcome contributions to the RD Client project! To contribute, follow these steps:

1. **Fork the Repository**: Click the "Fork" button at the top right of the repository page to create a copy of the repository in your GitHub account.
2. **Clone the Repository**: Clone the forked repository to your local machine using the following command:
   ```sh
   git clone https://github.com/yourusername/rd-client.git
   ```

## Self-Hosting Instructions

To self-host the RD Client application, follow these steps based on your operating system:

### For Windows, Mac, and Linux

1. **Download the Repository**:
   - Go to the [RD Client GitHub repository](https://github.com/yourusername/rd-client) (replace with your actual repository link).
   - Click on the green "Code" button and select "Download ZIP".
   - Extract the downloaded ZIP file to a folder on your computer.

2. **Install Visual Studio Code**:
   - Download and install Visual Studio Code from [the official website](https://code.visualstudio.com/).

3. **Install the Five Server Extension**:
   - Open Visual Studio Code.
   - Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or by pressing `Ctrl+Shift+X`.
   - Search for "Five Server" and install the extension.

4. **Open the Project Folder**:
   - In Visual Studio Code, click on `File` > `Open Folder...`.
   - Navigate to the folder where you extracted the RD Client files and select it.

5. **Open the Application**:
   - In the Explorer view, locate `index.html`.
   - Right-click on `index.html` and select `Open with Five Server`.
   - This will start a local server and open the application in your default web browser.

6. **Obtain Your Real-Debrid API Key**:
   - Go to [Real-Debrid](https://real-debrid.com) and log in to your account.
   - Navigate to the API section to obtain your API key.

7. **Store Your API Key**:
   - Open the browser's console (usually by pressing `F12` or `Ctrl+Shift+I`).
   - Store your API key in the browser's local storage:
     ```javascript
     localStorage.setItem('rd_api_key', 'YOUR_API_KEY');
     ```

## Usage

1. Open the application in your web browser.
2. Enter your Real-Debrid API key to authenticate.
3. Navigate to the Downloads or Torrents section to manage your files.
4. Use the search bar to quickly find specific downloads or torrents.
5. Apply filters to narrow down your results based on type or status.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Real-Debrid API](https://developer.real-debrid.com/) for providing the API to manage downloads and torrents.

---