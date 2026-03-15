import { Subject } from './types';

export const calculateSubjectAverage = (subject: Subject): number | null => {
  const isNon = (val: string | number) => String(val).toLowerCase().trim() === 'non';
  const isEmpty = (val: string | number) => String(val).trim() === '';
  
  const d1Str = subject.devoir1;
  const d2Str = subject.devoir2;
  const compStr = subject.composition;

  const hasD1 = !isNon(d1Str) && !isEmpty(d1Str);
  const hasD2 = !isNon(d2Str) && !isEmpty(d2Str);
  const hasComp = !isNon(compStr) && !isEmpty(compStr);

  const d1 = hasD1 ? Number(d1Str) : 0;
  const d2 = hasD2 ? Number(d2Str) : 0;
  const comp = hasComp ? Number(compStr) : 0;

  let moyenneDevoirs = 0;
  let hasMoyenneDevoirs = false;

  if (hasD1 && hasD2) {
    moyenneDevoirs = (d1 + d2) / 2;
    hasMoyenneDevoirs = true;
  } else if (hasD1) {
    moyenneDevoirs = d1;
    hasMoyenneDevoirs = true;
  } else if (hasD2) {
    moyenneDevoirs = d2;
    hasMoyenneDevoirs = true;
  }

  if (hasMoyenneDevoirs && hasComp) {
    return (moyenneDevoirs + comp) / 2;
  } else if (hasMoyenneDevoirs) {
    return moyenneDevoirs;
  } else if (hasComp) {
    return comp;
  } else {
    return null;
  }
};

export const calculateSemesterAverage = (subjects: Subject[]): number => {
  let totalPoints = 0;
  let totalCoef = 0;

  subjects.forEach(sub => {
    const avg = calculateSubjectAverage(sub);
    if (avg !== null) {
      totalPoints += avg * sub.coef;
      totalCoef += sub.coef;
    }
  });

  return totalCoef > 0 ? totalPoints / totalCoef : 0;
};

export const formatNumber = (num: number | null): string => {
  if (num === null) return '-';
  return num.toFixed(2);
};
