import { BookOpen, Trophy, Calendar } from 'lucide-react';
import './StepNavigation.css';

export default function StepNavigation({ currentStep, setStep, canProceed }) {

    const handleTabClick = (targetStep) => {
        // Se tentar ir para a etapa 2 ou 3 mas não puder avançar
        if (targetStep > 1 && !canProceed) {
            alert('Adicione e selecione pelo menos um livro na sua lista antes de avançar para o sorteio!');
        return;
        }
        setStep(targetStep);
    };

  return (
    <div className="steps-menu">
      <div 
        className={`step-item ${currentStep === 1 ? 'active' : ''}`} 
        onClick={() => handleTabClick(1)}
      >
        <BookOpen size={18} className="step-icon" />
        <span>1. Livros</span>
      </div>

      <div 
        className={`step-item ${currentStep === 2 ? 'active' : ''} ${!canProceed && currentStep !== 2 ? 'disabled' : ''} `} 
        onClick={() => handleTabClick(2)}
      >
        <Trophy size={18} className="step-icon" />
        <span>2. Sorteio</span>
      </div>

      <div 
        className={`step-item ${currentStep === 3 ? 'active' : ''} ${!canProceed && currentStep !== 3 ? 'disabled' : ''}`} 
        onClick={() => handleTabClick(3)}
      >
        <Calendar size={18} className="step-icon" />
        <span>3. Cronograma</span>
      </div>
    </div>
  );
}