import { useState, useRef } from 'react';
import { BrowserBarcodeReader } from '@zxing/library';
import { searchBookByIsbnOrQuery } from '../../services/googleBooks';
import './BookScanner.css';

export default function BookScanner({ onConfirmBooks, onNext }) {
  const [detectedBooks, setDetectedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  const fileInputRef = useRef(null);

  // Processar a foto tirada do código de barras
  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setScanError('');

    const imageUrl = URL.createObjectURL(file);
    const codeReader = new BrowserBarcodeReader();

    try {
      // Tenta decodificar o código de barras direto da imagem capturada
      const result = await codeReader.decodeFromImageUrl(imageUrl);
      
      if (result) {
        const isbn = result.getText();
        const book = await searchBookByIsbnOrQuery(isbn);
        
        if (book) {
          setDetectedBooks((prev) => [...prev, book]);
        } else {
          alert(`Livro com código ${isbn} não encontrado.`);
        }
      }
    } catch (err) {
      console.error('Erro ao ler o código de barras da foto:', err);
      setScanError('Não foi possível identificar o código de barras na foto. Tente aproximar mais ou use a busca por texto abaixo.');
    } finally {
      setIsLoading(false);
      // Limpa o input para permitir enviar a mesma foto se necessário
      e.target.value = '';
    }
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
      <h3>📷 Leitor de Livros por Foto ou Busca</h3>
      <p className="scanner-subtitle">
        Tire uma foto do código de barras (ISBN) na contracapa do livro ou busque pelo nome para puxar os dados.
      </p>

      {/* Botão de Captura por Foto / Câmera Nativa */}
      <div className="camera-box">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImageCapture}
        />
        
        <button 
          className="btn-primary btn-start-cam" 
          onClick={() => fileInputRef.current.click()}
          disabled={isLoading}
        >
          {isLoading ? 'Processando imagem...' : '📸 Tirar Foto do Código de Barras'}
        </button>

        {scanError && <p className="error-message" style={{ color: '#e11d48', fontSize: '0.85rem', marginTop: '0.5rem' }}>{scanError}</p>}
      </div>

      {/* Busca Manual por Título / ISBN */}
      <form className="manual-form" onSubmit={handleManualSearch}>
        <h4>🔍 Ou busque pelo Título / ISBN</h4>
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Ex: Esquecidos de Domingo ou 978..." 
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
          <p className="empty-list-text">Nenhum livro adicionado ainda. Tire uma foto ou use a busca acima!</p>
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