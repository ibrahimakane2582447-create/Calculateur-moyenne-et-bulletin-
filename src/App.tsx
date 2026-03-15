import React, { useState } from 'react';
import { StudentInfo, Subject } from './types';
import { calculateSemesterAverage, formatNumber } from './utils';
import BulletinModal from './components/BulletinModal';
import { BookOpen, User, Calculator, FileText, GraduationCap, Plus, Trash2 } from 'lucide-react';

const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathématiques', devoir1: '', devoir2: '', composition: '', coef: 4 },
  { id: '2', name: 'Français', devoir1: '', devoir2: '', composition: '', coef: 4 },
  { id: '3', name: 'Anglais', devoir1: '', devoir2: '', composition: '', coef: 3 },
  { id: '4', name: 'Histoire-Géo', devoir1: '', devoir2: '', composition: '', coef: 3 },
  { id: '5', name: 'Physique-Chimie', devoir1: '', devoir2: '', composition: '', coef: 3 },
  { id: '6', name: 'SVT', devoir1: '', devoir2: '', composition: '', coef: 3 },
  { id: '7', name: 'EPS', devoir1: '', devoir2: '', composition: '', coef: 2 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'S1' | 'S2' | 'ANNUAL'>('S1');
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    firstName: '',
    lastName: '',
    className: '',
    schoolYear: '2025-2026'
  });
  
  const [semester1, setSemester1] = useState<Subject[]>(JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)));
  const [semester2, setSemester2] = useState<Subject[]>(JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)));
  
  const [isBulletinOpen, setIsBulletinOpen] = useState(false);
  const [bulletinType, setBulletinType] = useState<'S1' | 'S2'>('S1');

  const handleSubjectChange = (semester: 'S1' | 'S2', id: string, field: keyof Subject, value: string) => {
    if (field === 'name') {
      setSemester1(semester1.map(sub => sub.id === id ? { ...sub, name: value } : sub));
      setSemester2(semester2.map(sub => sub.id === id ? { ...sub, name: value } : sub));
      return;
    }
    
    if (field === 'coef') {
      const parsedCoef = value === '' ? 0 : parseFloat(value);
      setSemester1(semester1.map(sub => sub.id === id ? { ...sub, coef: parsedCoef } : sub));
      setSemester2(semester2.map(sub => sub.id === id ? { ...sub, coef: parsedCoef } : sub));
      return;
    }

    const numValue = value === '' ? '' : Math.max(0, Math.min(20, Number(value)));
    
    if (semester === 'S1') {
      setSemester1(semester1.map(sub => sub.id === id ? { ...sub, [field]: numValue } : sub));
    } else {
      setSemester2(semester2.map(sub => sub.id === id ? { ...sub, [field]: numValue } : sub));
    }
  };

  const handleAddSubject = () => {
    const newId = Date.now().toString();
    const newSubject: Subject = {
      id: newId,
      name: 'Nouvelle matière',
      devoir1: '',
      devoir2: '',
      composition: '',
      coef: 1
    };
    setSemester1([...semester1, newSubject]);
    setSemester2([...semester2, { ...newSubject }]);
  };

  const handleDeleteSubject = (id: string) => {
    setSemester1(semester1.filter(sub => sub.id !== id));
    setSemester2(semester2.filter(sub => sub.id !== id));
  };

  const renderSubjectInputs = (semester: 'S1' | 'S2') => {
    const subjects = semester === 'S1' ? semester1 : semester2;
    
    return (
      <div className="space-y-4">
        {subjects.map(sub => (
          <div key={sub.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <input
                type="text"
                value={sub.name}
                onChange={(e) => handleSubjectChange(semester, sub.id, 'name', e.target.value)}
                className="font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none w-1/2 px-1 py-0.5"
                placeholder="Nom de la matière"
              />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                  <label className="text-xs text-indigo-800 font-medium">Coef</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={sub.coef === 0 ? '' : sub.coef}
                    onChange={(e) => handleSubjectChange(semester, sub.id, 'coef', e.target.value)}
                    className="w-10 text-center text-sm font-bold bg-transparent text-indigo-900 outline-none"
                    placeholder="1"
                  />
                </div>
                <button 
                  onClick={() => handleDeleteSubject(sub.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer la matière"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Devoir 1</label>
                <input
                  type="number"
                  min="0" max="20" step="0.25"
                  value={sub.devoir1}
                  onChange={(e) => handleSubjectChange(semester, sub.id, 'devoir1', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="/20"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Devoir 2</label>
                <input
                  type="number"
                  min="0" max="20" step="0.25"
                  value={sub.devoir2}
                  onChange={(e) => handleSubjectChange(semester, sub.id, 'devoir2', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="/20"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Compo</label>
                <input
                  type="number"
                  min="0" max="20" step="0.25"
                  value={sub.composition}
                  onChange={(e) => handleSubjectChange(semester, sub.id, 'composition', e.target.value)}
                  className="w-full bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="/20"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddSubject}
          className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter une matière
        </button>
        
        <button
          onClick={() => {
            setBulletinType(semester);
            setIsBulletinOpen(true);
          }}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <FileText className="w-5 h-5" />
          Générer le Bulletin {semester === 'S1' ? '1' : '2'}
        </button>
      </div>
    );
  };

  const avgS1 = calculateSemesterAverage(semester1);
  const avgS2 = calculateSemesterAverage(semester2);
  const annualAvg = (avgS1 + avgS2) / 2;

  return (
    <div 
      className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onContextMenu={(e) => {
        if (e.target instanceof Element && e.target.tagName !== 'INPUT') {
          e.preventDefault();
        }
      }}
    >
      {/* Header */}
      <header className="bg-indigo-600 text-white pt-12 pb-6 px-4 shadow-md rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-2 rounded-xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Calcule mes notes</h1>
              <p className="text-indigo-200 text-sm">Moyennes & Bulletins</p>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="bg-white rounded-2xl p-4 shadow-lg text-gray-800">
            <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
              <User className="w-5 h-5 text-indigo-500" />
              <h2 className="font-semibold">Informations Élève</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Prénom"
                value={studentInfo.firstName}
                onChange={e => setStudentInfo({...studentInfo, firstName: e.target.value})}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="text"
                placeholder="Nom"
                value={studentInfo.lastName}
                onChange={e => setStudentInfo({...studentInfo, lastName: e.target.value})}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="text"
                placeholder="Classe (ex: 3ème A)"
                value={studentInfo.className}
                onChange={e => setStudentInfo({...studentInfo, className: e.target.value})}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="text"
                placeholder="Année (ex: 2025-2026)"
                value={studentInfo.schoolYear}
                onChange={e => setStudentInfo({...studentInfo, schoolYear: e.target.value})}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 mt-6">
        {activeTab === 'S1' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Notes Semestre 1</h2>
            </div>
            {renderSubjectInputs('S1')}
          </div>
        )}

        {activeTab === 'S2' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Notes Semestre 2</h2>
            </div>
            {renderSubjectInputs('S2')}
          </div>
        )}

        {activeTab === 'ANNUAL' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Bilan Annuel</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <span className="text-gray-600 font-medium">Moyenne Semestre 1</span>
                <span className="text-2xl font-bold text-gray-900">{formatNumber(avgS1)}</span>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <span className="text-gray-600 font-medium">Moyenne Semestre 2</span>
                <span className="text-2xl font-bold text-gray-900">{formatNumber(avgS2)}</span>
              </div>

              <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white mt-8 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-xl"></div>
                <div className="absolute -left-4 -bottom-4 bg-black/10 w-24 h-24 rounded-full blur-xl"></div>
                <div className="relative z-10">
                  <p className="text-indigo-100 font-medium mb-1">Moyenne Générale Annuelle</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black">{formatNumber(annualAvg)}</span>
                    <span className="text-xl text-indigo-200 mb-1">/ 20</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-indigo-500/50">
                    <p className="text-sm font-medium">
                      {annualAvg >= 10 ? 'Statut : Admis en classe supérieure' : 'Statut : Non admis'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 pb-safe">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button
            onClick={() => setActiveTab('S1')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'S1' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-xl ${activeTab === 'S1' ? 'bg-indigo-50' : ''}`}>
              <span className="font-bold text-lg leading-none">S1</span>
            </div>
            <span className="text-xs font-medium">Semestre 1</span>
          </button>
          
          <button
            onClick={() => setActiveTab('S2')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'S2' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-xl ${activeTab === 'S2' ? 'bg-indigo-50' : ''}`}>
              <span className="font-bold text-lg leading-none">S2</span>
            </div>
            <span className="text-xs font-medium">Semestre 2</span>
          </button>
          
          <button
            onClick={() => setActiveTab('ANNUAL')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'ANNUAL' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-xl ${activeTab === 'ANNUAL' ? 'bg-indigo-50' : ''}`}>
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Annuel</span>
          </button>
        </div>
      </nav>

      <BulletinModal
        isOpen={isBulletinOpen}
        onClose={() => setIsBulletinOpen(false)}
        studentInfo={studentInfo}
        semesterName={bulletinType === 'S1' ? 'Premier Semestre' : 'Deuxième Semestre'}
        subjects={bulletinType === 'S1' ? semester1 : semester2}
        annualAverage={bulletinType === 'S2' ? annualAvg : undefined}
      />
    </div>
  );
}
