import React, { useRef, useState } from 'react';
import { Download, Image as ImageIcon, X, Loader2, GraduationCap } from 'lucide-react';
import { StudentInfo, Subject } from '../types';
import { calculateSubjectAverage, calculateSemesterAverage, formatNumber, getMention, getAppreciation } from '../utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const semesterAverage = calculateSemesterAverage(subjects);
  const semesterMention = getMention(semesterAverage);
  const annualMention = annualAverage !== undefined ? getMention(annualAverage) : undefined;

  const generateCanvas = async () => {
    const element = printRef.current;
    if (!element) return null;

    try {
      // Ensure the element is visible and has dimensions
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('bulletin-to-print');
          if (clonedElement) {
            clonedElement.style.display = 'block';
            clonedElement.style.margin = '0';
            clonedElement.style.padding = '40px'; // Add some padding for the capture
          }
        }
      });
      return canvas;
    } catch (err) {
      console.error('html2canvas error:', err);
      return null;
    }
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error('Canvas generation failed');

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit the page while maintaining aspect ratio
      const margin = 10; // 10mm margin
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      
      if (finalHeight > pdfHeight - (margin * 2)) {
        finalHeight = pdfHeight - (margin * 2);
        finalWidth = (canvas.width * finalHeight) / canvas.height;
      }

      const x = (pdfWidth - finalWidth) / 2;
      const y = margin;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`Bulletin_${studentInfo.firstName}_${studentInfo.lastName}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert("Erreur lors de la création du PDF. Essayez d'utiliser le bouton 'Image (PNG)' si le PDF ne fonctionne pas.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error('Canvas generation failed');

      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Bulletin_${studentInfo.firstName}_${studentInfo.lastName}.png`;
      link.href = data;
      link.click();
    } catch (error) {
      console.error('Failed to generate Image:', error);
      alert("Erreur lors de la génération de l'image.");
    } finally {
      setIsGenerating(false);
    }
  };

  let totalPoints = 0;
  let totalCoef = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-4 flex flex-col max-h-[95vh]">
        <div className="flex justify-between items-center p-3 border-b shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Aperçu du Bulletin</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-3 sm:p-4 overflow-y-auto grow bg-gray-50">
          <div id="bulletin-to-print" ref={printRef} className="bg-white p-6 sm:p-8 border border-gray-200 shadow-sm mx-auto" style={{ width: '100%', maxWidth: '750px' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-5 border-b-2 border-indigo-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-gray-900">République de l'Éducation</h1>
                  <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Ministère de l'Enseignement</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-base sm:text-lg font-bold text-indigo-800 uppercase">Bulletin de Notes</h2>
                <p className="text-xs sm:text-sm text-gray-700 font-semibold mt-0.5">{semesterName}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Année Scolaire : {studentInfo.schoolYear || '2025-2026'}</p>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex justify-between mb-5 text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div>
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Élève</p>
                <p className="text-xs sm:text-sm"><span className="font-bold">Nom :</span> {studentInfo.lastName.toUpperCase()}</p>
                <p className="text-xs sm:text-sm"><span className="font-bold">Prénom :</span> {studentInfo.firstName}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Classe</p>
                <p className="text-sm sm:text-base font-bold text-indigo-700">{studentInfo.className || 'Non précisée'}</p>
              </div>
            </div>

            {/* Grades Table */}
            <table className="w-full mb-5 border-collapse text-[10px] sm:text-xs">
              <thead>
                <tr className="bg-indigo-50 border-y-2 border-indigo-800">
                  <th className="text-left py-1.5 px-1 sm:px-2 font-bold text-indigo-900">Matière</th>
                  <th className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-900">Devoirs</th>
                  <th className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-900">Compo</th>
                  <th className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-900">Moy.</th>
                  <th className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-900">Coef</th>
                  <th className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-900">Total</th>
                  <th className="text-left py-1.5 px-1 sm:px-2 font-bold text-indigo-900">Appréciation</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => {
                  const avg = calculateSubjectAverage(sub);
                  const isNon = (val: string | number) => String(val).toLowerCase().trim() === 'non';
                  const d1 = isNon(sub.devoir1) || sub.devoir1 === '' ? '-' : sub.devoir1;
                  const d2 = isNon(sub.devoir2) || sub.devoir2 === '' ? '-' : sub.devoir2;
                  const devoirsStr = (d1 === '-' && d2 === '-') ? '-' : `${d1} | ${d2}`;
                  const compoStr = isNon(sub.composition) || sub.composition === '' ? '-' : sub.composition;
                  
                  if (avg !== null) {
                    totalPoints += avg * sub.coef;
                    totalCoef += sub.coef;
                  }

                  return (
                    <tr key={sub.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-1.5 px-1 sm:px-2 font-bold text-gray-800">{sub.name}</td>
                      <td className="text-center py-1.5 px-1 sm:px-2 text-gray-600">{devoirsStr}</td>
                      <td className="text-center py-1.5 px-1 sm:px-2 text-gray-600">{compoStr}</td>
                      <td className="text-center py-1.5 px-1 sm:px-2 font-bold text-gray-900">{formatNumber(avg)}</td>
                      <td className="text-center py-1.5 px-1 sm:px-2 text-gray-600">{sub.coef}</td>
                      <td className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-600">{avg !== null ? formatNumber(avg * sub.coef) : '-'}</td>
                      <td className="text-left py-1.5 px-1 sm:px-2 text-gray-600 italic text-[9px] sm:text-[10px]">{getAppreciation(avg)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-800 font-bold">
                  <td colSpan={4} className="py-2 px-1 sm:px-2 text-right text-gray-700">TOTAL :</td>
                  <td className="text-center py-2 px-1 sm:px-2 text-gray-900">{totalCoef}</td>
                  <td className="text-center py-2 px-1 sm:px-2 text-indigo-700">{formatNumber(totalPoints)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            {/* Summary */}
            <div className="flex justify-end mb-8">
              <div className="w-full sm:w-2/3 bg-indigo-50 p-3 sm:p-4 rounded-lg border border-indigo-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700 text-xs sm:text-sm">Moyenne du Semestre :</span>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-indigo-700">{formatNumber(semesterAverage)} / 20</span>
                    <p className="text-[10px] sm:text-xs font-bold text-indigo-600 mt-0.5">Mention : {semesterMention}</p>
                  </div>
                </div>
                {annualAverage !== undefined && (
                  <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
                    <span className="font-bold text-gray-700 text-xs sm:text-sm">Moyenne Annuelle :</span>
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-emerald-600">{formatNumber(annualAverage)} / 20</span>
                      <p className="text-[10px] sm:text-xs font-bold text-emerald-600 mt-0.5">Mention : {annualMention}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Signatures */}
            <div className="mt-6 pt-4 flex justify-between px-4 sm:px-8 text-[10px] sm:text-xs">
              <div className="text-center">
                <p className="font-bold text-gray-800 border-t border-gray-400 pt-1 w-24 sm:w-32">Le Professeur Principal</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 border-t border-gray-400 pt-1 w-24 sm:w-32">Le Chef d'Établissement</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t shrink-0 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            Image (PNG)
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Document (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
