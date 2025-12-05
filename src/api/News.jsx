import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY";
// If using JSON-Server: const API = "http://localhost:3001/news";

const News = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(API)
      .then((response) => {
        setNewsData(response.data.articles || response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-4 text-xl">Loading...</div>;

  return (
    <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {newsData.map((news, index) => (
        <div
          key={index}
          className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition"
        >
          {news.urlToImage && (
            <img
              src={news.urlToImage}
              alt={news.title}
              className="w-full h-48 object-cover"
            />
          )}

          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">
              {news.title?.substring(0, 60)}...
            </h2>
            <p className="text-gray-600 text-sm mb-3">
              {news.description?.substring(0, 90)}...
            </p>

            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Read More →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default News;
