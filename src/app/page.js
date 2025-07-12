'use client';

import { useState } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ImageModal from './components/ImageModal';

export default function Home() {
  const [url, setUrl] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [generationTime, setGenerationTime] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setScreenshot('');
    setImageLoading(false);
    setLoadingProgress(0);
    setGenerationTime(null);
    setTotalTime(null);
    setStartTime(Date.now());

    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const apiEndpoint = '/api/screenshot-simple';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); 

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: processedUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate screenshot');
      }

      clearInterval(progressInterval);
      setLoadingProgress(100);

      const endTime = Date.now();
      const apiTime = ((endTime - startTime) / 1000).toFixed(1);
      setGenerationTime(apiTime);

      console.log('Setting screenshot URL:', data.screenshot);

      try {
        const testResponse = await fetch(data.screenshot, { method: 'HEAD' });
        console.log('Screenshot URL test response:', testResponse.status);
        if (!testResponse.ok) {
          console.warn('Screenshot URL returned error:', testResponse.status);
        }
      } catch (testError) {
        console.warn('Screenshot URL test failed:', testError.message);
      }

      setImageLoading(true);
      setScreenshot(data.screenshot);

      const imageTimeout = setTimeout(() => {
        console.warn('Image loading timeout after 10 seconds');
        setImageLoading(false);
        setError('Image loading timed out. The screenshot service might be slow. Please try again.');
      }, 10000);

      window.imageLoadTimeout = imageTimeout;

      setHistory(prev => {
        const newEntry = { url: processedUrl, timestamp: new Date().toISOString() };
        const exists = prev.some(item => item.url === processedUrl);
        if (!exists) {
          return [newEntry, ...prev.slice(0, 4)];
        }
        return prev;
      });
    } catch (err) {
      clearInterval(progressInterval);

      if (err.name === 'AbortError') {
        setError('Screenshot generation timed out. The website might be slow to load. Please try again.');
      } else {
        setError(err.message || 'Failed to generate screenshot. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');

    if (window.imageLoadTimeout) {
      clearTimeout(window.imageLoadTimeout);
      window.imageLoadTimeout = null;
    }

    setImageLoading(false);

    if (startTime) {
      const totalEndTime = Date.now();
      const totalTimeTaken = ((totalEndTime - startTime) / 1000).toFixed(1);
      setTotalTime(totalTimeTaken);
      console.log(`Total time: ${totalTimeTaken}s`);
    }
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', e);
    console.error('Image URL:', screenshot);

    if (window.imageLoadTimeout) {
      clearTimeout(window.imageLoadTimeout);
      window.imageLoadTimeout = null;
    }

    setImageLoading(false);
    setError('Failed to load screenshot image. The service might be slow or unavailable. Please try again.');
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const cancelLoading = () => {
    setLoading(false);
    setImageLoading(false);
    setError('');

    if (window.imageLoadTimeout) {
      clearTimeout(window.imageLoadTimeout);
      window.imageLoadTimeout = null;
    }
  };

  const generateHash = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const downloadImage = async () => {
    try {
      setError('');
      setIsDownloading(true);
      const hash = generateHash();

      try {
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: screenshot }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `screenshot-${hash}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          setIsDownloading(false);
          return; 
        }
      } catch (proxyError) {
        console.warn('Proxy download failed:', proxyError);
      }

      try {
        const response = await fetch(screenshot, {
          mode: 'cors',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `screenshot-${hash}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          setIsDownloading(false);
          return; 
        }
      } catch (directError) {
        console.warn('Direct download failed:', directError);
      }

      const link = document.createElement('a');
      link.href = screenshot;
      link.download = `screenshot-${hash}.png`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();

      setIsDownloading(false);

    } catch (error) {
      console.error('All download methods failed:', error);
      setError('Download failed. Please try "Open in New Tab" and save manually.');
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website Screenshot Preview 
          </h1>
          <p className="text-lg text-gray-600">
            Enter a website URL to generate a screenshot preview
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">




            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <div className="flex gap-4">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !url || !isValidUrl(url)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {loading ? 'Generating...' : 'Generate Screenshot'}
                </button>
              </div>
            </div>
          </form>

          {loading && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <LoadingSpinner message="Generating screenshot..." />

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(loadingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out progress-shimmer relative"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Cancel button */}
              <div className="mt-4 text-center">
                <button
                  onClick={cancelLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {screenshot && (
          <div className="bg-white rounded-lg shadow-xl p-8 fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Screenshot Preview</h2>
              <div className="flex gap-2 flex-col items-end">
                {generationTime && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    API Response: {generationTime}s
                  </span>
                )}
                {totalTime && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Image Loaded: {totalTime}s
                  </span>
                )}
                {!totalTime && imageLoading && (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full animate-pulse">
                    Loading image...
                  </span>
                )}
              </div>
            </div>

            {/* Image loading state */}
            {imageLoading && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex flex-col items-center justify-center h-96">
                <LoadingSpinner message="Loading screenshot..." />
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Taking longer than expected?
                  </p>
                  <button
                    onClick={cancelLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Screenshot image */}
            <div className={`border border-gray-200 rounded-lg overflow-hidden ${imageLoading ? 'hidden' : 'block'}`}>
              <img
                src={screenshot}
                alt="Website screenshot"
                className="w-full h-auto"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            </div>
            <div className="mt-4 flex gap-4">
              <button
                onClick={openModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                View Full Size
              </button>
              <a
                href={screenshot}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in New Tab
              </a>
              <button
                onClick={downloadImage}
                disabled={isDownloading}
                className={`px-4 py-2 text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer download-btn ${
                  isDownloading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent URLs</h2>
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                  onClick={() => setUrl(item.url)}
                >
                  <span className="text-gray-700 truncate flex-1">{item.url}</span>
                  <span className="text-gray-500 text-sm ml-4">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        imageUrl={screenshot}
        imageAlt="Website screenshot"
      />
    </div>
  );
}
