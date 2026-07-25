import React, { useState } from 'react';
import { Student, Teacher, AccountTransaction, LeaveRequest, AppState } from '../types';
import { IndianRupee, CreditCard, Users, Check, X, Search, PlusCircle, Calendar } from 'lucide-react';

interface ManagerPanelProps {
  students: Student[];
  teachers: Teacher[];
  transactions: AccountTransaction[];
  leaves: LeaveRequest[];
  onUpdateState: (updates: Partial<AppState>) => void;
  onAddNotification: (title: string, body: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
}

export default function ManagerPanel({
  students,
  teachers,
  transactions,
  leaves,
  onUpdateState,
  onAddNotification
}: ManagerPanelProps) {
  const [activeTab, setActiveTab] = useState<'accounting' | 'fees' | 'salaries' | 'leaves'>('accounting');

  // Accounting States
  const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
  const [txCategory, setTxCategory] = useState('Tuition Fee');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState('2026-07-15');
  const [txDesc, setTxDesc] = useState('');

  // Fee Collection Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [feeStudentId, setFeeStudentId] = useState<string | null>(null);
  const [feeCollectAmount, setFeeCollectAmount] = useState('');

  // 1. Accounting calculations
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'Expense' || t.type === 'Salary').reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Add Custom Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txCategory) return;

    const newTx: AccountTransaction = {
      id: `TX${transactions.length + 1}`,
      type: txType,
      category: txCategory,
      amount: Number(txAmount),
      date: txDate,
      description: txDesc || `${txCategory} payment`
    };

    onUpdateState({ transactions: [newTx, ...transactions] });
    onAddNotification(
      'लेखा जोखा प्रविष्टि सहेजी गई',
      `राशि ₹${Number(txAmount).toLocaleString('hi-IN')} की ${txType === 'Income' ? 'आय' : 'व्यय'} प्रविष्टि दर्ज की गई।`,
      'success'
    );

    setTxAmount('');
    setTxDesc('');
  };

  // 2. Receive Fee Payment
  const handleCollectFees = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeStudentId || !feeCollectAmount) return;

    const amount = Number(feeCollectAmount);
    const targetStudent = students.find(s => s.id === feeStudentId);
    if (!targetStudent) return;

    // Check if payment exceeds dues
    const dues = targetStudent.feeTotal - targetStudent.feePaid;
    if (amount > dues) {
      alert(`भुगतान की राशि लंबित शुल्क ₹${dues} से अधिक नहीं हो सकती।`);
      return;
    }

    // Update student paid fee
    const updatedStudents = students.map(s => {
      if (s.id === feeStudentId) {
        return {
          ...s,
          feePaid: s.feePaid + amount
        };
      }
      return s;
    });

    // Create Transaction record automatically!
    const feeTx: AccountTransaction = {
      id: `TX${transactions.length + 1}`,
      type: 'Income',
      category: 'Tuition Fee',
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      description: `शुल्क रसीद प्राप्त - छात्र ${targetStudent.name} (कक्षा ${targetStudent.className})`
    };

    onUpdateState({
      students: updatedStudents,
      transactions: [feeTx, ...transactions]
    });

    onAddNotification(
      'फीस भुगतान रसीद स्वीकृत',
      `छात्र ${targetStudent.name} से शुल्क राशि ₹${amount.toLocaleString('hi-IN')} सफलता पूर्वक प्राप्त कर ली गई है।`,
      'success'
    );

    setFeeStudentId(null);
    setFeeCollectAmount('');
  };

  // 3. Dispatch Salary for Teacher
  const handlePaySalary = (teacherId: string) => {
    const teach = teachers.find(t => t.id === teacherId);
    if (!teach) return;

    // Update teacher's salary status to Paid
    const updatedTeachers = teachers.map(t => {
      if (t.id === teacherId) {
        return {
          ...t,
          salaryStatus: {
            ...t.salaryStatus,
            'July 2026': 'Paid' as const
          }
        };
      }
      return t;
    });

    // Create Salary expense record automatically!
    const salTx: AccountTransaction = {
      id: `TX${transactions.length + 1}`,
      type: 'Salary',
      category: 'Salary',
      amount: teach.salary,
      date: new Date().toISOString().split('T')[0],
      description: `शिक्षक वेतन भुगतान - ${teach.name} (जुलाई २०२६)`
    };

    onUpdateState({
      teachers: updatedTeachers,
      transactions: [salTx, ...transactions]
    });

    onAddNotification(
      'वेतन भुगतान पूर्ण (Salary Dispatched)',
      `शिक्षक ${teach.name} को जुलाई २०२६ का वेतन ₹${teach.salary.toLocaleString('hi-IN')} हस्तांतरित किया गया।`,
      'success'
    );
  };

  // 4. Leave Approval
  const handleLeaveStatusUpdate = (leaveId: string, status: 'Approved' | 'Rejected') => {
    const updatedLeaves = leaves.map(l => l.id === leaveId ? { ...l, status } : l);
    const target = leaves.find(l => l.id === leaveId);
    
    onUpdateState({ leaves: updatedLeaves });
    onAddNotification(
      `अवकाश आवेदन ${status === 'Approved' ? 'स्वीकृत' : 'अस्वीकृत'}`,
      `${target?.requesterName} का अवकाश आवेदन ${status === 'Approved' ? 'स्वीकार' : 'खारिज'} कर दिया गया है।`,
      status === 'Approved' ? 'success' : 'warning'
    );
  };

  // Filter students for fee tracking
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 🧭 Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('accounting')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'accounting' ? 'bg-indigo-500 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <IndianRupee className="w-4 h-4" /> विद्यालय लेखा-जोखा (Accounting)
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'fees' ? 'bg-indigo-500 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <CreditCard className="w-4 h-4" /> छात्र फीस प्राप्त करें (Fees Manager)
        </button>
        <button
          onClick={() => setActiveTab('salaries')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'salaries' ? 'bg-indigo-500 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Users className="w-4 h-4" /> शिक्षक वेतन वितरण (Staff Salary)
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'leaves' ? 'bg-indigo-500 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Calendar className="w-4 h-4" /> अवकाश प्रभार स्वीकृति (Leaves Approval)
          {leaves.filter(l => l.status === 'Pending').length > 0 && (
            <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-black">
              {leaves.filter(l => l.status === 'Pending').length}
            </span>
          )}
        </button>
      </div>

      {/* 🎯 Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-xs transition-colors duration-200">
        
        {/* 1. Accounting Tab */}
        {activeTab === 'accounting' && (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 rounded-2xl">
                <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">कुल संचित आय (Total Income)</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{totalIncome.toLocaleString('hi-IN')}</span>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100/30 rounded-2xl">
                <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">कुल विद्यालय व्यय (Expenses)</span>
                <span className="text-xl font-black text-red-600 dark:text-red-400">₹{totalExpenses.toLocaleString('hi-IN')}</span>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/30 rounded-2xl">
                <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">शुद्ध वित्तीय शेष (Net Balance)</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{totalBalance.toLocaleString('hi-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form to post expense/income */}
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-500" /> वित्तीय लेखा प्रविष्टि दर्ज करें
                </h3>
                <div className="space-y-3 text-xs font-semibold text-zinc-500">
                  <div>
                    <label className="block mb-1">लेनदेन का प्रकार (Transaction Type) *</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setTxType('Income'); setTxCategory('Tuition Fee'); }}
                        className={`flex-1 py-2 rounded-xl font-black text-xs ${
                          txType === 'Income'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        आय (Receipt / Income)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTxType('Expense'); setTxCategory('Electricity'); }}
                        className={`flex-1 py-2 rounded-xl font-black text-xs ${
                          txType === 'Expense'
                            ? 'bg-rose-500 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        व्यय (Payment / Expense)
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">श्रेणी (Category) *</label>
                    <select
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl text-zinc-800 dark:text-white"
                    >
                      {txType === 'Income' ? (
                        <>
                          <option value="Tuition Fee">विद्यार्थी ट्यूशन शुल्क (Tuition Fee)</option>
                          <option value="Donation">सरकारी अनुदान / दान (Donation)</option>
                          <option value="Other Income">अन्य विविध आय</option>
                        </>
                      ) : (
                        <>
                          <option value="Electricity">बिजली बिल (Electricity)</option>
                          <option value="Bus Fuel">स्कूल बस ईंधन (Bus Fuel)</option>
                          <option value="Repair">मरम्मत एवं रखरखाव (Repair)</option>
                          <option value="Books">स्टेशनरी एवं पुस्तकें (Books)</option>
                          <option value="Event">विद्यालय आयोजन खर्च (Event)</option>
                          <option value="Salary">कर्मचारी वेतन भुगतान (Salary)</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">राशि (Amount) *</label>
                      <input
                        type="number"
                        required
                        value={txAmount}
                        onChange={(e) => setTxAmount(e.target.value)}
                        className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl text-zinc-800 dark:text-white"
                        placeholder="उदा. 5000"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">दिनांक (Date)</label>
                      <input
                        type="date"
                        required
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl text-zinc-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">विवरण (Description) *</label>
                    <input
                      type="text"
                      required
                      value={txDesc}
                      onChange={(e) => setTxDesc(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl text-zinc-800 dark:text-white"
                      placeholder="संक्षिप्त विवरण दर्ज करें..."
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
                >
                  लेनदेन सहेजें (Save Record)
                </button>
              </form>

              {/* Transactions list */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
                  वित्तीय रोजनामचा बही (School Accounts Ledger)
                </h3>
                <div className="overflow-y-auto max-h-96 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-bold sticky top-0">
                      <tr>
                        <th className="p-3">ID / तिथि</th>
                        <th className="p-3">विवरण / श्रेणी</th>
                        <th className="p-3 text-right">राशि (Amount)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                      {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300">
                          <td className="p-3 font-mono">
                            <span className="font-bold text-zinc-900 dark:text-white block">{t.id}</span>
                            <span>{t.date}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-zinc-900 dark:text-white block">{t.description}</span>
                            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded text-zinc-500">{t.category}</span>
                          </td>
                          <td className={`p-3 text-right font-black ${t.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {t.type === 'Income' ? '+' : '-'} ₹{t.amount.toLocaleString('hi-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Fees Manager Tab */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            {/* Search Bar & Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="छात्र का नाम या कक्षा से खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 text-xs rounded-xl dark:text-white"
                />
              </div>
              <span className="text-xs font-bold text-zinc-500">
                कुल प्रदर्शित विद्यार्थी: {filteredStudents.length}
              </span>
            </div>

            {/* Fees Table */}
            <div className="overflow-y-auto max-h-96 border border-zinc-100 dark:border-zinc-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-bold">
                  <tr>
                    <th className="p-3">छात्र विवरण</th>
                    <th className="p-3">कक्षा</th>
                    <th className="p-3 text-right">कुल देय फीस</th>
                    <th className="p-3 text-right">जमा फीस</th>
                    <th className="p-3 text-right text-rose-500">लंबित देय (Dues)</th>
                    <th className="p-3 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {filteredStudents.slice(0, 20).map((s) => {
                    const dues = s.feeTotal - s.feePaid;
                    return (
                      <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300">
                        <td className="p-3">
                          <span className="font-bold text-zinc-900 dark:text-white block">{s.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{s.id}</span>
                        </td>
                        <td className="p-3 font-semibold text-indigo-500">{s.className}</td>
                        <td className="p-3 text-right font-semibold">₹{s.feeTotal.toLocaleString('hi-IN')}</td>
                        <td className="p-3 text-right font-semibold text-emerald-500">₹{s.feePaid.toLocaleString('hi-IN')}</td>
                        <td className="p-3 text-right font-black text-rose-500">₹{dues.toLocaleString('hi-IN')}</td>
                        <td className="p-3 text-center">
                          {dues > 0 ? (
                            <button
                              onClick={() => { setFeeStudentId(s.id); setFeeCollectAmount(dues.toString()); }}
                              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black rounded-lg cursor-pointer"
                            >
                              फीस जमा करें
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-500 font-black">पूर्ण चुकता (Paid)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Fees Collection Modal / Sub-form */}
            {feeStudentId && (
              <div className="p-5 border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-zinc-850 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-indigo-100 dark:border-indigo-800 pb-2">
                  <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-400">
                    फीस भुगतान प्रविष्टि रसीद - छात्र ID: {feeStudentId} ({students.find(s=>s.id===feeStudentId)?.name})
                  </h4>
                  <button onClick={() => setFeeStudentId(null)} className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleCollectFees} className="flex flex-col sm:flex-row items-end gap-4 text-xs font-bold">
                  <div className="flex-1">
                    <label className="block mb-1 text-zinc-500">भुगतान प्राप्त राशि (Collected Amount) *</label>
                    <input
                      type="number"
                      required
                      value={feeCollectAmount}
                      onChange={(e) => setFeeCollectAmount(e.target.value)}
                      className="w-full text-sm border border-indigo-300 dark:border-zinc-800 dark:bg-zinc-950 p-2 rounded-xl dark:text-white font-mono"
                      placeholder="उदा. 6000"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black cursor-pointer"
                  >
                    शुल्क जमा रसीद सहेजें
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 3. Salary Distribution Tab */}
        {activeTab === 'salaries' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
              अध्यापक वेतन भुगतान पत्रक (Teachers Monthly Salary sheet) - जुलाई २०२६
            </h3>
            <div className="overflow-y-auto max-h-96 border border-zinc-100 dark:border-zinc-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-bold">
                  <tr>
                    <th className="p-3">शिक्षक का नाम / ID</th>
                    <th className="p-3">विषय क्षेत्र</th>
                    <th className="p-3 text-right">निर्धारित वेतन</th>
                    <th className="p-3 text-center">भुगतान स्थिति Status</th>
                    <th className="p-3 text-center">वितरण कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {teachers.map((t) => {
                    const status = t.salaryStatus['July 2026'] || 'Pending';
                    return (
                      <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300">
                        <td className="p-3">
                          <span className="font-bold text-zinc-900 dark:text-white block">{t.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{t.id}</span>
                        </td>
                        <td className="p-3 font-semibold text-indigo-500">{t.subject}</td>
                        <td className="p-3 text-right font-bold">₹{t.salary.toLocaleString('hi-IN')}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 font-bold rounded-full text-[10px] ${
                            status === 'Paid'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {status === 'Paid' ? 'चुकाया गया (Paid)' : 'लंबित (Pending)'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {status !== 'Paid' ? (
                            <button
                              onClick={() => handlePaySalary(t.id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg cursor-pointer"
                            >
                              वेतन जारी करें (Dispatch)
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-500 font-black">भुगतान पूर्ण ✔</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Leave Approvals Tab */}
        {activeTab === 'leaves' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
              लंबित अवकाश आवेदन प्रभार (Leave Applications Inbox)
            </h3>
            <div className="space-y-3">
              {leaves.filter(l => l.status === 'Pending').length > 0 ? (
                leaves.filter(l => l.status === 'Pending').map((l) => (
                  <div key={l.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-850 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 font-bold rounded-md text-[9px] uppercase text-white ${
                          l.role === 'Teacher' ? 'bg-indigo-500' : 'bg-emerald-500'
                        }`}>
                          {l.role === 'Teacher' ? 'शिक्षक' : 'छात्र'}
                        </span>
                        <strong className="text-zinc-900 dark:text-white">{l.requesterName} (ID: {l.requesterId})</strong>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 font-semibold">अवधि: {l.startDate} से {l.endDate}</p>
                      <p className="text-zinc-800 dark:text-zinc-200"><strong>कारण:</strong> {l.reason}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleLeaveStatusUpdate(l.id, 'Approved')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> स्वीकृत करें
                      </button>
                      <button
                        onClick={() => handleLeaveStatusUpdate(l.id, 'Rejected')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> अस्वीकार
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-400 italic">अवकाश स्वीकृति हेतु कोई भी नया आवेदन लंबित नहीं है।</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
