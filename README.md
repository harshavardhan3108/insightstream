# InsightStream - Personal News Aggregator

InsightStream is a modern, user-centric news aggregation platform designed for tech-savvy enthusiasts. It combines real-time news fetching with personalized content management, allowing users to discover, save, and track news articles across multiple categories.

## 🚀 Key Features

*   **Real-Time News Aggregation**: Fetches live news from NewsData.io API across categories like Technology, Sports, Entertainment, and Business.
*   **User Authentication**: Secure login and registration system with session management.
*   **Personalized Dashboard**: Welcome message, category filtering, and quick access to widgets.
*   **Bookmark System**: Save articles for later reading with a dedicated bookmarks page.
*   **Reading History**: Automatically tracks read articles and provides a history view.
*   **Modern UI/UX**: Built with Glassmorphism and Neomorphism design principles, featuring a dark theme and smooth animations.
*   **Responsive Design**: Fully responsive interface for desktop, tablet, and mobile devices.

## 🛠️ Tech Stack

*   **Frontend**: React 18, Vite
*   **Routing**: React Router DOM v6
*   **Styling**: Tailwind CSS v4 (with custom glass/neo-morphism theme)
*   **Icons**: Lucide React
*   **HTTP Client**: Axios
*   **Backend (Mock)**: JSON Server (for user data and persistence)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js**: v18.x or higher
*   **npm**: v8.x or higher

## ⚙️ Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/InsightStream.git
    cd InsightStream-main
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    This project requires a NewsData.io API key.
    
    *   Sign up at [NewsData.io](https://newsdata.io/) to get your API key.
    *   Find the API key reference in `src/pages/Home.jsx` and `src/pages/News.jsx` and replace it with your key.
    *   *(Recommended)* Create a `.env` file in the root directory:
        ```env
        VITE_NEWSDATA_KEY=your_api_key_here
        ```
        *Note: You may need to update the fetch calls to use `import.meta.env.VITE_NEWSDATA_KEY` if you choose this method.*

## 🏃‍♂️ Running the Application

This application requires two separate processes to run simultaneously: the backend (JSON Server) and the frontend (Vite).

1.  **Start the Backend (JSON Server)**
    Open a terminal and run:
    ```bash
    npx json-server --watch data/db.json --port 3000
    ```
    *   **Important**: The server must run on port **3000** for authentication to work.

2.  **Start the Frontend**
    Open a second terminal window and run:
    ```bash
    npm run dev
    ```

3.  **Access the App**
    Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

```
InsightStream-main/
├── data/               # Backend data (db.json)
├── src/
│   ├── components/     # Reusable UI components (Navbar, Cards, etc.)
│   ├── pages/          # Page components (Home, News, Login, etc.)
│   ├── context/        # React Context providers
│   ├── api/            # API configurations
│   ├── assets/         # Static assets
│   └── App.jsx         # Main application routes
├── public/             # Public static files
└── index.html          # Entry HTML
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

