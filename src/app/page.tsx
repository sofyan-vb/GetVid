'use client';

import { useState } from 'react';



type PayloadType = {
  url: string;
  downloadMode: string | null;
  videoQuality?: string;
  audioFormat?: string;
};

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [videoQuality, setVideoQuality] = useState('1080');
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadMode, setDownloadMode] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleDownload = async () => {
    if (!url) {
      setError('Masukkan URL media terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Deklarasikan payload dengan tipe yang benar
    const payload: PayloadType = {
      url: url,
      downloadMode: downloadMode,
    };

    if (downloadMode === 'auto' || downloadMode === 'mute') {
      payload.videoQuality = videoQuality;
    }
    if (downloadMode === 'auto' || downloadMode === 'audio') {
      payload.audioFormat = audioFormat;
    }

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(data.error?.context?.message || data.error?.message || 'Terjadi kesalahan saat memproses permintaan.');
      }
      
      setResult(data);

    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  const renderResult = () => {
    if (loading) {
      return <p className="loading-message">Sedang memproses... Tunggu sebentar.</p>;
    }
    if (error) {
      return <p className="error-message">Error: {error}</p>;
    }
    if (!result) {
      return null;
    }

    if (result.status === 'redirect' || result.status === 'tunnel') {
      const filename = result.filename || 'file-unduhan';
      return (
        <div className="result-item">
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            download={filename}
          >
            Klik di sini untuk mengunduh: {filename}
          </a>
        </div>
      );
    } else if (result.status === 'picker') {
      return (
        <div>
          <h3 className="sub-heading">Pilih file untuk diunduh:</h3>
          {result.picker.map((item: any, index: number) => (
            <div key={index} className="result-item">
              <p>Tipe: {item.type}</p>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                download
              >
                Unduh {item.type}
              </a>
            </div>
          ))}
        </div>
      );
    }
    return <p className="error-message">Respons tidak valid dari API.</p>;
  };

  return (
    <div className="container">
      <h1 className="heading">GetVid.id</h1>
      <p className="description">Unduh video dan audio dari berbagai platform dengan tautan</p>

      <div className="input-group">
        <span className="icon">🔗</span>
        <input 
          type="url" 
          id="url" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="Tempel link video Anda di sini..." 
          required 
        />
      </div>

      <div className="button-group">
        <button 
          className="btn-primary" 
          onClick={() => { setDownloadMode('auto'); setShowOptions(true); }}
        >
         Download Video
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => { setDownloadMode('audio'); setShowOptions(true); }}
        >
         Convert to Audio
        </button>
      </div>

      {showOptions && (
        <div className="options-container">
          {downloadMode !== 'audio' && (
            <div id="video-options" className="form-group">
              <label htmlFor="videoQuality">Kualitas Video:</label>
              <select 
                id="videoQuality" 
                name="videoQuality" 
                value={videoQuality} 
                onChange={(e) => setVideoQuality(e.target.value)}
              >
                <option value="1080">1080p (Default)</option>
                <option value="max">Maksimum</option>
                <option value="2160">2160p</option>
                <option value="1440">1440p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
                <option value="360">360p</option>
                <option value="240">240p</option>
                <option value="144">144p</option>
              </select>
            </div>
          )}
          {downloadMode !== 'mute' && (
            <div id="audio-options" className="form-group">
              <label htmlFor="audioFormat">Format Audio:</label>
              <select 
                id="audioFormat" 
                name="audioFormat" 
                value={audioFormat} 
                onChange={(e) => setAudioFormat(e.target.value)}
              >
                <option value="mp3">MP3</option>
                <option value="best">Terbaik</option>
                <option value="ogg">OGG</option>
                <option value="wav">WAV</option>
                <option value="opus">OPUS</option>
              </select>
            </div>
          )}
          <button onClick={handleDownload} disabled={loading} className="btn-start">
            {loading ? 'Processing...' : 'Start Download'}
          </button>
        </div>
      )}

      <div id="results" className="results-container">
        {renderResult()}
      </div>
    </div>
  );
}
