import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// Using the key from Home.jsx as the original News.jsx had a placeholder
const NEWSDATA_BASE = 'https://newsdata.io/api/1/latest';
const NEWSDATA_APIKEY = "pub_1718a49750a8499cbd2e03296ff82c2e";
const USERS_API = 'http://localhost:3000/users';

const News = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userObj, setUserObj] = useState(JSON.parse(localStorage.getItem('user')));
    const [nextPage, setNextPage] = useState(null);

    const fetchNews = useCallback(async (pageCursor = null) => {
        setLoading(true);
        try {
            let url = `${NEWSDATA_BASE}?apikey=${NEWSDATA_APIKEY}&language=en`;
            if (pageCursor) {
                url += `&page=${pageCursor}`;
            }

            const response = await axios.get(url);
            const results = response.data.results || [];
            setNextPage(response.data.nextPage);

            const normalized = results.map((r, idx) => ({
                id: r.article_id || String(idx),
                title: r.title || 'Untitled',
                description: r.description || r.content || '',
                url: r.link || '',
                urlToImage: r.image_url || '',
                source: r.source_id || ''
            }));

            if (pageCursor) {
                setArticles(prev => [...prev, ...normalized]);
            } else {
                setArticles(normalized);
            }

        } catch (err) {
            console.error("Error fetching news:", err);
            setError("Failed to load news. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleReadMore = async (article) => {
        // Open article
        window.open(article.url, "_blank");

        // Save to history
        if (userObj) {
            const historyItem = article.title;
            const currentHistory = userObj.history || [];

            // Avoid duplicates at the top of the list
            if (currentHistory[currentHistory.length - 1] !== historyItem) {
                const updatedHistory = [...currentHistory, historyItem];
                try {
                    // Optimistic update
                    const newUserObj = { ...userObj, history: updatedHistory };
                    setUserObj(newUserObj);
                    localStorage.setItem('user', JSON.stringify(newUserObj));

                    await axios.patch(`${USERS_API}/${userObj.id}`, { history: updatedHistory });
                } catch (err) {
                    console.error("Failed to save history", err);
                }
            }
        }
    };

    const isBookmarked = (article) => {
        if (!userObj || !userObj.bookmarks) return false;
        // Check if bookmark is an object (new format) or string (old format)
        return userObj.bookmarks.some(b => {
            if (typeof b === 'string') return b === article.title;
            return b.url === article.url;
        });
    };

    const handleBookmark = async (article) => {
        if (!userObj) return;

        let updatedBookmarks = [...(userObj.bookmarks || [])];
        const exists = isBookmarked(article);

        if (exists) {
            // Remove bookmark
            updatedBookmarks = updatedBookmarks.filter(b => {
                if (typeof b === 'string') return b !== article.title;
                return b.url !== article.url;
            });
        } else {
            // Add bookmark (full object)
            updatedBookmarks.push({
                id: article.id,
                title: article.title,
                description: article.description,
                url: article.url,
                urlToImage: article.urlToImage,
                source: article.source
            });
        }

        try {
            const newUserObj = { ...userObj, bookmarks: updatedBookmarks };
            setUserObj(newUserObj);
            localStorage.setItem('user', JSON.stringify(newUserObj));
            await axios.patch(`${USERS_API}/${userObj.id}`, { bookmarks: updatedBookmarks });
        } catch (err) {
            console.error("Failed to update bookmarks", err);
        }
    };

    if (loading && articles.length === 0) return (
        <div className="p-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 glass-neu rounded-xl animate-pulse" />
            ))}
        </div>
    );

    if (error) return <div className="p-10 text-center"><div className="glass-neu rounded-xl p-6 text-gray-300">{error}</div></div>;

    return (
        <div className="p-8">
            <div className="glass-neu rounded-2xl p-6 mb-8 inline-block">
                <h1 className="text-3xl font-bold text-gray-100">Latest Headlines</h1>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((news) => (
                    <div
                        key={news.id}
                        className="group relative card-glass-hover overflow-hidden"
                    >
                        <div className="relative h-48 overflow-hidden">
                            {news.urlToImage ? (
                                <img
                                    src={news.urlToImage}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full neu-inset flex items-center justify-center text-gray-500">
                                    <span className="text-4xl">📰</span>
                                </div>
                            )}

                            <button
                                onClick={(e) => { e.stopPropagation(); handleBookmark(news); }}
                                className="absolute top-3 right-3 p-2 rounded-xl glass transition-all"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill={isBookmarked(news) ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transition-all ${isBookmarked(news) ? 'text-gray-200' : 'text-gray-400 group-hover:text-gray-300'}`}
                                >
                                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 relative">
                            <h2 className="text-lg font-bold mb-2 text-gray-100 leading-tight group-hover:text-gray-50 transition-colors">
                                {news.title}
                            </h2>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                {news.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-xs text-gray-500 font-mono glass rounded-lg px-2 py-1">{news.source}</span>
                                <button
                                    onClick={() => handleReadMore(news)}
                                    className="btn-glass text-sm font-semibold uppercase tracking-wider"
                                >
                                    Read More
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {nextPage && (
                <div className="mt-12 text-center">
                    <button
                        onClick={() => fetchNews(nextPage)}
                        disabled={loading}
                        className="btn-neu px-8 py-3 rounded-full font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More Stories'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default News;
