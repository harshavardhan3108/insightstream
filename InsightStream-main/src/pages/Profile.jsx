import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, Save, Check, BookmarkCheck, Clock, TrendingUp, Mail, Calendar, Shield } from 'lucide-react';

const USERS_API = 'http://localhost:3000/users';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    // Fetch full user data from API
    useEffect(() => {
        if (user?.id) {
            axios.get(`${USERS_API}/${user.id}`)
                .then(res => {
                    setUserData(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching user data:", err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });

        if (passwords.new !== passwords.confirm) {
            setStatus({ loading: false, error: "Passwords don't match", success: '' });
            return;
        }

        if (passwords.new.length < 6) {
            setStatus({ loading: false, error: "Password must be at least 6 characters", success: '' });
            return;
        }

        try {
            const resp = await axios.patch(`${USERS_API}/${user.id}`, { password: passwords.new });
            const updatedUser = { ...user, ...resp.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setStatus({ loading: false, error: '', success: 'Password updated successfully!' });
            setPasswords({ new: '', confirm: '' });
        } catch (err) {
            console.error("Error updating password:", err);
            setStatus({ loading: false, error: "Failed to update password. Try again.", success: '' });
        }
    };

    if (!user) return <div className="p-10 text-center"><div className="glass-neu rounded-xl p-6 text-gray-300">Please log in.</div></div>;

    if (loading) return <div className="p-10 text-center"><div className="glass-neu rounded-xl p-8 text-gray-300">Loading profile...</div></div>;

    // Calculate statistics
    const bookmarksCount = userData?.bookmarks?.length || 0;
    const historyCount = userData?.history?.length || 0;
    const totalActivity = bookmarksCount + historyCount;
    const readingStreak = historyCount > 0 ? Math.min(Math.floor(historyCount / 3), 30) : 0; // Simple streak calculation

    // Get unique sources from bookmarks
    const uniqueSources = userData?.bookmarks?.reduce((acc, bookmark) => {
        if (typeof bookmark === 'object' && bookmark.source) {
            if (!acc.includes(bookmark.source)) {
                acc.push(bookmark.source);
            }
        }
        return acc;
    }, []) || [];

    const stats = [
        {
            icon: <BookmarkCheck size={24} />,
            label: 'Articles Bookmarked',
            value: bookmarksCount,
            color: 'text-gray-200'
        },
        {
            icon: <Clock size={24} />,
            label: 'Articles Read',
            value: historyCount,
            color: 'text-gray-200'
        },
        {
            icon: <TrendingUp size={24} />,
            label: 'Total Activity',
            value: totalActivity,
            color: 'text-gray-200'
        },
        {
            icon: <Shield size={24} />,
            label: 'Reading Streak',
            value: `${readingStreak} days`,
            color: 'text-gray-200'
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2">Profile</h1>
                <p className="text-gray-400">Manage your account settings and view your activity</p>
            </div>

            {/* Profile Header Card */}
            <div className="glass-neu rounded-2xl p-6 sm:p-8 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-24 h-24 rounded-full neu-outset flex items-center justify-center text-4xl font-bold text-gray-200 flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">{user.name}</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>Member since {new Date().getFullYear()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-neu rounded-xl p-4 sm:p-6 hover:glass-neu-hover transition-all">
                        <div className="flex flex-col items-start gap-3">
                            <div className={`${stat.color} mb-2`}>
                                {stat.icon}
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-100 mb-1">
                                {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-400 leading-tight">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Bookmarks Summary */}
                <div className="glass-neu rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <BookmarkCheck size={20} className="text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-100">Bookmarks Summary</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Total Bookmarks</span>
                            <span className="text-lg font-bold text-gray-200">{bookmarksCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Unique Sources</span>
                            <span className="text-lg font-bold text-gray-200">{uniqueSources.length}</span>
                        </div>
                        {uniqueSources.length > 0 && (
                            <div className="pt-3 border-t border-gray-700/50">
                                <p className="text-xs text-gray-500 mb-2">Top Sources:</p>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueSources.slice(0, 3).map((source, idx) => (
                                        <span key={idx} className="text-xs glass rounded-lg px-2 py-1 text-gray-300">
                                            {source}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reading Activity */}
                <div className="glass-neu rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock size={20} className="text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-100">Reading Activity</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Articles Read</span>
                            <span className="text-lg font-bold text-gray-200">{historyCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Reading Streak</span>
                            <span className="text-lg font-bold text-gray-200">{readingStreak} days</span>
                        </div>
                        <div className="pt-3 border-t border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-2">Recent Activity:</p>
                            <div className="space-y-1">
                                {userData?.history?.slice(-3).reverse().map((item, idx) => (
                                    <div key={idx} className="text-xs text-gray-400 truncate">
                                        • {item}
                                    </div>
                                ))}
                                {(!userData?.history || userData.history.length === 0) && (
                                    <p className="text-xs text-gray-500 italic">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="glass-neu rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Lock size={24} className="text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-100">Security Settings</h3>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">New Password</label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    {status.error && (
                        <div className="glass rounded-lg p-3 border border-gray-700/50">
                            <p className="text-sm text-gray-300">{status.error}</p>
                        </div>
                    )}
                    {status.success && (
                        <div className="glass rounded-lg p-3 border border-gray-600/50">
                            <p className="text-sm text-gray-200 flex items-center gap-2">
                                <Check size={16} /> {status.success}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status.loading}
                        className="btn-neu w-full sm:w-auto px-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status.loading ? 'Saving...' : <><Save size={18} /> Update Password</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
