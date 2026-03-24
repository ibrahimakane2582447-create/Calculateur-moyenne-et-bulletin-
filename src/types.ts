export interface Subject {
  id: string;
  name: string;
  devoir1: number | '';
  devoir2: number | '';
  composition: number | '';
  coef: number;
}

export interface StudentInfo {
  firstName: string;
  lastName: string;
  className: string;
  schoolYear: string;
  schoolName?: string;
  photoUrl?: string;
  schoolLogoUrl?: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  studentInfo: StudentInfo;
  semester1: Subject[];
  semester2: Subject[];
  annualAvg: number;
}
