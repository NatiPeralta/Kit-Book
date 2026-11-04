import { useState, useRef } from 'react';
import { BrowserBarcodeReader } from '@zxing/library';
import { searchBookByIsbnOrQuery } from '../../services/googleBooks';
import './BookScanner.css';

export default function BookScanner({ onConfirmBooks, onNext }) {
  const [detectedBooks, setDetectedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  
  // Estado para controlar qual livro está sendo editado no momento
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPages, setEditPages] = useState('');

  const fileInputRef = useRef(null);

  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setScanError('');

    const imageUrl = URL.createObjectURL(file);
    const codeReader = new BrowserBarcodeReader();

    try {
      const result = await codeReader.decodeFromImageUrl(imageUrl);
      if (result) {
        const isbn = result.getText();
        const book = await searchBookByIsbnOrQuery(isbn);
        if (book) {
          setDetectedBooks((prev) => [...prev, book]);
        }
      }
    } catch (err) {
      console.error('Erro ao ler o código:', err);
      setScanError('Não foi possível ler o código de barras. Use a busca por texto abaixo.');
    } finally {
      setIsLoading(false);
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
      alert('Nenhum livro encontrado.');
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

  // Iniciar a edição de um livro
  const startEditing = (book) => {
    setEditingId(book.id);
    setEditTitle(book.title);
    setEditPages(book.pages);
  };

  // Salvar a edição do livro
  const saveEditing = (id) => {
    setDetectedBooks((prev) =>
      prev.map((book) =>
        book.id === id
          ? { ...book, title: editTitle, pages: parseInt(editPages) || book.pages }
          : book
      )
    );
    setEditingId(null);
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
        Tire a foto do código de barras ou busque pelo título. Você também pode ajustar as páginas se necessário!
      </p>

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
          {isLoading ? 'Processando...' : '📸 Tirar Foto do Código de Barras'}
        </button>
        {scanError && <p className="error-message" style={{ color: '#e11d48', fontSize: '0.85rem', marginTop: '0.5rem' }}>{scanError}</p>}
      </div>

      <form className="manual-form" onSubmit={handleManualSearch}>
        <h4>🔍 Ou busque pelo Título / ISBN</h4>
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Ex: Leitura de Verão" 
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
          <p className="empty-list-text">Nenhum livro adicionado ainda.</p>
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
                  
                  {/* Se estiver editando este livro, mostra inputs para corrigir */}
                  {editingId === book.id ? (
                    <div className="edit-inline-container" onClick={(e) => e.preventDefault()}>
                      <input 
                        type="text" 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)} 
                        className="input-edit-title"
                      />
                      <div className="edit-pages-row">
                        <input 
                          type="number" 
                          value={editPages} 
                          onChange={(e) => setEditPages(e.target.value)} 
                          className="input-edit-pages"
                        />
                        <span>págs</span>
                        <button className="btn-save-edit" onClick={() => saveEditing(book.id)}>Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="book-info" onClick={() => startEditing(book)}>
                      <span className="book-title">{book.title} ✏️</span>
                      <span className="book-author">{book.author} • <strong>{book.pages} págs</strong> (clique para editar)</span>
                    </div>
                  )}
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