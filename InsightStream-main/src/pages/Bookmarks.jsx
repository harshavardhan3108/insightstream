import React, { useEffect, useState } from 'react';
import axios from 'axios';

const USERS_API = 'http://localhost:3000/users';

const Bookmarks = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userObj, setUserObj] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        if (userObj) {
            axios.get(`${USERS_API}/${userObj.id}`)
                .then(res => {
                    setBookmarks(res.data.bookmarks || []);
                })
                .catch(err => console.error("Error fetching bookmarks:", err))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const handleRemoveBookmark = async (articleIdOrTitle) => {
        if (!userObj) return;

        // Filter out the bookmark. Handle both object (id/url) and string (legacy)
        const updatedBookmarks = bookmarks.filter(b => {
            if (typeof b === 'string') return b !== articleIdOrTitle;
            // If object, compare ID or URL
            return b.id !== articleIdOrTitle && b.url !== articleIdOrTitle;
        });

        setBookmarks(updatedBookmarks);

        try {
            const newUserObj = { ...userObj, bookmarks: updatedBookmarks };
            setUserObj(newUserObj);
            localStorage.setItem('user', JSON.stringify(newUserObj));
            await axios.patch(`${USERS_API}/${userObj.id}`, { bookmarks: updatedBookmarks });
        } catch (err) {
            console.error("Failed to remove bookmark", err);
        }
    };

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
                } catch (err) {
                    console.error("Failed to save history", err);
                }
            }
        }
    };

    if (loading) return <div className="p-10 text-center"><div className="glass-neu rounded-xl p-8 text-gray-400">Loading bookmarks...</div></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="glass-neu rounded-2xl p-6 mb-8 inline-block">
                <h1 className="text-3xl font-bold text-gray-100">
                    Your Bookmarks
                </h1>
            </div>

            {bookmarks.length === 0 ? (
                <div className="text-center p-10 glass-neu rounded-xl">
                    <p className="text-gray-400">No bookmarks saved yet.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
                    {bookmarks.map((item, index) => {
                        // Handle legacy string bookmarks
                        if (typeof item === 'string') {
                            return (
                                <div key={index} className="p-6 card-glass-hover group relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 glass rounded-lg text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                                        </div>
                                        <button onClick={() => handleRemoveBookmark(item)} className="text-gray-500 hover:text-gray-300 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-100 mb-2 line-clamp-2">{item}</h3>
                                    <p className="text-xs text-gray-500 italic">Legacy bookmark</p>
                                </div>
                            );
                        }

                        // Handle full object bookmarks
                        return (
                            <div
                                key={item.id || index}
                                className="group relative card-glass-hover overflow-hidden"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    {item.urlToImage ? (
                                        <img
                                            src={item.urlToImage}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full neu-inset flex items-center justify-center text-gray-500">
                                            <span className="text-4xl">📰</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleRemoveBookmark(item.id || item.url)}
                                        className="absolute top-3 right-3 p-2 rounded-xl glass transition-all"
                                        title="Remove Bookmark"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-gray-300 hover:text-gray-100 transition-colors"
                                        >
                                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-6 relative">
                                    <h2 className="text-lg font-bold mb-2 text-gray-100 leading-tight group-hover:text-gray-50 transition-colors">
                                        {item.title}
                                    </h2>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs text-gray-500 font-mono glass rounded-lg px-2 py-1">{item.source}</span>
                                        <button
                                            onClick={() => handleReadMore(item)}
                                            className="btn-glass text-sm font-semibold uppercase tracking-wider"
                                        >
                                            Read More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Bookmarks;
