import React, { useRef } from 'react';
import { Download, X } from 'lucide-react';
import { StudentInfo, Subject } from '../types';
import { calculateSubjectAverage, calculateSemesterAverage, formatNumber } from '../utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentInfo: StudentInfo;
  semesterName: string;
  subjects: Subject[];
  annualAverage?: number;
}

export default function BulletinModal({ isOpen, onClose, studentInfo, semesterName, subjects, annualAverage }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const semesterAverage = calculateSemesterAverage(subjects);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const data = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bulletin_${studentInfo.firstName}_${studentInfo.lastName}_${semesterName}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Aperçu du Bulletin</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto grow bg-gray-50">
          <div ref={printRef} className="bg-white p-8 border border-gray-200 shadow-sm mx-auto" style={{ width: '100%', minHeight: '800px' }}>
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
              <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900">Bulletin de Notes</h1>
              <p className="text-lg text-gray-600 mt-2 font-medium">{semesterName}</p>
              <p className="text-sm text-gray-500 mt-1">Année Scolaire : {studentInfo.schoolYear || '2025-2026'}</p>
            </div>

            {/* Student Info */}
            <div className="flex justify-between mb-8 text-gray-800">
              <div>
                <p><span className="font-bold">Nom :</span> {studentInfo.lastName.toUpperCase()}</p>
                <p><span className="font-bold">Prénom :</span> {studentInfo.firstName}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold">Classe :</span> {studentInfo.className}</p>
              </div>
            </div>

            {/* Grades Table */}
            <table className="w-full mb-8 border-collapse">
              <thead>
                <tr className="bg-gray-100 border-y-2 border-gray-800">
                  <th className="text-left py-3 px-2 font-bold text-gray-800">Matière</th>
                  <th className="text-center py-3 px-2 font-bold text-gray-800">Devoir 1</th>
                  <th className="text-center py-3 px-2 font-bold text-gray-800">Devoir 2</th>
                  <th className="text-center py-3 px-2 font-bold text-gray-800">Compo</th>
                  <th className="text-center py-3 px-2 font-bold text-gray-800">Coef</th>
                  <th className="text-center py-3 px-2 font-bold text-gray-800">Moyenne</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => {
                  const avg = calculateSubjectAverage(sub);
                  return (
                    <tr key={sub.id} className="border-b border-gray-200">
                      <td className="py-2 px-2 font-medium text-gray-800">{sub.name}</td>
                      <td className="text-center py-2 px-2 text-gray-600">{sub.devoir1 !== '' ? sub.devoir1 : '-'}</td>
                      <td className="text-center py-2 px-2 text-gray-600">{sub.devoir2 !== '' ? sub.devoir2 : '-'}</td>
                      <td className="text-center py-2 px-2 text-gray-600">{sub.composition !== '' ? sub.composition : '-'}</td>
                      <td className="text-center py-2 px-2 text-gray-600">{sub.coef}</td>
                      <td className="text-center py-2 px-2 font-bold text-gray-900">{formatNumber(avg)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-1/2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700">Moyenne du Semestre :</span>
                  <span className="text-xl font-black text-indigo-600">{formatNumber(semesterAverage)} / 20</span>
                </div>
                {annualAverage !== undefined && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-700">Moyenne Annuelle :</span>
                    <span className="text-xl font-black text-emerald-600">{formatNumber(annualAverage)} / 20</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Signatures */}
            <div className="mt-16 flex justify-between px-8">
              <div className="text-center">
                <p className="font-bold text-gray-800 border-t border-gray-400 pt-2 w-32">Le Titulaire</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 border-t border-gray-400 pt-2 w-32">Le Directeur</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t shrink-0 flex justify-end">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  );
}
