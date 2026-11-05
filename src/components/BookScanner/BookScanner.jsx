import { useState, useRef, useEffect } from 'react';
import { BrowserBarcodeReader } from '@zxing/library';
import { searchBookByIsbnOrQuery } from '../../services/googleBooks';
import { Camera, Trash2, Pencil } from 'lucide-react';
import './BookScanner.css';

export default function BookScanner({ onConfirmBooks, onNext }) {
  const [detectedBooks, setDetectedBooks] = useState(() => {
    const saved = localStorage.getItem('kitbook_saved_books');
    return saved ? JSON.parse(saved) : [];
  });

  //Salva no localStorage sempre que a lista de livros mudar
  useEffect(() => {
    localStorage.setItem('kitbook_saved_books', JSON.stringify(detectedBooks));
  }, [detectedBooks]);


  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  // Estados para controlar a edição de um livro específico
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPages, setEditPages] = useState('');

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
      
      // LIBERA A MEMÓRIA: Apaga a URL temporária criada para a foto
      URL.revokeObjectURL(imageUrl);

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

  // Função para remover todos os livros da lista
  const handleRemoveAllBooks = () => {
    if (window.confirm('Tem certeza de que deseja remover todos os livros da lista?')) {
      setDetectedBooks([]);
      setEditingId(null);
      localStorage.removeItem('kitbook_saved_books');
    }
  };

  // Iniciar a edição de um livro
  const startEditing = (book) => {
    setEditingId(book.id);
    setEditTitle(book.title);
    setEditPages(book.pages || 300);
  };

  // Salvar as alterações do livro editado
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
      <h3>Leitor de Livros por Foto ou Busca</h3>
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
          className="btn-start-cam" 
          onClick={() => fileInputRef.current.click()}
          disabled={isLoading}
        >
          <Camera size={25} />
          {isLoading ? 'Processando imagem...' : 'Tirar Foto do Código de Barras'}
        </button>

        {scanError && <p className="error-message">{scanError}</p>}
      </div>

      {/* Busca Manual por Título / ISBN */}
      <form className="manual-form" onSubmit={handleManualSearch}>
        <h4>🔍 Ou busque pelo Título / ISBN</h4>
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Ex: Esquecidos de Domingo ou Harry..." 
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
          <div className="header-actions">
            <span className="unread-badge">{unreadCount} prontos para sorteio</span>
            {detectedBooks.length > 0 && (
              <button className="btn-remove-all" onClick={handleRemoveAllBooks} title="Remover Todos">
                <Trash2 size={15} /> 
                <span className="btn-text">Remover Todos</span>
              </button>
            )}
          </div>
        </div>

        {detectedBooks.length === 0 ? (
          <p className="empty-list-text">Nenhum livro adicionado ainda. Tire uma foto ou use a busca acima!</p>
        ) : (
          <ul className="books-list">
            {detectedBooks.map((book) => (
              <li key={book.id} className={`book-item ${book.unread ? 'selected' : ''}`}>
                <div className="book-item-content">
                  <label className="checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      checked={book.unread} 
                      onChange={() => toggleUnread(book.id)} 
                    />
                    {book.thumbnail && <img src={book.thumbnail} alt={book.title} className="book-thumb"/>}

                    <div className="book-title-row">
                        <span className="book-title">
                        {book.title} <Pencil size={14} className="edit-icon" />
                      </span>
                      </div>

                  <button className="btn-remove" onClick={() => handleRemoveBook(book.id)}>
                    ✕
                  </button>
                  </label>

                  {/* Bloco de Edição Inline */}
                  {editingId === book.id ? (
                    <div className="edit-block-container">
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
                      </div>
                      <button className="btn-save-edit" onClick={() => saveEditing(book.id)}>
                          Salvar
                        </button>
                    </div>
                  ) : (
                    <div className="book-info" onClick={() => startEditing(book)}>
                      <div className="book-details-row">
                      <span className="book-author"><strong>{book.author} • {book.pages || 300} págs (clique para editar)</strong></span>
                      </div>
                    </div>
                  )}
                </div>
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