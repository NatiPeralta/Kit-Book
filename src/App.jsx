import { useState } from 'react';
import BookRaffle from './components/BookRaffle/BookRaffle';
import './App.css';

export default function App() {
  const [step, setStep] = useState(2); // Começaremos testando direto no passo 2 para ver a roleta!
  const [booksList, setBooksList] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🐱 KitBook</h1>
        <p>Sua estante física e digital organizada com charme felino</p>
      </header>

      {/* Indicador de Passos Simples */}
      <div className="steps-indicator">
        <span className={step === 1 ? 'active' : ''}>1. Livros</span>
        <span className={step === 2 ? 'active' : ''}>2. Sorteio</span>
        <span className={step === 3 ? 'active' : ''}>3. Cronograma</span>
      </div>

      <main className="app-content">
        {step === 1 && (
          <section className="step-card">
            <h2>Passo 1: Seus Livros</h2>
            <p>Tire foto da estante ou selecione os livros não lidos.</p>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Ir para o Sorteio →
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="step-card">
            <BookRaffle 
              books={booksList}
              onSelectBook={(book) => setSelectedBook(book)}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          </section>
        )}

        {step === 3 && (
          <section className="step-card">
            <h2>Passo 3: Seu Cronograma</h2>
            <p>Livro escolhido: <strong>{selectedBook ? selectedBook.title : 'Nenhum'}</strong></p>
            <button className="btn-secondary" onClick={() => setStep(2)}>
              ← Voltar ao Sorteio
            </button>
          </section>
        )}
      </main>
    </div>
  );
}