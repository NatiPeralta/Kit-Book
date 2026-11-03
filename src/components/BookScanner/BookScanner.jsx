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

  // Iniciar a câmera para ler o código de barras (ISBN)
  const startScanning = async () => {
    setScanning(true);
    setScanError('');
    codeReaderRef.current = new BrowserBarcodeReader();

    try {
      const videoInputDevices = await BrowserBarcodeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0]?.deviceId;

      if (!selectedDeviceId) {
        setScanError('Nenhuma câmera encontrada no dispositivo.');
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
            
            // Busca o livro na API do Google Books usando o ISBN lido
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
      console.error(err);
      setScanError('Erro ao acessar a câmera.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };

  // Buscar livro manualmente por texto e adicionar com capa da API
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
        Aponte a câmera para o código de barras (ISBN) do livro ou busque pelo nome para puxar a capa oficial.
      </p>

      {/* Seção da Câmera / Scanner */}
      <div className="camera-box">
        {scanning ? (
          <div className="video-wrapper">
            <video ref={videoRef} className="scanner-video" />
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

      {/* Busca Manual por Título / Autor / ISBN */}
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

      {/* Lista de Livros Selecionados com Capas */}
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