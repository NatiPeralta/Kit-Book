import { useState } from 'react';
import './App.css';

export default function App() {
  // Controle de estado para gerenciar o fluxo do app (1: Scanner, 2: Sorteio, 3: Cronograma)
  const [step, setStep] = useState(1);
  const [booksList, setBooksList] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📚 KitBook </h1>
        <p>Descubra sua próxima leitura e monte seu cronograma!</p>
      </header>

      <main className="app-content">
        {step === 1 && (
          <section className="step-card">
            <h2>Passo 1: Seus Livros</h2>
            <p>Tire foto da estante ou digite os livros que ainda não leu.</p>
            {/* Aqui entrará o componente BookScanner */}
            <button className="btn-primary" onClick={() => setStep(2)}>
              Ir para o Sorteio
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="step-card">
            <h2>Passo 2: O Sorteio</h2>
            {/* Aqui entrará o componente BookRaffle */}
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Voltar
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Criar Cronograma
            </button>
          </section>
        )}

        {step === 3 && (
          <section className="step-card">
            <h2>Passo 3: Seu Cronograma</h2>
            {/* Aqui entrará o componente ScheduleBuilder */}
            <button className="btn-secondary" onClick={() => setStep(2)}>
              Voltar ao Sorteio
            </button>
          </section>
        )}
      </main>
    </div>
  );
}