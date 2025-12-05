import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';

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

        const updatedBookmarks = bookmarks.filter(b => {
            if (typeof b === 'string') return b !== articleIdOrTitle;
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
                } catch (err) { }
            }
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Loading bookmarks...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    Your Bookmarks
                </h1>
                <p className="text-gray-400 mt-2">Access your saved articles securely.</p>
            </header>

            {bookmarks.length === 0 ? (
                <div className="text-center p-12 glass-panel rounded-2xl border-dashed border-2 border-white/5">
                    <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No bookmarks saved yet.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarks.map((item, index) => {
                        if (typeof item === 'string') {
                            return (
                                <div key={index} className="p-6 glass-panel rounded-xl relative group">
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{item}</h3>
                                    <p className="text-xs text-gray-500 italic mb-4">Legacy bookmark</p>
                                    <button
                                        onClick={() => handleRemoveBookmark(item)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )
                        }

                        return (
                            <div key={item.id || index} className="group relative glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col h-full">
                                <div className="relative h-48 overflow-hidden bg-gray-800">
                                    {item.urlToImage ? (
                                        <img
                                            src={item.urlToImage}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <Bookmark size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveBookmark(item.id || item.url); }}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur text-white/70 hover:text-red-400 hover:bg-black/60 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <h2 className="text-lg font-bold text-gray-100 mb-2 line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                                        {item.title}
                                    </h2>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                                        {item.description}
                                    </p>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{item.source || 'Unknown'}</span>
                                        <button
                                            onClick={() => handleReadMore(item)}
                                            className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                        >
                                            Read <ExternalLink size={14} />
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
