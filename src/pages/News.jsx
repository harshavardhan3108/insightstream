import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Bookmark, ExternalLink, Loader } from 'lucide-react';

const NEWSDATA_BASE = 'https://newsdata.io/api/1/latest';
const NEWSDATA_APIKEY = "pub_5c4bf65702234c70806df21e1af102bd";
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
        window.open(article.url, "_blank");
        if (userObj) {
            const historyItem = article.title;
            const currentHistory = userObj.history || [];
            if (currentHistory[currentHistory.length - 1] !== historyItem) {
                const updatedHistory = [...currentHistory, historyItem];
                try {
                    const newUserObj = { ...userObj, history: updatedHistory };
                    setUserObj(newUserObj);
                    localStorage.setItem('user', JSON.stringify(newUserObj));
                    await axios.patch(`${USERS_API}/${userObj.id}`, { history: updatedHistory });
                } catch (err) { }
            }
        }
    };

    const isBookmarked = (article) => {
        if (!userObj || !userObj.bookmarks) return false;
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
            updatedBookmarks = updatedBookmarks.filter(b => {
                if (typeof b === 'string') return b !== article.title;
                return b.url !== article.url;
            });
        } else {
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

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                    Latest Headlines
                </h1>
                <p className="text-gray-400 mt-2">Curated top stories from around the world.</p>
            </header>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-center">
                    {error}
                </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((news) => (
                    <article
                        key={news.id}
                        className="group relative glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer"
                        onClick={() => handleReadMore(news)}
                    >
                        <div className="relative h-48 overflow-hidden bg-gray-800">
                            {news.urlToImage ? (
                                <img
                                    src={news.urlToImage}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <span className="text-4xl">📰</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />

                            <button
                                onClick={(e) => { e.stopPropagation(); handleBookmark(news); }}
                                className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur transition-all ${isBookmarked(news) ? 'bg-blue-500 text-white' : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'}`}
                            >
                                <Bookmark size={18} fill={isBookmarked(news) ? "currentColor" : "none"} />
                            </button>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                            <h2 className="text-lg font-bold text-gray-100 mb-2 leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
                                {news.title}
                            </h2>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                                {news.description}
                            </p>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{news.source || 'Unknown'}</span>
                                <span className="text-sm font-medium text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Read <ExternalLink size={14} />
                                </span>
                            </div>
                        </div>
                    </article>
                ))}

                {loading && Array.from({ length: 3 }).map((_, i) => (
                    <div key={`param-${i}`} className="glass-panel h-80 rounded-2xl animate-pulse" />
                ))}
            </div>

            {nextPage && !loading && (
                <div className="mt-12 text-center pb-8">
                    <button
                        onClick={() => fetchNews(nextPage)}
                        className="btn-primary px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                        Load More Stories
                    </button>
                </div>
            )}
        </div>
    );
};

export default News;
