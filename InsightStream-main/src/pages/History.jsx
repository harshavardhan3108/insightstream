import React, { useEffect, useState } from 'react';
import axios from 'axios';

const USERS_API = 'http://localhost:3000/users';

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

    if (loading) return <div className="p-10 text-center"><div className="glass-neu rounded-xl p-8 text-gray-400">Loading history...</div></div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="glass-neu rounded-2xl p-6 mb-8 inline-block">
                <h1 className="text-3xl font-bold text-gray-100">
                    Reading History
                </h1>
            </div>

            {history.length === 0 ? (
                <div className="text-center p-10 glass-neu rounded-xl">
                    <p className="text-gray-400">You haven't read any articles yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.slice().reverse().map((item, index) => (
                        <div
                            key={index}
                            className="p-4 glass-neu rounded-xl hover:glass-neu-hover transition-all duration-300 flex items-center gap-4"
                        >
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span className="text-gray-200 font-medium">{item}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
