// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bookmark, ExternalLink, Clock, TrendingUp, Grid, List as ListIcon, Search } from 'lucide-react';
import config from '../config';

const USERS_API = config.API_BASE_URL + '/users';

const NEWSDATA_BASE = 'https://newsdata.io/api/1/latest';
const NEWSDATA_APIKEY = config.NEWSDATA_APIKEY;
const NEWS_COUNTRY = 'ind';

const categories = [
  { key: 'general', label: 'Top Stories' },
  { key: 'technology', label: 'Tech & Science' },
  { key: 'business', label: 'Finance' },
  { key: 'sports', label: 'Sports' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'health', label: 'Health' }
];

const Home = () => {
  const navigate = useNavigate();

  // User State
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();
  const loggedEmail = saved?.email || null;
  const [userObj, setUserObj] = useState(null);
  const [userLoading, setUserLoading] = useState(Boolean(!userObj));
  const [userError, setUserError] = useState('');

  // News State
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [articles, setArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Widget State
  const [newHistoryItem, setNewHistoryItem] = useState('');

  // --- Fetch User ---
  useEffect(() => {
    if (!loggedEmail) {
      navigate('/', { replace: true });
      return;
    }
    let cancelled = false;
    setUserLoading(true);

    axios.get(`${USERS_API}?email=${encodeURIComponent(loggedEmail)}`)
      .then((resp) => {
        if (cancelled) return;
        const found = resp.data?.[0];
        if (!found) {
          setUserError('User record not found.');
          setUserObj(null);
        } else {
          setUserObj(found);
        }
      })
      .catch((err) => {
        console.error('Home fetch error:', err);
        setUserError('Connection failed.');
      })
      .finally(() => !cancelled && setUserLoading(false));

    return () => { cancelled = true; };
  }, [loggedEmail, navigate]);

  // --- Fetch News ---
  const fetchNews = useCallback(async (category) => {
    setNewsLoading(true);
    setNewsError('');
    setArticles([]);

    if (!NEWSDATA_APIKEY) {
      setNewsError('API Key Missing');
      setNewsLoading(false);
      return;
    }

    const attempts = [
      () => ({ apikey: NEWSDATA_APIKEY, country: NEWS_COUNTRY, language: 'en', category: category !== 'general' ? category : undefined }),
      () => ({ apikey: NEWSDATA_APIKEY, language: 'en', category: category !== 'general' ? category : undefined }),
      () => ({ apikey: NEWSDATA_APIKEY, category: category !== 'general' ? category : undefined })
    ];

    let done = false;

    for (const getParams of attempts) {
      if (done) break;
      try {
        const params = getParams();
        const resp = await axios.get(NEWSDATA_BASE, { params });

        if (resp.data?.status === 'error') continue;

        const results = resp.data?.results || [];
        if (!Array.isArray(results)) continue;

        const normalized = results.map((r, idx) => ({
          id: r.article_id || r.link || String(idx),
          title: r.title || 'Untitled Article',
          description: r.description || r.content || '',
          url: r.link || '',
          urlToImage: r.image_url || null,
          source: r.source_id || r.source_name || 'Unknown',
          pubDate: r.pubDate
        })).filter(a => a.url); // Must have URL

        setArticles(normalized.slice(0, 12));
        done = true;
      } catch (err) {
        console.warn('News attempt failed', err);
      }
    }

    if (!done) setNewsError('Unable to load news feed. Please try again later.');
    setNewsLoading(false);
  }, []);

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory, fetchNews]);


  // --- Interactions ---
  const handleBookmark = async (article, e) => {
    e.stopPropagation();
    if (!userObj) return;

    let updatedBookmarks = [...(userObj.bookmarks || [])];
    const exists = updatedBookmarks.some(b => b.url === article.url);

    if (exists) {
      updatedBookmarks = updatedBookmarks.filter(b => b.url !== article.url);
    } else {
      updatedBookmarks.push(article);
    }

    try {
      const resp = await axios.patch(`${USERS_API}/${userObj.id}`, { bookmarks: updatedBookmarks });
      setUserObj(resp.data);
      localStorage.setItem('user', JSON.stringify(resp.data));
    } catch {
      alert('Failed to save bookmark');
    }
  };

  const handleReadMore = async (article) => {
    window.open(article.url, "_blank");
    if (userObj) {
      const history = userObj.history || [];
      if (history[history.length - 1] !== article.title) {
        const updated = [...history, article.title];
        try {
          await axios.patch(`${USERS_API}/${userObj.id}`, { history: updated });
          setUserObj({ ...userObj, history: updated });
        } catch { }
      }
    }
  };

  const isBookmarked = (article) => userObj?.bookmarks?.some(b => b.url === article.url);


  // --- Render ---

  if (userLoading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            {selectedCategory === 'general' ? 'Your Feed' : categories.find(c => c.key === selectedCategory)?.label}
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Welcome back, {userObj?.name}. Here's what's happening.
          </p>
        </div>

        {/* View Toggles & Search */}
        <div className="flex items-center gap-3 p-1 rounded-xl bg-white/5 border border-white/5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <ListIcon size={20} />
          </button>
        </div>
      </header>

      {/* Category Pills */}
      <nav className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === c.key
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <div className="grid lg:grid-cols-12 gap-8">

        {/* Main News Feed */}
        <section className="lg:col-span-8 space-y-6">
          {newsError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200">
              {newsError}
            </div>
          )}

          {newsLoading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-panel h-80 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
              {articles.map((article, idx) => (
                <article
                  key={idx}
                  className={`group relative glass-panel glass-panel-hover rounded-2xl overflow-hidden flex ${viewMode === 'list' ? 'flex-row h-48' : 'flex-col h-full'}`}
                  onClick={() => handleReadMore(article)}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-1/3 min-w-[150px]' : 'h-48 w-full'}`}>
                    {article.urlToImage ? (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                    <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-[10px] font-bold text-white px-2 py-1 rounded-lg border border-white/10 uppercase tracking-wide">
                      {article.source}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1 relative">
                    <h3 className="text-lg font-bold text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                      {article.title}
                    </h3>

                    {viewMode === 'grid' && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2 flex-1">
                        {article.description}
                      </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">
                        {article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'Today'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleBookmark(article, e)}
                          className={`p-2 rounded-full transition-colors ${isBookmarked(article) ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
                        >
                          <Bookmark size={18} fill={isBookmarked(article) ? "currentColor" : "none"} />
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar Widgets */}
        <aside className="lg:col-span-4 space-y-6">

          {/* Recent History */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-blue-500" size={20} />
              <h2 className="text-lg font-bold text-white">Recent History</h2>
            </div>

            <div className="space-y-3">
              {(userObj?.history || []).slice(-5).reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="min-w-[4px] h-4 mt-1.5 rounded-full bg-gray-600 group-hover:bg-blue-500 transition-colors"></div>
                  <p className="text-sm text-gray-300 line-clamp-2">{h}</p>
                </div>
              ))}
              {(!userObj?.history?.length) && <p className="text-gray-500 text-sm">No history yet.</p>}
            </div>
          </div>

          {/* Bookmarks Preview */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bookmark className="text-purple-500" size={20} />
              <h2 className="text-lg font-bold text-white">Saved</h2>
            </div>

            <div className="space-y-4">
              {(userObj?.bookmarks || []).slice(-3).reverse().map((b, i) => (
                <div key={i} className="group cursor-pointer" onClick={() => handleReadMore(b)}>
                  <div className="aspect-video w-full rounded-lg overflow-hidden mb-2 bg-gray-800 relative">
                    {b.urlToImage && <img src={b.urlToImage} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <p className="text-sm font-medium text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-2">{b.title}</p>
                </div>
              ))}
              {(!userObj?.bookmarks?.length) && <p className="text-gray-500 text-sm">No bookmarks yet.</p>}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default Home;
