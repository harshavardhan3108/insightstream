// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const USERS_API = 'http://localhost:3000/users';


const NEWSDATA_BASE = 'https://newsdata.io/api/1/latest';
const NEWSDATA_APIKEY = "pub_1718a49750a8499cbd2e03296ff82c2e";
const NEWS_COUNTRY = 'ind'; // change if desired

const categories = [
  { key: 'general', label: 'General' },
  { key: 'technology', label: 'Tech' },
  { key: 'sports', label: 'Sports' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'business', label: 'Business' }
];

const Home = () => {
  const navigate = useNavigate();

  // read logged user from localStorage
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();
  const loggedEmail = saved?.email || null;

  // user state
  const [userObj, setUserObj] = useState(null);
  const [userLoading, setUserLoading] = useState(Boolean(!userObj));
  const [userError, setUserError] = useState('');

  // history/bookmark state
  const [newHistoryItem, setNewHistoryItem] = useState('');
  const [updating, setUpdating] = useState(false);

  // news state
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [articles, setArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState('');

  // view state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // fetch user object
  useEffect(() => {
    if (!loggedEmail) {
      navigate('/', { replace: true });
      return;
    }

    let cancelled = false;
    setUserLoading(true);
    setUserError('');

    axios
      .get(`${USERS_API}?email=${encodeURIComponent(loggedEmail)}`)
      .then((resp) => {
        if (cancelled) return;
        const users = resp.data || [];
        const found = users[0];

        if (!found) {
          setUserError('Logged-in user record not found on server. You may have been removed or the backend is not running.');
          setUserObj(null);
        } else {
          setUserObj(found);
        }
      })
      .catch((err) => {
        console.error('Home fetch error:', err);
        setUserError('Could not reach the users API at http://localhost:3000. Is json-server running?');
      })
      .finally(() => {
        if (!cancelled) setUserLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loggedEmail, navigate]);

  // fetch news using NewsData.io
  const fetchNews = useCallback(
    async (category) => {
      setNewsLoading(true);
      setNewsError('');
      setArticles([]);

      if (!NEWSDATA_APIKEY) {
        setNewsError('NewsData API key not provided. Set REACT_APP_NEWSDATA_KEY or NEWSDATA_APIKEY.');
        setNewsLoading(false);
        return;
      }

      // helper to call NewsData with given params and return resp.data (or throw)
      const callNewsData = async (params) => {
        const resp = await axios.get(NEWSDATA_BASE, { params });
        return resp.data;
      };

      // attempt sequence: most specific -> simpler fallbacks
      const attempts = [
        // attempt 1: country + language
        () => {
          const p = { apikey: NEWSDATA_APIKEY, country: NEWS_COUNTRY, language: 'en' };
          if (category && category !== 'general') p.category = category;
          return p;
        },
        // attempt 2: drop country, keep language
        () => {
          const p = { apikey: NEWSDATA_APIKEY, language: 'en' };
          if (category && category !== 'general') p.category = category;
          return p;
        },
        // attempt 3: bare minimum
        () => {
          const p = { apikey: NEWSDATA_APIKEY };
          if (category && category !== 'general') p.category = category;
          return p;
        }
      ];

      let done = false;
      let lastError = null;
      for (let i = 0; i < attempts.length && !done; i++) {
        const params = attempts[i]();
        try {
          console.info('NewsData attempt params:', params);
          const data = await callNewsData(params);

          // NewsData often returns shape like { status: 'ok', results: [...] } or { status: 'error', results: {...} }
          if (data?.status === 'error') {
            // API-level error: record it and try the next attempt
            console.warn('NewsData returned status=error', data);
            lastError = { msg: 'API returned error', body: data };
            continue;
          }

          const results = data?.results || data?.news || data?.docs || [];
          if (!Array.isArray(results)) {
            // sometimes 'results' is an object on error; treat as failure and try next attempt
            console.warn('NewsData results not array', results);
            lastError = { msg: 'Unexpected results shape', body: results };
            continue;
          }

          // normalize
          const normalized = results.map((r, idx) => ({
            id: r.link || r.url || r.guid || String(idx),
            title: r.title || (r.description ? r.description.split('\n')[0] : 'Untitled'),
            description: r.description || r.content || '',
            url: r.link || r.url || '',
            urlToImage: r.image_url || r.image || r.thumbnail || '',
            source: r.source_id || r.source || r.source_name || ''
          }));

          setArticles(normalized.slice(0, 10));
          done = true;
          break;
        } catch (err) {
          // save last error and continue to next attempt
          console.error(`NewsData attempt ${i + 1} failed:`, err);
          if (err?.response) {
            console.error('NewsData response body:', err.response.data);
            lastError = err.response.data;
          } else {
            lastError = { message: err.message || String(err) };
          }
          // keep trying next param set
        }
      } // end for

      // if no attempt worked, show friendly message and keep console logs for debugging
      if (!done) {
        console.error('All NewsData attempts failed. Last error:', lastError);
        // try to extract an API message if present
        const apiMsg =
          (lastError && (lastError.message || lastError.msg || lastError.error || lastError.result || lastError.results?.message)) ||
          'Failed to fetch news from NewsData. Check API key, allowed origins, and query params.';
        setNewsError(Array.isArray(apiMsg) ? JSON.stringify(apiMsg) : String(apiMsg));
        setArticles([]); // empty fallback
      }

      setNewsLoading(false);
    },
    []
  );


  // refetch on category change
  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory, fetchNews]);

  // add history item
  const handleAddHistory = async (e) => {
    e.preventDefault();
    if (!newHistoryItem?.trim() || !userObj) return;
    setUpdating(true);
    const updatedHistory = [...(userObj.history || []), newHistoryItem.trim()];

    try {
      const resp = await axios.patch(`${USERS_API}/${userObj.id}`, { history: updatedHistory });
      setUserObj(resp.data);
      setNewHistoryItem('');
    } catch (err) {
      console.error('update history error', err);
      alert('Failed to update history. Check backend or network.');
    } finally {
      setUpdating(false);
    }
  };

  // check if bookmarked
  const isBookmarked = (article) => {
    if (!userObj || !userObj.bookmarks) return false;
    return userObj.bookmarks.some(b => {
      if (typeof b === 'string') return b === article.title;
      return b.url === article.url;
    });
  };

  // bookmark an article
  const handleBookmark = async (article) => {
    if (!userObj) {
      alert('User not found');
      return;
    }

    let updatedBookmarks = [...(userObj.bookmarks || [])];
    const exists = isBookmarked(article);

    if (exists) {
      // Remove
      updatedBookmarks = updatedBookmarks.filter(b => {
        if (typeof b === 'string') return b !== article.title;
        return b.url !== article.url;
      });
    } else {
      // Add full object
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
      const resp = await axios.patch(`${USERS_API}/${userObj.id}`, { bookmarks: updatedBookmarks });
      setUserObj(resp.data);
      localStorage.setItem('user', JSON.stringify(resp.data));
    } catch (err) {
      console.error('bookmark error', err);
      alert('Failed to save bookmark.');
    }
  };

  // handle read more (open link + save history)
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

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  if (userLoading) return <div className="p-6"><div className="glass rounded-xl p-8 text-center text-gray-300">Loading user...</div></div>;

  if (userError)
    return (
      <div className="p-6">
        <div className="glass-neu rounded-xl p-6">
          <p className="text-gray-300 mb-4">{userError}</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="btn-glass">
              Return to Login
            </button>
            <button onClick={() => window.location.reload()} className="btn-neu">
              Retry
            </button>
          </div>
        </div>
      </div>
    );

  if (!userObj)
    return (
      <div className="p-6">
        <div className="glass-neu rounded-xl p-6">
          <p className="text-gray-300">
            No user data available. <button onClick={logout} className="btn-glass ml-2">Sign out</button>
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <header className="flex items-start justify-between gap-4 mb-8">
        <div className="glass-neu rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-100">
            Welcome back, <span className="text-gray-300">{userObj.name}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">Here is your personalized feed</p>
        </div>
      </header>

      {/* Categories */}
      <nav className="mb-8 overflow-x-auto pb-2">
        <div className="flex gap-3">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap ${
                selectedCategory === c.key
                  ? 'neu-inset text-gray-100 font-semibold'
                  : 'btn-neu text-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </nav>

      {/* News Grid */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="glass-neu rounded-xl px-4 py-2">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-100">
              <span className="w-1 h-6 bg-gray-400 rounded-full"></span>
              Top Stories
            </h2>
          </div>

          <div className="flex items-center gap-2 glass-neu rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'neu-inset text-gray-100' : 'text-gray-400 hover:text-gray-200'}`}
              title="Grid View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'neu-inset text-gray-100' : 'text-gray-400 hover:text-gray-200'}`}
              title="List View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
          </div>
        </div>

        {newsError && <div className="text-gray-300 mb-3 p-4 glass-neu rounded-xl border border-gray-700/50">{newsError}</div>}

        {newsLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`glass-neu animate-pulse rounded-xl ${viewMode === 'grid' ? 'h-64' : 'h-32'}`} />
            ))}
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {articles.map((a, idx) => (
              <article
                key={a.id ?? idx}
                className={`card-glass-hover group ${viewMode === 'list' ? 'flex' : ''}`}
              >
                {a.urlToImage ? (
                  <div className={`overflow-hidden rounded-t-xl ${viewMode === 'list' ? 'w-48 h-full shrink-0 rounded-l-xl rounded-tr-none' : 'h-48 w-full'}`}>
                    <img src={a.urlToImage} alt={a.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                ) : (
                  <div className={`neu-inset flex items-center justify-center text-gray-500 ${viewMode === 'list' ? 'w-48 h-full shrink-0 rounded-l-xl' : 'h-48 w-full rounded-t-xl'}`}>
                    <span>No Image</span>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg mb-2 text-gray-100 leading-tight group-hover:text-gray-50 transition-colors line-clamp-2">{a.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">{a.description || ''}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-mono glass rounded-lg px-2 py-1">{a.source || 'Unknown'}</span>
                      <button onClick={() => handleBookmark(a)} className={`transition-colors ${isBookmarked(a) ? 'text-gray-200' : 'text-gray-500 hover:text-gray-300'}`} title="Bookmark">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked(a) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                      </button>
                    </div>

                    <button onClick={() => handleReadMore(a)} className="text-sm font-semibold text-gray-300 hover:text-gray-100 flex items-center gap-1 btn-glass px-3 py-1.5">
                      Read <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions / Mini Dashboard */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* History Widget */}
        <section className="glass-neu p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">Quick History</h2>
            <span className="text-xs text-gray-400 glass rounded-full px-3 py-1">{(userObj.history || []).length} items</span>
          </div>

          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {userObj.history && userObj.history.length > 0 ? (
              userObj.history.slice(-5).reverse().map((h, idx) => (
                <div key={idx} className="text-sm text-gray-300 truncate py-2 px-2 rounded-lg hover:neu-outset transition-all cursor-default">
                  {h}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No history yet.</p>
            )}
          </div>

          <form onSubmit={handleAddHistory} className="flex gap-2">
            <input
              value={newHistoryItem}
              onChange={(e) => setNewHistoryItem(e.target.value)}
              placeholder="Add note..."
              className="flex-1 text-sm"
            />
            <button type="submit" disabled={updating} className="btn-neu text-sm font-semibold disabled:opacity-50">
              Add
            </button>
          </form>
        </section>

        {/* Bookmarks Widget */}
        <section className="glass-neu p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Recent Bookmarks</h2>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
            {userObj.bookmarks && userObj.bookmarks.length > 0 ? (
              userObj.bookmarks.slice(-5).reverse().map((b, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:neu-outset transition-all">
                  <div className="mt-1 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                  </div>
                  <span className="text-sm text-gray-300 line-clamp-2">{b.title || b}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                <p>No bookmarks saved.</p>
                <p className="text-xs mt-1">Click the bookmark icon on articles to save them.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
