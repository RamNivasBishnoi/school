import { Student, Teacher, AppState } from '../types';
import { Award, BookOpen, CheckCircle, RefreshCw } from 'lucide-react';

interface ExamPanelProps {
  students: Student[];
  teachers: Teacher[];
  isResultsDeclared: boolean;
  onUpdateState: (updates: Partial<AppState>) => void;
  onAddNotification: (title: string, body: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
}

export default function ExamPanel({
  students,
  teachers,
  isResultsDeclared,
  onUpdateState,
  onAddNotification
}: ExamPanelProps) {
  const coreSubjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'];
  const classes = ['6A', '7A', '8A', '9A', '10A'];

  // 1. Calculate overall Marks entry completion statistics
  let totalEntriesNeeded = students.length * coreSubjects.length * 2; // Half Yearly + Annual
  let completedEntries = 0;

  students.forEach(s => {
    coreSubjects.forEach(sub => {
      if (s.marks[subjectMapping(sub)]) {
        if (s.marks[subjectMapping(sub)].halfYearly !== null) completedEntries++;
        if (s.marks[subjectMapping(sub)].annual !== null) completedEntries++;
      }
    });
  });

  const progressPercent = Math.round((completedEntries / totalEntriesNeeded) * 100);

  // Helper function to handle spelling variations
  function subjectMapping(sub: string): string {
    return sub;
  }

  // 2. Action to Publish / Declare Results
  const handleDeclareResults = () => {
    const newState = !isResultsDeclared;
    onUpdateState({ isResultsDeclared: newState });

    if (newState) {
      onAddNotification(
        'वार्षिक परीक्षा परिणाम घोषित! 🎓🎉',
        'विद्यालय के परीक्षा प्रभारी द्वारा शैक्षणिक सत्र २०२६ का वार्षिक परीक्षा परिणाम आधिकारिक रूप से घोषित कर दिया गया है।',
        'success'
      );
    } else {
      onAddNotification(
        'परिणाम घोषणा निरस्त',
        'आधिकारिक परीक्षा परिणाम घोषणा को अस्थायी रूप से वापस लिया गया है।',
        'warning'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">परीक्षा नियंत्रक स्थिति (Exam Control status)</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span>अंक प्रविष्टि प्रगति (Marks Entry Completion)</span>
              <span>{progressPercent}% ({completedEntries} / {totalEntriesNeeded})</span>
            </div>
            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="p-4 bg-indigo-50/50 dark:bg-zinc-800/40 border border-indigo-100/50 dark:border-zinc-700 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-between">
            <span>परिणाम घोषणा की स्थिति (Declaration):</span>
            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black text-white ${
              isResultsDeclared ? 'bg-emerald-500' : 'bg-amber-500'
            }`}>
              {isResultsDeclared ? 'घोषित (Declared)' : 'घोषित नहीं'}
            </span>
          </div>
        </div>

        {/* Action Publish Results */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase mb-2">परिणाम प्रकाशन बोर्ड (Results Declarator Portal)</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              * कृपया परिणाम घोषित करने से पूर्व सुनिश्चित कर लें कि सभी शिक्षकों द्वारा छमाही और वार्षिक परीक्षाओं के प्राप्तांक दर्ज कर लिए गए हैं। परिणाम घोषित होते ही छात्रों की अंकतालिका सक्रिय हो जाएगी।
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={handleDeclareResults}
              className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                isResultsDeclared
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              <Award className="w-5 h-5" />
              {isResultsDeclared ? 'आधिकारिक परिणाम वापस लें (Recall Results)' : 'वार्षिक परिणाम घोषित करें (Declare Results Now!)'}
            </button>
          </div>
        </div>
      </div>

      {/* Detail subject-wise matrix */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2 mb-4">
          कक्षावार और विषयवार प्रविष्टि की प्रगति (Marks Entry Completion Log matrix)
        </h3>
        <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-bold">
              <tr>
                <th className="p-3">कक्षा</th>
                {coreSubjects.map(sub => (
                  <th key={sub} className="p-3 text-center">{sub}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {classes.map(cls => (
                <tr key={cls} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300">
                  <td className="p-3 font-bold text-indigo-500 bg-zinc-50/30 dark:bg-zinc-800/10">{cls}</td>
                  {coreSubjects.map(sub => {
                    // Check if marks are entered for this class and subject
                    const classSts = students.filter(s => s.className === cls);
                    const filledCount = classSts.filter(s => s.marks[sub] && s.marks[sub].halfYearly !== null).length;
                    const annualFilled = classSts.filter(s => s.marks[sub] && s.marks[sub].annual !== null).length;
                    const pct = classSts.length > 0 ? Math.round(((filledCount + annualFilled) / (classSts.length * 2)) * 100) : 0;

                    return (
                      <td key={sub} className="p-3 text-center font-bold">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                            pct === 100
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : pct > 0
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30'
                                : 'bg-red-100 text-red-700 dark:bg-rose-950/30'
                          }`}>
                            {pct}%
                          </span>
                          <span className="block text-[9px] text-zinc-400 font-normal">
                            ({filledCount + annualFilled}/{classSts.length * 2})
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
