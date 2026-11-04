import { useState } from 'react';
import { generateSchedule } from '../../utils/scheduleCalculator';
import './ScheduleBuilder.css';

export default function ScheduleBuilder({ book, onBack }) {
  // Tenta pegar o livro passado por prop, se não houver, busca do localStorage (salvo no sorteio)
  const savedWinner = localStorage.getItem('kitbook_winner_book');
  const fallbackBook = savedWinner ? JSON.parse(savedWinner) : { title: 'Até o Verão Terminar', pages: 320 };

  const targetBook = book || fallbackBook;

  // Estados do formulário sincronizados com as páginas reais do livro escolhido
  const [unitType, setUnitType] = useState('páginas'); // 'páginas', 'capítulos', '%'
  const [totalUnits, setTotalUnits] = useState(targetBook.pages ? Number(targetBook.pages) : 300);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [readOnWeekends, setReadOnWeekends] = useState(true);
  
  const [scheduleResult, setScheduleResult] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = (e) => {
    e.preventDefault();
    setError('');

    if (!endDate) {
      setError('Por favor, informe a data de término pretendida.');
      return;
    }

    const result = generateSchedule({
      totalUnits: Number(totalUnits),
      unitType,
      startDate,
      endDate,
      readOnWeekends
    });

    if (!result) {
      setError('A data de término deve ser posterior à data de início.');
      return;
    }

    setScheduleResult(result);
  };

  return (
    <div className="schedule-container">
      <h3>📅 Cronograma Felino de Leitura</h3>
      <p className="schedule-subtitle">
        Livro escolhido: <strong>{targetBook.title}</strong>
      </p>

      {!scheduleResult ? (
        <form className="schedule-form" onSubmit={handleCalculate}>
          <div className="form-group">
            <label>Tipo de Unidade:</label>
            <select value={unitType} onChange={(e) => setUnitType(e.target.value)}>
              <option value="páginas">Páginas (Livro Físico/E-reader)</option>
              <option value="capítulos">Capítulos</option>
              <option value="%">Porcentagem (%) - Kindle</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantidade Total ({unitType}):</label>
            <input 
              type="number" 
              value={totalUnits} 
              onChange={(e) => setTotalUnits(e.target.value)} 
              min="1"
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data de Início:</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Data de Término:</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-checkbox">
            <label>
              <input 
                type="checkbox" 
                checked={readOnWeekends} 
                onChange={(e) => setReadOnWeekends(e.target.checked)} 
              />
              Incluir finais de semana na rotina de leitura
            </label>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="schedule-actions">
            <button type="button" className="btn-secondary" onClick={onBack}>
              ← Voltar
            </button>
            <button type="submit" className="btn-primary">
              Gerar Cronograma
            </button>
          </div>
        </form>
      ) : (
        <div className="schedule-result-card">
          <div className="result-header">
            <h4>✨ Seu Plano de Leitura está Pronto!</h4>
            <span className="badge-days">{scheduleResult.totalDays} dias totais ({scheduleResult.activeDays} dias de leitura)</span>
          </div>

          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Meta Diária</span>
              <span className="metric-value">{scheduleResult.dailyMeta}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Meta Semanal</span>
              <span className="metric-value">{scheduleResult.weeklyMeta}</span>
            </div>
          </div>

          <div className="schedule-actions">
            <button className="btn-secondary" onClick={() => setScheduleResult(null)}>
              Editar Datas
            </button>
            <button className="btn-primary" onClick={() => alert('Cronograma salvo com sucesso! Boa leitura 📖✨')}>
              Concluir & Salvar 🐱
            </button>
          </div>
        </div>
      )}
    </div>
  );
}