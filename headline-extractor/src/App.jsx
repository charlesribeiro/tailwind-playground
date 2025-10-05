import React, { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  const buildProxyChain = (targetUrl) => [
    // returns raw HTML
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    // expects the raw URL appended (don't encode)
    `https://cors.isomorphic-git.org/${targetUrl}`,
    `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
    `https://yacdn.org/proxy/${targetUrl}`,
    // AllOrigins JSON variant (as last resort)
    `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}#json`,
  ];

  async function fetchHtmlThroughProxies(targetUrl) {
    const candidates = buildProxyChain(targetUrl);

    for (const proxy of candidates) {
      try {
        const res = await fetch(proxy, { method: "GET" });
        if (!res.ok) continue;

        // Handle the AllOrigins JSON variant (we tagged with #json)
        if (proxy.endsWith("#json")) {
          const json = await res.json();
          if (json && json.contents) return json.contents;
          continue;
        }

        // Others return raw HTML
        const text = await res.text();
        if (text && text.length) return text;
      } catch (_err) {
        // try next proxy
      }
    }
    throw new Error("All proxy attempts failed or were blocked.");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a URL.");
      return;
    }
    setLoading(true);
    setError(null);
    setData([]);

    try {
      // Free CORS proxy — some sites may still block scraping
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        url
      )}`;
      const response = await fetch(proxyUrl);

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const htmlString = await fetchHtmlThroughProxies(url);
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");

      const headlines = doc.querySelectorAll("h2");
      const extractedData = Array.from(headlines)
        .map((el) => ({ text: el.textContent.trim() }))
        .filter((item) => item.text);

      if (extractedData.length === 0) {
        setError("No h2 headlines were found on the specified page.");
      } else {
        setData(extractedData);
      }
    } catch (err) {
      setError(
        `Failed to fetch data. Please check the URL or try again. (Error: ${err.message})`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 text-center">
          Headline Extractor
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url-input"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Enter URL to Extract Headlines
            </label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="
      w-full
      px-4 py-2
      border border-slate-300
      rounded-md
      bg-white
      text-slate-800
      placeholder-slate-400
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      outline-none transition-all
    "
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Extracting..." : "Fetch & Extract"}
          </button>
        </form>

        <div className="mt-6">
          {loading && (
            <div className="text-center text-slate-500">
              <p>Fetching and parsing data...</p>
            </div>
          )}

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md"
              role="alert"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {data.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-3">
                Extracted Headlines:
              </h2>
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 border-t pt-4">
                {data.map((item, index) => (
                  <li
                    key={index}
                    className="bg-slate-50 p-3 rounded-md border border-slate-200 text-slate-700"
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
