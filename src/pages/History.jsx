import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, ArrowRight } from 'lucide-react';

import config from '../config';

const USERS_API = config.API_BASE_URL + '/users';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            axios.get(`${USERS_API}/${user.id}`)
                .then(res => {
                    setHistory(res.data.history || []);
                })
                .catch(err => console.error("Error fetching history:", err))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Loading history...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                    <Clock size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Reading History</h1>
                    <p className="text-gray-400">Articles you've read recently.</p>
                </div>
            </header>

            {history.length === 0 ? (
                <div className="text-center p-12 glass-panel rounded-2xl border-dashed border-2 border-white/5">
                    <p className="text-gray-400">You haven't read any articles yet.</p>
                </div>
            ) : (
                <div className="space-y-4 relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-4 bottom-4 w-px bg-white/10 hidden sm:block"></div>

                    {history.slice().reverse().map((item, index) => (
                        <div
                            key={index}
                            className="glass-panel glass-panel-hover p-4 sm:p-5 rounded-2xl flex items-center gap-4 group relative overflow-hidden"
                        >
                            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-black/40 border border-white/10 text-gray-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all shrink-0 z-10">
                                <Clock size={18} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-medium text-gray-200 group-hover:text-white transition-colors truncate">
                                    {item}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Read recently</p>
                            </div>

                            <button className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
