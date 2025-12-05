import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, Save, Check, BookmarkCheck, Clock, TrendingUp, Mail, Calendar, Shield, Edit2, X } from 'lucide-react';

import config from '../config';

const USERS_API = config.API_BASE_URL + '/users';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '' });
    const [editStatus, setEditStatus] = useState({ loading: false, error: '', success: '' });

    useEffect(() => {
        if (user?.id) {
            axios.get(`${USERS_API}/${user.id}`)
                .then(res => {
                    setUserData(res.data);
                    setLoading(false);
                    setEditData({ name: res.data.name, email: res.data.email });
                })
                .catch(err => {
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
            setStatus({ loading: false, error: "Failed to update password. Try again.", success: '' });
        }
    };

    const handleSaveProfile = async () => {
        setEditStatus({ loading: true, error: '', success: '' });

        if (!editData.name.trim() || !editData.email.trim()) {
            setEditStatus({ loading: false, error: "Name and Email are required.", success: '' });
            return;
        }

        try {
            const resp = await axios.patch(`${USERS_API}/${user.id}`, {
                name: editData.name,
                email: editData.email
            });

            const updatedUser = { ...user, name: resp.data.name, email: resp.data.email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setEditStatus({ loading: false, error: '', success: 'Profile updated!' });
            setIsEditing(false);
        } catch (err) {
            console.error("Profile update failed", err);
            setEditStatus({ loading: false, error: "Failed to update profile.", success: '' });
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({ name: user.name, email: user.email });
        setEditStatus({ loading: false, error: '', success: '' });
    };

    if (!user) return <div className="p-10 text-center text-gray-400">Please log in to view profile.</div>;
    if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Loading profile...</div>;

    // Calculate statistics
    const bookmarksCount = userData?.bookmarks?.length || 0;
    const historyCount = userData?.history?.length || 0;
    const totalActivity = bookmarksCount + historyCount;
    const readingStreak = historyCount > 0 ? Math.min(Math.floor(historyCount / 3), 30) : 0;

    // Get unique sources
    const uniqueSources = userData?.bookmarks?.reduce((acc, bookmark) => {
        if (typeof bookmark === 'object' && bookmark.source) {
            if (!acc.includes(bookmark.source)) acc.push(bookmark.source);
        }
        return acc;
    }, []) || [];

    const stats = [
        { icon: <BookmarkCheck size={20} />, label: 'Bookmarked', value: bookmarksCount, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { icon: <Clock size={20} />, label: 'Read Articles', value: historyCount, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { icon: <TrendingUp size={20} />, label: 'Total Activity', value: totalActivity, color: 'text-green-400', bg: 'bg-green-500/10' },
        { icon: <Shield size={20} />, label: 'Streak', value: `${readingStreak} days`, color: 'text-orange-400', bg: 'bg-orange-500/10' }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Profile & Settings</h1>
                <p className="text-gray-400">Manage your account and view insights.</p>
            </header>

            {/* Profile Hero */}
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-blue-500/20 shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 w-full text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                            {isEditing ? (
                                <input
                                    className="input-field text-xl font-bold py-1 px-3 w-full sm:w-auto"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    placeholder="Your Name"
                                />
                            ) : (
                                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            )}

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    title="Edit Profile"
                                >
                                    <Edit2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
                            {isEditing ? (
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Mail size={16} />
                                    <input
                                        className="input-field py-1 px-3 text-sm w-full sm:w-64"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        placeholder="Email Address"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                                    <Mail size={14} />
                                    <span>{user.email}</span>
                                </div>
                            )}

                            {!isEditing && (
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                                    <Calendar size={14} />
                                    <span>Member since {new Date().getFullYear()}</span>
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={editStatus.loading}
                                    className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
                                >
                                    {editStatus.loading ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="btn-ghost py-1.5 px-4 text-sm flex items-center gap-2"
                                >
                                    <X size={14} /> Cancel
                                </button>
                            </div>
                        )}

                        {editStatus.error && <p className="text-red-400 text-sm mt-2">{editStatus.error}</p>}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-panel p-5 rounded-2xl flex flex-col items-center sm:items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide opacity-80">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Insights Panel */}
                <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-400" />
                        Reading Insights
                    </h3>

                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-sm">Engagement Score</span>
                                <span className="text-white font-bold">{Math.min(totalActivity * 2, 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(totalActivity * 2, 100)}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Favorite Sources</p>
                            <div className="flex flex-wrap gap-2">
                                {uniqueSources.length > 0 ? (
                                    uniqueSources.slice(0, 5).map((source, idx) => (
                                        <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 text-gray-300 text-sm border border-white/5">
                                            {source}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500 text-sm italic">No data yet</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Panel */}
                <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-orange-400" />
                        Security
                    </h3>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">New Password</label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>

                        {status.error && (
                            <div className="p-3 rounded-lg bg-red-500/10 text-red-200 text-sm border border-red-500/20">
                                {status.error}
                            </div>
                        )}
                        {status.success && (
                            <div className="p-3 rounded-lg bg-green-500/10 text-green-200 text-sm border border-green-500/20 flex items-center gap-2">
                                <Check size={16} /> {status.success}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={status.loading}
                                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {status.loading ? 'Updating...' : <><Save size={18} /> Update Password</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
