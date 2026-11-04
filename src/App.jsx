import { useState } from 'react';
import BookScanner from './components/BookScanner/BookScanner';
import BookRaffle from './components/BookRaffle/BookRaffle';
import ScheduleBuilder from './components/ScheduleBuilder/ScheduleBuilder';
import Header from "./components/Header/Header";
import StepNavigation from './components/StepNavigation/StepNavigation';
import './App.css';

export default function App() {
  const [step, setStep] = useState(1); // Passo atual (1, 2 ou 3)
  const [booksList, setBooksList] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  // Calcula se há livros marcados como "prontos para sorteio" (unread)
  // Ou você pode usar booksList.length > 0 caso queira liberar com qualquer livro na lista
  const unreadCount = booksList.filter((b) => b.unread).length;
  const canProceed = unreadCount > 0;

  return (
    <div className="app-container">
      <Header />

      {/* Indicador de Passos */}
      <StepNavigation currentStep={step} setStep={setStep} canProceed={canProceed}/>

      <main className="app-content">
        {step === 1 && (
          <section className="step-card">
            <BookScanner 
              onConfirmBooks={(books) => setBooksList(books)}
              onNext={() => setStep(2)}
            />
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
            <ScheduleBuilder 
              book={selectedBook}
              onBack={() => setStep(2)}
            />
          </section>
        )}
      </main>
    </div>
  );
}