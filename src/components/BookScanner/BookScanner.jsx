import { useState } from 'react';
import './BookScanner.css';

export default function BookScanner({ onConfirmBooks, onNext }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualPages, setManualPages] = useState('');
  
  // Lista inicial de livros
  const [detectedBooks, setDetectedBooks] = useState([]);

  // Simulador de Leitura de Foto (OCR)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsProcessing(true);

    // Simula a leitura das lombadas com OCR
    setTimeout(() => {
      const scannedBooks = [
        { id: Date.now() + 1, title: 'O Povo do Ar', author: 'Holly Black', pages: 368, unread: true },
        { id: Date.now() + 2, title: 'Teto Para Dois', author: 'Beth O’Leary', pages: 400, unread: true },
        { id: Date.now() + 3, title: 'Os Sete Maridos de Evelyn Hugo', author: 'Taylor Jenkins Reid', pages: 360, unread: true },
      ];
      setDetectedBooks((prev) => [...prev, ...scannedBooks]);
      setIsProcessing(false);
    }, 1500);
  };

  // Adicionar livro manualmente
  const handleAddManualBook = (e) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const newBook = {
      id: Date.now(),
      title: manualTitle.trim(),
      author: manualAuthor.trim() || 'Autor não informado',
      pages: Number(manualPages) || 300,
      unread: true
    };

    setDetectedBooks((prev) => [...prev, newBook]);
    setManualTitle('');
    setManualAuthor('');
    setManualPages('');
  };

  // Alternar o status de não lido (checkbox)
  const toggleUnread = (id) => {
    setDetectedBooks((prev) =>
      prev.map((book) =>
        book.id === id ? { ...book, unread: !book.unread } : book
      )
    );
  };

  // Remover livro da lista
  const handleRemoveBook = (id) => {
    setDetectedBooks((prev) => prev.filter((book) => book.id !== id));
  };

  // Avançar para a tela de sorteio passando apenas os não lidos
  const handleProceedToRaffle = () => {
    const unreadBooks = detectedBooks.filter((book) => book.unread);
    onConfirmBooks(unreadBooks);
    onNext();
  };

  const unreadCount = detectedBooks.filter((b) => b.unread).length;

  return (
    <div className="scanner-container">
      <h3>📷 Estante ou E-reader</h3>
      <p className="scanner-subtitle">
        Tire uma foto da sua estante para identificar as lombadas ou adicione seus livros manualmente.
      </p>

      {/* Área de Upload / Câmera */}
      <div className="upload-box">
        <input 
          type="file" 
          accept="image/*" 
          id="camera-input" 
          onChange={handleImageUpload} 
          className="file-input"
        />
        <label htmlFor="camera-input" className="upload-label">
          {imagePreview ? (
            <div className="image-preview-wrapper">
              <img src={imagePreview} alt="Sua Estante" className="preview-img" />
              <span className="change-img-text">Trocar foto 📷</span>
            </div>
          ) : (
            <div className="upload-placeholder">
              <span className="upload-icon">📸</span>
              <span>Clique para tirar foto ou carregar a estante</span>
            </div>
          )}
        </label>
      </div>

      {isProcessing && (
        <div className="processing-indicator">
          <span className="spinner">🐾</span>
          <p>Lendo lombadas dos livros com visão felina...</p>
        </div>
      )}

      {/* Formulário Manual */}
      <form className="manual-form" onSubmit={handleAddManualBook}>
        <h4>+ Adicionar Livro Manualmente</h4>
        <div className="manual-inputs">
          <input 
            type="text" 
            placeholder="Título do livro *" 
            value={manualTitle} 
            onChange={(e) => setManualTitle(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Autor(a)" 
            value={manualAuthor} 
            onChange={(e) => setManualAuthor(e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Páginas" 
            value={manualPages} 
            onChange={(e) => setManualPages(e.target.value)} 
            min="1"
          />
        </div>
        <button type="submit" className="btn-secondary btn-add-manual">
          Adicionar à Lista
        </button>
      </form>

      {/* Lista de Livros Identificados */}
      <div className="detected-section">
        <div className="detected-header">
          <h4>Seus Livros ({detectedBooks.length})</h4>
          <span className="unread-badge">{unreadCount} prontos para sorteio</span>
        </div>

        {detectedBooks.length === 0 ? (
          <p className="empty-list-text">Nenhum livro adicionado ainda. Tire uma foto ou digite acima!</p>
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