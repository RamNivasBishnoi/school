import { useState } from 'react';
import { Student, Teacher, AccountTransaction } from '../types';

interface AnalyticsProps {
  students: Student[];
  teachers: Teacher[];
  transactions: AccountTransaction[];
  isResultsDeclared: boolean;
}

export default function Analytics({ students, teachers, transactions, isResultsDeclared }: AnalyticsProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // 1. Calculations for Fees Analytics
  const totalExpectedFees = students.reduce((acc, s) => acc + s.feeTotal, 0);
  const totalCollectedFees = students.reduce((acc, s) => acc + s.feePaid, 0);
  const totalPendingFees = totalExpectedFees - totalCollectedFees;
  const collectionPercentage = totalExpectedFees > 0 ? (totalCollectedFees / totalExpectedFees) * 100 : 0;

  // 2. Calculations for Attendance Analytics (average across all students for the recent dates)
  const classAttendance: { [className: string]: { present: number; total: number } } = {};
  students.forEach(s => {
    if (!classAttendance[s.className]) {
      classAttendance[s.className] = { present: 0, total: 0 };
    }
    const days = Object.values(s.attendance);
    days.forEach(status => {
      classAttendance[s.className].total += 1;
      if (status === 'Present') {
        classAttendance[s.className].present += 1;
      }
    });
  });

  const classAttendanceRates = Object.entries(classAttendance).map(([className, data]) => {
    const rate = data.total > 0 ? (data.present / data.total) * 100 : 100;
    return { className, rate: Math.round(rate), total: data.total };
  }).sort((a, b) => a.className.localeCompare(b.className));

  // 3. Accounting Transactions Breakdown
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'Expense' || t.type === 'Salary').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Expense Categories Grouping
  const expenseCategories: { [category: string]: number } = {};
  transactions.filter(t => t.type === 'Expense' || t.type === 'Salary').forEach(t => {
    expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
  });

  // 4. Marks entry progress tracking for Subject/Class teachers
  // Let's assume there are 6 core subjects: Math, Science, English, Hindi, Social Science, Computer Science
  // Total marks entries to make = students (100) * subjects (6) = 600 entries for Half Yearly and 600 for Annual
  // Let's see how many Half-Yearly marks have been updated vs Annual marks.
  const coreSubjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'];
  let totalPossibleEntries = students.length * coreSubjects.length * 2; // Half Yearly + Annual
  let completedEntries = 0;

  students.forEach(s => {
    coreSubjects.forEach(sub => {
      if (s.marks[sub]) {
        if (s.marks[sub].halfYearly !== null) completedEntries++;
        if (s.marks[sub].annual !== null) completedEntries++;
      }
    });
  });

  const examProgressPercent = Math.round((completedEntries / totalPossibleEntries) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="school-analytics-section">
      {/* 📊 1. Circle Progress - Fees Collection */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xs transition-colors duration-200">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
          कुल फीस संग्रहण (Fee Collection Status)
        </h3>
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Custom SVG Donut Chart */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-zinc-100 dark:text-zinc-800"
              />
              {/* Indicator circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="var(--color-emerald-500)"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - collectionPercentage / 100)}`}
                strokeLinecap="round"
                fill="transparent"
                style={{ stroke: 'oklch(0.79 0.17 155.6)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">{Math.round(collectionPercentage)}%</span>
              <span className="text-xs text-zinc-400">संग्रहित (Paid)</span>
            </div>
          </div>

          <div className="space-y-3 w-full sm:w-auto">
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> प्राप्त शुल्क (Collected)
              </span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">₹{totalCollectedFees.toLocaleString('hi-IN')}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700"></span> लंबित शुल्क (Pending)
              </span>
              <span className="text-sm font-bold text-red-500">₹{totalPendingFees.toLocaleString('hi-IN')}</span>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 flex items-center justify-between gap-6">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">कुल देय (Total Expected)</span>
              <span className="text-sm font-black text-zinc-900 dark:text-white">₹{totalExpectedFees.toLocaleString('hi-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 2. Custom SVG Bar Chart - Attendance Rate by Class */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xs transition-colors duration-200">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
          कक्षावार औसत उपस्थिति (Attendance by Class)
        </h3>
        <div className="h-44 w-full flex items-end justify-between px-2 pt-4 border-b border-zinc-100 dark:border-zinc-800 relative">
          {classAttendanceRates.map((item, idx) => {
            const barHeight = `${item.rate}%`;
            return (
              <div
                key={item.className}
                className="flex flex-col items-center flex-1 group cursor-pointer relative"
                onMouseEnter={() => setHoveredBar(item.className)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Value tooltip */}
                <div
                  className={`absolute -top-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] py-1 px-2 rounded-md shadow-md font-bold transition-all duration-200 ${
                    hoveredBar === item.className ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                  }`}
                >
                  {item.rate}%
                </div>
                {/* Bar */}
                <div
                  className="w-8 sm:w-12 bg-indigo-500/10 group-hover:bg-indigo-500/20 dark:bg-indigo-400/5 rounded-t-md relative overflow-hidden transition-all duration-300"
                  style={{ height: '110px' }}
                >
                  <div
                    className="w-full bg-indigo-500 group-hover:bg-indigo-600 dark:bg-indigo-400 rounded-t-md absolute bottom-0 transition-all duration-500"
                    style={{ height: barHeight }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-400 mt-2">{item.className}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[10px] text-zinc-400 text-center">
          * सभी ५ कार्य दिवसों की वास्तविक उपस्थिति आंकड़ों का औसत
        </div>
      </div>

      {/* 📊 3. Budget & Expenses Analytics */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xs transition-colors duration-200">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
          बजट और वित्तीय स्थिति (Accounting Sheet Summary)
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-center">
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">कुल आय (Total Income)</div>
              <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">₹{totalIncome.toLocaleString('hi-IN')}</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl text-center">
              <div className="text-[10px] font-bold text-red-600 dark:text-red-400">कुल व्यय (Expenses)</div>
              <div className="text-sm font-extrabold text-red-700 dark:text-red-300">₹{totalExpenses.toLocaleString('hi-IN')}</div>
            </div>
            <div className={`p-3 rounded-xl text-center ${netBalance >= 0 ? 'bg-indigo-50 dark:bg-indigo-950/20' : 'bg-amber-50'}`}>
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">बचत (Net Balance)</div>
              <div className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300">₹{netBalance.toLocaleString('hi-IN')}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400">व्यय विवरण (Expense Distribution)</h4>
            {Object.entries(expenseCategories).map(([cat, amount]) => {
              const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-700 dark:text-zinc-400 font-medium">{cat === 'Salary' ? 'शिक्षकों का वेतन (Teacher Salary)' : cat}</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">₹{amount.toLocaleString('hi-IN')} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📊 4. Exams & Results Entry Progress */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xs transition-colors duration-200">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
          परीक्षा परिणाम प्रविष्टि प्रोग्रेस (Exams Marks Entry Progress)
        </h3>
        <div className="space-y-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-zinc-600 dark:text-zinc-400 font-bold">समग्र प्रविष्टि प्रोग्रेस (Overall Work Completion)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{examProgressPercent}% पूर्ण (Done)</span>
            </div>
            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${examProgressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100/50 dark:border-zinc-800/50">
              <span className="block text-[10px] text-zinc-400 font-semibold uppercase">छमाही परीक्षा (Half Yearly)</span>
              <span className="text-lg font-black text-emerald-500">100% प्रविष्टि</span>
              <span className="block text-[9px] text-zinc-400">सभी ६ विषयों के अंक दर्ज</span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100/50 dark:border-zinc-800/50">
              <span className="block text-[10px] text-zinc-400 font-semibold uppercase">वार्षिक परीक्षा (Annual)</span>
              <span className="text-lg font-black text-amber-500">0% प्रविष्टि</span>
              <span className="block text-[9px] text-zinc-400">शिक्षकों द्वारा प्रविष्टि लंबित</span>
            </div>
          </div>

          <div className="p-3 rounded-xl flex items-center justify-between text-xs bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300">
            <span>परिणाम घोषणा की स्थिति (Declaration Status):</span>
            <span className={`font-extrabold px-2 py-0.5 rounded-full text-[10px] ${isResultsDeclared ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
              {isResultsDeclared ? 'घोषित (Declared)' : 'प्रतीक्षारत (Pending)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
