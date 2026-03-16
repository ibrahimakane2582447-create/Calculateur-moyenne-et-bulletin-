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

    // Temporarily remove constraints to allow full capture
    const parent = element.parentElement;
    const originalOverflow = parent?.style.overflow;
    if (parent) {
      parent.style.overflow = 'visible';
    }

    const canvas = await html2canvas(element, { 
      scale: 3, // High quality
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    if (parent && originalOverflow !== undefined) {
      parent.style.overflow = originalOverflow;
    }

    return canvas;
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

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
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Bulletin_${studentInfo.firstName}_${studentInfo.lastName}_${semesterName}.png`;
      link.href = data;
      link.click();
    } catch (error) {
      console.error('Failed to generate Image', error);
      alert("Erreur lors de la génération de l'image. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  let totalPoints = 0;
  let totalCoef = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Aperçu du Bulletin</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto grow bg-gray-50">
          <div ref={printRef} className="bg-white p-10 border border-gray-200 shadow-sm mx-auto" style={{ width: '100%', maxWidth: '800px', minHeight: '1050px' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-indigo-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-3 rounded-xl">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-wider text-gray-900">République de l'Éducation</h1>
                  <p className="text-sm text-gray-600 font-medium">Ministère de l'Enseignement</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-indigo-800 uppercase">Bulletin de Notes</h2>
                <p className="text-lg text-gray-700 font-semibold mt-1">{semesterName}</p>
                <p className="text-sm text-gray-500 mt-1">Année Scolaire : {studentInfo.schoolYear || '2025-2026'}</p>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex justify-between mb-8 text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Élève</p>
                <p className="text-lg"><span className="font-bold">Nom :</span> {studentInfo.lastName.toUpperCase()}</p>
                <p className="text-lg"><span className="font-bold">Prénom :</span> {studentInfo.firstName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Classe</p>
                <p className="text-xl font-bold text-indigo-700">{studentInfo.className || 'Non précisée'}</p>
              </div>
            </div>

            {/* Grades Table */}
            <table className="w-full mb-8 border-collapse text-sm">
              <thead>
                <tr className="bg-indigo-50 border-y-2 border-indigo-800">
                  <th className="text-left py-3 px-2 font-bold text-indigo-900">Matière</th>
                  <th className="text-center py-3 px-2 font-bold text-indigo-900">Devoirs</th>
                  <th className="text-center py-3 px-2 font-bold text-indigo-900">Compo</th>
                  <th className="text-center py-3 px-2 font-bold text-indigo-900">Moy.</th>
                  <th className="text-center py-3 px-2 font-bold text-indigo-900">Coef</th>
                  <th className="text-center py-3 px-2 font-bold text-indigo-900">Total</th>
                  <th className="text-left py-3 px-2 font-bold text-indigo-900">Appréciation</th>
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
                      <td className="py-3 px-2 font-bold text-gray-800">{sub.name}</td>
                      <td className="text-center py-3 px-2 text-gray-600">{devoirsStr}</td>
                      <td className="text-center py-3 px-2 text-gray-600">{compoStr}</td>
                      <td className="text-center py-3 px-2 font-bold text-gray-900">{formatNumber(avg)}</td>
                      <td className="text-center py-3 px-2 text-gray-600">{sub.coef}</td>
                      <td className="text-center py-3 px-2 font-bold text-indigo-600">{avg !== null ? formatNumber(avg * sub.coef) : '-'}</td>
                      <td className="text-left py-3 px-2 text-gray-600 italic text-xs">{getAppreciation(avg)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-800 font-bold">
                  <td colSpan={4} className="py-3 px-2 text-right text-gray-700">TOTAL :</td>
                  <td className="text-center py-3 px-2 text-gray-900">{totalCoef}</td>
                  <td className="text-center py-3 px-2 text-indigo-700">{formatNumber(totalPoints)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            {/* Summary */}
            <div className="flex justify-end mb-12">
              <div className="w-2/3 bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-gray-700 text-lg">Moyenne du Semestre :</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-700">{formatNumber(semesterAverage)} / 20</span>
                    <p className="text-sm font-bold text-indigo-600 mt-1">Mention : {semesterMention}</p>
                  </div>
                </div>
                {annualAverage !== undefined && (
                  <div className="flex justify-between items-center pt-3 border-t border-indigo-200">
                    <span className="font-bold text-gray-700 text-lg">Moyenne Annuelle :</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600">{formatNumber(annualAverage)} / 20</span>
                      <p className="text-sm font-bold text-emerald-600 mt-1">Mention : {annualMention}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Signatures */}
            <div className="mt-auto pt-8 flex justify-between px-12">
              <div className="text-center">
                <p className="font-bold text-gray-800 border-t border-gray-400 pt-2 w-40">Le Professeur Principal</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 border-t border-gray-400 pt-2 w-40">Le Chef d'Établissement</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t shrink-0 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            Image (PNG)
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            Document (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
