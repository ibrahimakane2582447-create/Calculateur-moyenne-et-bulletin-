import React, { useRef, useState } from 'react';
import { Download, Image as ImageIcon, X, Loader2, GraduationCap, Share2, Printer, Camera } from 'lucide-react';
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

  const generateCanvas = async (scale = 2) => {
    const element = printRef.current;
    if (!element) return null;

    try {
      const canvas = await html2canvas(element, { 
        scale: scale, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('bulletin-to-print');
          if (clonedElement) {
            clonedElement.style.display = 'block';
            clonedElement.style.margin = '0';
            clonedElement.style.padding = '20px';
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.border = 'none';
          }
        }
      });
      return canvas;
    } catch (err) {
      console.error('html2canvas error:', err);
      return null;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas(1.5); // Lower scale for PDF to be safer
      if (!canvas) throw new Error('Canvas generation failed');

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
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

      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
      pdf.save(`Bulletin_${studentInfo.firstName}_${studentInfo.lastName}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert("La génération PDF a échoué. Essayez le bouton 'Imprimer' ou 'Capture'.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas(2);
      if (!canvas) throw new Error('Canvas generation failed');

      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Bulletin_${studentInfo.firstName}_${studentInfo.lastName}.png`;
      link.href = data;
      link.click();
    } catch (error) {
      console.error('Failed to generate Image:', error);
      // Fallback: Open image in new tab
      try {
        const canvas = await generateCanvas(1);
        if (canvas) {
          const data = canvas.toDataURL('image/png');
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`<img src="${data}" style="width:100%" />`);
            newWindow.document.title = "Bulletin - Capture";
          }
        }
      } catch (e) {
        alert("Erreur lors de la génération de l'image.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas(1.5);
      if (!canvas) throw new Error('Canvas generation failed');

      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Bulletin_${studentInfo.firstName}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Bulletin de Notes',
          text: `Voici le bulletin de ${studentInfo.firstName} ${studentInfo.lastName}.`,
        });
      } else {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Voici le bulletin de ${studentInfo.firstName} ${studentInfo.lastName}.`)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      alert("Le partage a échoué. Utilisez le bouton 'Imprimer' ou 'Capture'.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCapture = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas(2);
      if (!canvas) throw new Error('Canvas generation failed');

      const data = canvas.toDataURL('image/png');
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Bulletin - Capture d'écran</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; background: #f0f0f0; font-family: sans-serif; }
                .container { background: white; padding: 20px; box-shadow: 0 0 20px rgba(0,0,0,0.1); max-width: 100%; }
                img { max-width: 100%; height: auto; }
                .instructions { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 20px; font-size: 14px; z-index: 100; }
              </style>
            </head>
            <body>
              <div class="instructions">Maintenez l'image pour l'enregistrer ou faites une capture d'écran</div>
              <div class="container">
                <img src="${data}" />
              </div>
            </body>
          </html>
        `);
      } else {
        alert("Le bloqueur de fenêtres a empêché l'ouverture de la capture. Autorisez les fenêtres surgissantes.");
      }
    } catch (error) {
      console.error('Capture failed:', error);
      alert("La capture a échoué.");
    } finally {
      setIsGenerating(false);
    }
  };

  let totalPoints = 0;
  let totalCoef = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto print:static print:bg-transparent print:p-0">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-4 flex flex-col max-h-[95vh] print:max-h-none print:m-0 print:shadow-none">
        <div className="flex justify-between items-center p-3 border-b shrink-0 print:hidden">
          <h2 className="text-lg font-bold text-gray-800">Aperçu du Bulletin</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-indigo-600 font-medium hidden sm:inline">Cliquez sur le bulletin pour le télécharger</span>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 overflow-y-auto grow bg-gray-50 print:p-0 print:overflow-visible print:bg-transparent">
          <div 
            id="bulletin-to-print" 
            ref={printRef} 
            onClick={handleDownloadImage}
            title="Cliquez pour télécharger comme image"
            className={`bg-white p-6 sm:p-8 border border-gray-200 shadow-sm mx-auto cursor-pointer transition-transform active:scale-[0.99] relative group print:p-0 print:border-none print:shadow-none print:max-w-none ${isGenerating ? 'opacity-70 pointer-events-none' : ''}`}
            style={{ width: '100%', maxWidth: '750px' }}
          >
            {isGenerating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}
            
            {/* Hover Hint */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none">
              Cliquez pour télécharger
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-5 border-b-2 border-indigo-800 pb-4 print:mb-8 print:pb-6">
              <div className="flex items-center gap-2 print:gap-4">
                <div className="bg-indigo-600 p-2 rounded-lg print:bg-transparent print:p-0">
                  <GraduationCap className="w-6 h-6 text-white print:text-indigo-800 print:w-10 print:h-10" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-gray-900 print:text-2xl">Bulletin de Notes</h1>
                  <p className="text-[10px] sm:text-xs text-gray-600 font-medium print:text-base">{semesterName}</p>
                </div>
              </div>
              <div className="text-right">
                {studentInfo.schoolName && (
                  <p className="text-xs sm:text-sm font-bold text-gray-800 mb-1 print:text-lg">{studentInfo.schoolName}</p>
                )}
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 print:text-base">Année Scolaire : {studentInfo.schoolYear || '2025-2026'}</p>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex justify-between items-center mb-5 text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200 print:bg-transparent print:border-none print:p-0 print:mb-8">
              <div className="flex items-center gap-4">
                {studentInfo.photoUrl && (
                  <img src={studentInfo.photoUrl} alt="Élève" className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-indigo-100 print:border-indigo-800" />
                )}
                <div>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 print:text-sm">Élève</p>
                  <p className="text-xs sm:text-sm print:text-lg"><span className="font-bold">Nom :</span> {studentInfo.lastName.toUpperCase()}</p>
                  <p className="text-xs sm:text-sm print:text-lg"><span className="font-bold">Prénom :</span> {studentInfo.firstName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 print:text-sm">Classe</p>
                <p className="text-sm sm:text-base font-bold text-indigo-700 print:text-xl">{studentInfo.className || 'Non précisée'}</p>
              </div>
            </div>

            {/* Grades Table */}
            <table className="w-full mb-5 border-collapse text-[10px] sm:text-xs print:text-sm">
              <thead>
                <tr className="bg-indigo-50 border-y-2 border-indigo-800 print:bg-transparent print:border-b-2 print:border-t-0">
                  <th className="text-left py-1.5 px-1 sm:px-2 font-bold text-indigo-900 print:py-3 print:text-base">Matière</th>
                  <th className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-900 print:py-3 print:text-base">Devoirs</th>
                  <th className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-900 print:py-3 print:text-base">Compo</th>
                  <th className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-900 print:py-3 print:text-base">Moy.</th>
                  <th className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-900 print:py-3 print:text-base">Coef</th>
                  <th className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-900 print:py-3 print:text-base">Total</th>
                  <th className="text-left py-1.5 px-1 sm:px-2 font-bold text-indigo-900 print:py-3 print:text-base">Appréciation</th>
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
                    <tr key={sub.id} className="border-b border-gray-200 hover:bg-gray-50 print:border-gray-300">
                      <td className="py-1.5 px-1 sm:px-2 font-bold text-gray-800 print:py-3 print:text-base">{sub.name}</td>
                      <td className="text-center py-1.5 px-1 sm:px-2 text-gray-600 print:py-3 print:text-base">{devoirsStr}</td>
                      <td className="text-center py-1.5 px-1 sm:px-2 text-gray-600 print:py-3 print:text-base">{compoStr}</td>
                      <td className="text-center py-1.5 px-1 sm:px-2 font-bold text-gray-900 print:py-3 print:text-base">{formatNumber(avg)}</td>
                      <td className="text-center py-1.5 px-1 sm:px-2 text-gray-600 print:py-3 print:text-base">{sub.coef}</td>
                      <td className="text-center py-1.5 px-1 sm:px-2 font-bold text-indigo-600 print:py-3 print:text-base">{avg !== null ? formatNumber(avg * sub.coef) : '-'}</td>
                      <td className="text-left py-1.5 px-1 sm:px-2 text-gray-600 italic text-[9px] sm:text-[10px] print:py-3 print:text-sm">{getAppreciation(avg)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-800 font-bold print:bg-transparent">
                  <td colSpan={4} className="py-2 px-1 sm:px-2 text-right text-gray-700 print:py-4 print:text-base">TOTAL :</td>
                  <td className="text-center py-2 px-1 sm:px-2 text-gray-900 print:py-4 print:text-base">{totalCoef}</td>
                  <td className="text-center py-2 px-1 sm:px-2 text-indigo-700 print:py-4 print:text-base">{formatNumber(totalPoints)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            {/* Summary */}
            <div className="flex justify-end mb-8 print:mt-8">
              <div className="w-full sm:w-2/3 bg-indigo-50 p-3 sm:p-4 rounded-lg border border-indigo-100 shadow-sm print:bg-transparent print:border-2 print:border-indigo-800 print:shadow-none">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700 text-xs sm:text-sm print:text-lg">Moyenne du Semestre :</span>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-indigo-700 print:text-2xl">{formatNumber(semesterAverage)} / 20</span>
                    <p className="text-[10px] sm:text-xs font-bold text-indigo-600 mt-0.5 print:text-sm">Mention : {semesterMention}</p>
                  </div>
                </div>
                {annualAverage !== undefined && (
                  <div className="flex justify-between items-center pt-2 border-t border-indigo-200 print:border-indigo-800">
                    <span className="font-bold text-gray-700 text-xs sm:text-sm print:text-lg">Moyenne Annuelle :</span>
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-emerald-600 print:text-2xl">{formatNumber(annualAverage)} / 20</span>
                      <p className="text-[10px] sm:text-xs font-bold text-emerald-600 mt-0.5 print:text-sm">Mention : {annualMention}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Signatures removed */}
          </div>
        </div>

        <div className="p-3 border-t shrink-0 flex flex-wrap justify-center gap-2 bg-gray-50 rounded-b-xl print:hidden">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            Télécharger Image
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}
