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
}
