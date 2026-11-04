import { useState, useEffect } from 'react';
import './BookRaffle.css';

export default function BookRaffle({ books, onSelectBook, onBack, onNext }) {
  // Lista temporária de livros caso nenhum venha do Passo 1 ainda
  const mockBooks = [
    { id: 1, title: 'Até o Verão Terminar', author: 'Colleen Hoover', pages: 320 },
    { id: 2, title: 'Jogos Vorazes', author: 'Suzanne Collins', pages: 400 },
    { id: 3, title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', pages: 96 },
    { id: 4, title: 'A Biblioteca da Meia-Noite', author: 'Matt Haig', pages: 308 }
  ];

  const bookList = books && books.length > 0 ? books : mockBooks;

  const [isRolling, setIsRolling] = useState(false);

  // Recupera o livro sorteado salvo anteriormente no localStorage (se houver)
  const [winnerBook, setWinnerBook] = useState(() => {
    const savedWinner = localStorage.getItem('kitbook_winner_book');
    return savedWinner ? JSON.parse(savedWinner) : null;
  });


  const [displayTitle, setDisplayTitle] = useState(() => {
    const savedWinner = localStorage.getItem('kitbook_winner_book');
    const parsed = savedWinner ? JSON.parse(savedWinner) : null;
    return parsed ? parsed.title : 'Clique no botão para sortear!';
  });

  // Salva o livro sorteado no localStorage quando escolhido
  useEffect(() => {
    if (winnerBook) {
      localStorage.setItem('kitbook_winner_book', JSON.stringify(winnerBook));
    }
  }, [winnerBook]);

  const handleRaffle = () => {
    if (bookList.length === 0) return;

    // Limpa o livro sorteado anteriormente para permitir um novo sorteio real
    setWinnerBook(null);
    localStorage.removeItem('kitbook_winner_book');

    setIsRolling(true);

    let counter = 0;
    const maxRolls = 20; // Quantas vezes o nome vai trocar antes de parar
    const speed = 75; // Velocidade da troca em milissegundos

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * bookList.length);
      setDisplayTitle(bookList[randomIndex].title);
      counter++;

      if (counter >= maxRolls) {
        clearInterval(interval);

        // Sorteia um novo livro aleatório da lista
        const finalWinner = bookList[Math.floor(Math.random() * bookList.length)];

        // Garante que as páginas retornem o valor atualizado pós edição do usuário
        const winnerWithPages = {
          ...finalWinner,
          pages: Number(finalWinner.pages) || 300
        }

        setWinnerBook(winnerWithPages);
        setDisplayTitle(winnerWithPages.title);
        setIsRolling(false);
        onSelectBook(winnerWithPages); // Passa o livro correto para o componente pai
      }
    }, speed);
  };

  return (
    <div className="raffle-container">
      <h3>Sorteio KitBook</h3>
      <p className="raffle-subtitle">Deixe a sorte felina escolher sua próxima leitura entre {bookList.length} livros disponíveis.</p>

      {/* Caixa de Exibição do Sorteio */}
      <div className={`routable-box ${isRolling ? 'rolling' : ''} ${winnerBook ? 'success' : ''}`}>
        <span className="routable-label">
          {winnerBook ? '🎉 Livro Sorteado!' : isRolling ? 'Sorteando...' : 'Pronto para o sorteio'}
        </span>
        <h4 className="routable-title">{displayTitle}</h4>
        {winnerBook && (
          <p className="winner-details">
            Autor(a): <strong>{winnerBook.author}</strong> • {winnerBook.pages || 'N/A'} páginas
          </p>
        )}
      </div>

      {/* Botão de Ação do Sorteio */}
      <button 
        className="btn-raffle" 
        onClick={handleRaffle} 
        disabled={isRolling}
      >
        {isRolling ? 'Embaralhando páginas...' : 'Sortear Livro Agora'}
      </button>

      {/* Navegação */}
      <div className="raffle-actions">
        <button className="btn-secondary" onClick={onBack}>
          ← Voltar
        </button>
        <button 
          className="btn-primary" 
          onClick={onNext} 
          disabled={!winnerBook}
        >
          Criar Cronograma →
        </button>
      </div>
    </div>
  );
}