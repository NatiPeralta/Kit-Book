import { useState, useEffect, useRef } from 'react';
import { BrowserBarcodeReader } from '@zxing/library';
import { searchBookByIsbnOrQuery } from '../../services/googleBooks';
import './BookScanner.css';

export default function BookScanner({ onConfirmBooks, onNext }) {
  const [detectedBooks, setDetectedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  const startScanning = async () => {
    setScanning(true);
    setScanError('');
    codeReaderRef.current = new BrowserBarcodeReader();

    try {
      // Solicita permissão explícita da câmera ao navegador
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      
      // Libera o stream temporariamente para o ZXing usar o elemento de vídeo
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const videoInputDevices = await BrowserBarcodeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0]?.deviceId;

      if (!selectedDeviceId) {
        setScanError('Nenhuma câmera traseira/frontal encontrada.');
        setScanning(false);
        return;
      }

      codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        async (result, err) => {
          if (result) {
            const isbn = result.getText();
            stopScanning();
            setIsLoading(true);
            
            const book = await searchBookByIsbnOrQuery(isbn);
            if (book) {
              setDetectedBooks((prev) => [...prev, book]);
            } else {
              alert(`Livro com ISBN ${isbn} não encontrado na base.`);
            }
            setIsLoading(false);
          }
        }
      );
    } catch (err) {
      console.error('Erro de permissão da câmera:', err);
      setScanError('Permissão de câmera negada ou indisponível neste navegador. Verifique o ícone de bloqueio na barra de endereços.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    const book = await searchBookByIsbnOrQuery(searchQuery);
    
    if (book) {
      setDetectedBooks((prev) => [...prev, book]);
      setSearchQuery('');
    } else {
      alert('Nenhum livro encontrado com esse nome.');
    }
    setIsLoading(false);
  };

  const toggleUnread = (id) => {
    setDetectedBooks((prev) =>
      prev.map((book) => (book.id === id ? { ...book, unread: !book.unread } : book))
    );
  };

  const handleRemoveBook = (id) => {
    setDetectedBooks((prev) => prev.filter((book) => book.id !== id));
  };

  const handleProceedToRaffle = () => {
    const unreadBooks = detectedBooks.filter((book) => book.unread);
    onConfirmBooks(unreadBooks);
    onNext();
  };

  const unreadCount = detectedBooks.filter((b) => b.unread).length;

  return (
    <div className="scanner-container">
      <h3>📷 Leitor de Livros por Código de Barras</h3>
      <p className="scanner-subtitle">
        Aponte a câmera para o código de barras (ISBN) ou busque pelo nome para puxar a capa oficial.
      </p>

      <div className="camera-box">
        {scanning ? (
          <div className="video-wrapper">
            <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />
            <button className="btn-secondary btn-stop" onClick={stopScanning}>
              Parar Câmera ✕
            </button>
          </div>
        ) : (
          <button className="btn-primary btn-start-cam" onClick={startScanning}>
            📸 Ler Código de Barras (Câmera)
          </button>
        )}
        {scanError && <p className="error-message">{scanError}</p>}
      </div>

      <form className="manual-form" onSubmit={handleManualSearch}>
        <h4>🔍 Ou busque pelo Título / ISBN</h4>
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Ex: O Pequeno Príncipe ou 978..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <button type="submit" className="btn-secondary" disabled={isLoading}>
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      <div className="detected-section">
        <div className="detected-header">
          <h4>Sua Lista de Livros ({detectedBooks.length})</h4>
          <span className="unread-badge">{unreadCount} prontos para sorteio</span>
        </div>

        {detectedBooks.length === 0 ? (
          <p className="empty-list-text">Nenhum livro adicionado ainda. Use a câmera ou a busca acima!</p>
        ) : (
          <ul className="books-list">
            {detectedBooks.map((book) => (
              <li key={book.id} className={`book-item ${book.unread ? 'selected' : ''}`}>
                <label className="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    checked={book.unread} 
                    onChange={() => toggleUnread(book.id)} 
                  />
                  {book.thumbnail && <img src={book.thumbnail} alt={book.title} className="book-thumb" />}
                  <div className="book-info">
                    <span className="book-title">{book.title}</span>
                    <span className="book-author">{book.author} • {book.pages} págs</span>
                  </div>
                </label>
                <button className="btn-remove" onClick={() => handleRemoveBook(book.id)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="scanner-actions">
        <button 
          className="btn-primary" 
          onClick={handleProceedToRaffle} 
          disabled={unreadCount === 0}
        >
          Ir para o Sorteio ({unreadCount}) →
        </button>
      </div>
    </div>
  );
}