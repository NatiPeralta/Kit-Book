export function generateSchedule({ totalUnits, unitType, startDate, endDate, readOnWeekends = true }) {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  const diffTime = end - start;
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (totalDays <= 0) return null;

  let activeDays = 0;
  let currentDate = new Date(start);

  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
    if (readOnWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      activeDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (activeDays <= 0) return null;

  const rawDaily = totalUnits / activeDays;
  // Arredonda para cima para garantir que a meta cubra o livro todo
  const dailyMeta = unitType === '%' ? rawDaily.toFixed(1) : Math.ceil(rawDaily);

  const unitsPerWeek = dailyMeta * (readOnWeekends ? 7 : 5);

  return {
    totalDays,
    activeDays,
    dailyMeta: `${dailyMeta} ${unitType} por dia de leitura`,
    weeklyMeta: `${unitsPerWeek > totalUnits ? totalUnits : unitsPerWeek} ${unitType} por semana`
  };
}