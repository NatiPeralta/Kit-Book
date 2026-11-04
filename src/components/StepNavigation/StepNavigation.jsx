import { BookOpen, Trophy, Calendar } from 'lucide-react';
import './StepNavigation.css';

export default function StepNavigation({ currentStep, setStep }) {
  return (
    <div className="steps-menu">
      <div 
        className={`step-item ${currentStep === 1 ? 'active' : ''}`} 
        onClick={() => setStep(1)}
      >
        <BookOpen size={18} className="step-icon" />
        <span>1. Livros</span>
      </div>

      <div 
        className={`step-item ${currentStep === 2 ? 'active' : ''}`} 
        onClick={() => setStep(2)}
      >
        <Trophy size={18} className="step-icon" />
        <span>2. Sorteio</span>
      </div>

      <div 
        className={`step-item ${currentStep === 3 ? 'active' : ''}`} 
        onClick={() => setStep(3)}
      >
        <Calendar size={18} className="step-icon" />
        <span>3. Cronograma</span>
      </div>
    </div>
  );
}