import { Subject } from './types';

export const calculateSubjectAverage = (subject: Subject): number => {
  const d1 = subject.devoir1 === '' ? 0 : Number(subject.devoir1);
  const d2 = subject.devoir2 === '' ? 0 : Number(subject.devoir2);
  const comp = subject.composition === '' ? 0 : Number(subject.composition);
  
  // Formule : ((Devoir 1 + Devoir 2) / 2 + Composition) / 2
  const moyenneDevoirs = (d1 + d2) / 2;
  return (moyenneDevoirs + comp) / 2;
};

export const calculateSemesterAverage = (subjects: Subject[]): number => {
  let totalPoints = 0;
  let totalCoef = 0;

  subjects.forEach(sub => {
    const avg = calculateSubjectAverage(sub);
    totalPoints += avg * sub.coef;
    totalCoef += sub.coef;
  });

  return totalCoef > 0 ? totalPoints / totalCoef : 0;
};

export const formatNumber = (num: number): string => {
  return num.toFixed(2);
};
