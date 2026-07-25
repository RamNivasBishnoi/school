import React, { useState } from 'react';
import { Student, Teacher, Homework, LeaveRequest, AppState } from '../types';
import { Check, ClipboardList, PenTool, BookOpen, Send, Calendar, AlertCircle } from 'lucide-react';

interface TeacherPanelProps {
  teacher: Teacher;
  students: Student[];
  homework: Homework[];
  leaves: LeaveRequest[];
  onUpdateState: (updates: Partial<AppState>) => void;
  onAddNotification: (title: string, body: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
}

export default function TeacherPanel({
  teacher,
  students,
  homework,
  leaves,
  onUpdateState,
  onAddNotification
}: TeacherPanelProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks' | 'homework' | 'leave'>('attendance');

  // Attendance states
  const [attClass, setAttClass] = useState('10A');
  const [attDate, setAttDate] = useState('2026-07-15');
  const [attData, setAttData] = useState<{ [studentId: string]: 'Present' | 'Absent' | 'Leave' }>({});

  // Marks states
  const [marksClass, setMarksClass] = useState('10A');
  const [marksExamType, setMarksExamType] = useState<'halfYearly' | 'annual'>('annual');
  const [marksData, setMarksData] = useState<{ [studentId: string]: number }>({});

  // Homework states
  const [hwClass, setHwClass] = useState('10A');
  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwDueDate, setHwDueDate] = useState('2026-07-18');
  const [hwFile, setHwFile] = useState('maths_practice_sheet.pdf');

  // Leave State
  const [leaveStart, setLeaveStart] = useState('2026-07-20');
  const [leaveEnd, setLeaveEnd] = useState('2026-07-21');
  const [leaveReason, setLeaveReason] = useState('');

  // Filtering students based on chosen class
  const filteredStudentsForAttendance = students.filter(s => s.className === attClass);
  const filteredStudentsForMarks = students.filter(s => s.className === marksClass);

  // Initialize/Load Attendance helper
  const handleLoadAttendanceForm = () => {
    const initial: typeof attData = {};
    filteredStudentsForAttendance.forEach(s => {
      initial[s.id] = s.attendance[attDate] || 'Present';
    });
    setAttData(initial);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedStudents = students.map(s => {
      if (s.className === attClass && attData[s.id]) {
        return {
          ...s,
          attendance: {
            ...s.attendance,
            [attDate]: attData[s.id],
          },
        };
      }
      return s;
    });

    onUpdateState({ students: updatedStudents });
    onAddNotification(
      'उपस्थिति दर्ज (Attendance Recorded)',
      `कक्षा ${attClass} हेतु दिनांक ${attDate} की उपस्थिति सफलतापूर्वक सहेजी गई।`,
      'success'
    );
  };

  // Initialize/Load Marks Helper
  const handleLoadMarksForm = () => {
    const initial: typeof marksData = {};
    filteredStudentsForMarks.forEach(s => {
      initial[s.id] = s.marks[teacher.subject]?.[marksExamType] ?? 0;
    });
    setMarksData(initial);
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedStudents = students.map(s => {
      if (s.className === marksClass && marksData[s.id] !== undefined) {
        const prevMarks = s.marks[teacher.subject] || { halfYearly: null, annual: null };
        return {
          ...s,
          marks: {
            ...s.marks,
            [teacher.subject]: {
              ...prevMarks,
              [marksExamType]: Number(marksData[s.id]),
            },
          },
        };
      }
      return s;
    });

    onUpdateState({ students: updatedStudents });
    onAddNotification(
      'परीक्षा अंक सहेजे गए',
      `कक्षा ${marksClass} के विद्यार्थियों के विषय ${teacher.subject} के ${marksExamType === 'halfYearly' ? 'अर्धवार्षिक' : 'वार्षिक'} अंक सहेज दिए गए हैं।`,
      'success'
    );
  };

  // Add Homework
  const handlePostHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle || !hwDesc) return;

    const newHw: Homework = {
      id: `H${homework.length + 1}`,
      className: hwClass,
      subject: teacher.subject,
      title: hwTitle,
      description: hwDesc,
      dueDate: hwDueDate,
      assignedBy: teacher.name,
      attachmentUrl: hwFile || undefined,
      submissions: [],
    };

    onUpdateState({ homework: [newHw, ...homework] });
    onAddNotification(
      'नया गृहकार्य प्रेषित (Homework Assigned)',
      `कक्षा ${hwClass} को विषय ${teacher.subject} का नया गृहकार्य दिया गया। अंतिम तिथि: ${hwDueDate}`,
      'info'
    );

    setHwTitle('');
    setHwDesc('');
  };

  // Submit Teacher Leave Request
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) return;

    const newRequest: LeaveRequest = {
      id: `L-${Date.now()}`,
      requesterId: teacher.id,
      requesterName: teacher.name,
      role: 'Teacher',
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    onUpdateState({ leaves: [newRequest, ...leaves] });
    onAddNotification(
      'अवकाश प्रार्थना पत्र प्रेषित',
      'आपका अवकाश आवेदन स्वीकृति हेतु एडमिन/मैनेजर को प्रेषित कर दिया गया है।',
      'info'
    );
    setLeaveReason('');
  };

  const teacherLeaves = leaves.filter(l => l.requesterId === teacher.id);

  return (
    <div className="space-y-6">
      {/* 🧭 Header Profile */}
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-md uppercase">शिक्षक प्रोफाइल</span>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-1">{teacher.name}</h2>
          <p className="text-xs text-zinc-500">मुख्य अध्यापन विषय (Core Subject): <strong className="text-indigo-600 dark:text-indigo-400">{teacher.subject}</strong></p>
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          <span>कक्षा अध्यापक: </span>
          <strong className="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md">
            {teacher.classNameAssigned !== 'None' ? `कक्षा ${teacher.classNameAssigned}` : 'कोई प्रभार नहीं'}
          </strong>
        </div>
      </div>

      {/* 🧭 Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'attendance'
              ? 'bg-indigo-500 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> उपस्थिति रजिस्टर (Attendance)
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'marks'
              ? 'bg-indigo-500 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <PenTool className="w-4 h-4" /> परीक्षा अंक प्रविष्टि (Exam Marks)
        </button>
        <button
          onClick={() => setActiveTab('homework')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'homework'
              ? 'bg-indigo-500 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4" /> गृहकार्य आवंटित करें (Homework)
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'leave'
              ? 'bg-indigo-500 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Calendar className="w-4 h-4" /> अवकाश आवेदन (Apply Leave)
        </button>
      </div>

      {/* 🎯 Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-xs transition-colors duration-200">
        
        {/* 1. Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Filters bar */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-850 rounded-2xl flex flex-wrap items-center gap-4 text-xs font-bold">
              <div>
                <span className="block text-[10px] text-zinc-400 mb-1">कक्षा (Select Class)</span>
                <select
                  value={attClass}
                  onChange={(e) => setAttClass(e.target.value)}
                  className="border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2 rounded-xl dark:text-white"
                >
                  <option value="6A">कक्षा 6A</option>
                  <option value="7A">कक्षा 7A</option>
                  <option value="8A">कक्षा 8A</option>
                  <option value="9A">कक्षा 9A</option>
                  <option value="10A">कक्षा 10A</option>
                </select>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-400 mb-1">दिनांक (Select Date)</span>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-1.5 rounded-xl dark:text-white"
                />
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleLoadAttendanceForm}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl cursor-pointer"
                >
                  उपस्थिति फॉर्म लोड करें (Load Register)
                </button>
              </div>
            </div>

            {/* Attendance Form */}
            {Object.keys(attData).length > 0 ? (
              <form onSubmit={handleSaveAttendance} className="space-y-4">
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-bold">
                      <tr>
                        <th className="p-3">रोल नं</th>
                        <th className="p-3">छात्र का नाम</th>
                        <th className="p-3 text-center">उपस्थिति (Mark Status)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                      {filteredStudentsForAttendance.map((s) => (
                        <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300">
                          <td className="p-3 font-mono font-bold">{s.rollNo}</td>
                          <td className="p-3">
                            <span className="font-bold text-zinc-950 dark:text-white block">{s.name}</span>
                            <span className="text-[10px] text-zinc-400">ID: {s.id}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center gap-3">
                              {(['Present', 'Absent', 'Leave'] as const).map((status) => (
                                <button
                                  type="button"
                                  key={status}
                                  onClick={() => setAttData({ ...attData, [s.id]: status })}
                                  className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-150 cursor-pointer text-[11px] ${
                                    attData[s.id] === status
                                      ? status === 'Present'
                                        ? 'bg-emerald-500 text-white'
                                        : status === 'Absent'
                                          ? 'bg-rose-500 text-white'
                                          : 'bg-amber-500 text-white'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'
                                  }`}
                                >
                                  {status === 'Present' ? '✔ उपस्थित' : status === 'Absent' ? '❌ अनुपस्थित' : '✉ अवकाश'}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> उपस्थिति रजिस्टर सहेजें (Save Attendance)
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <AlertCircle className="w-8 h-8 mx-auto text-indigo-400 mb-2" />
                अटेंडेंस शुरू करने के लिए ऊपर से कक्षा चुनकर "उपस्थिति फॉर्म लोड करें" पर क्लिक करें।
              </div>
            )}
          </div>
        )}

        {/* 2. Marks Entry Tab */}
        {activeTab === 'marks' && (
          <div className="space-y-6">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-850 rounded-2xl flex flex-wrap items-center gap-4 text-xs font-bold">
              <div>
                <span className="block text-[10px] text-zinc-400 mb-1">कक्षा (Select Class)</span>
                <select
                  value={marksClass}
                  onChange={(e) => setMarksClass(e.target.value)}
                  className="border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2 rounded-xl dark:text-white"
                >
                  <option value="6A">कक्षा 6A</option>
                  <option value="7A">कक्षा 7A</option>
                  <option value="8A">कक्षा 8A</option>
                  <option value="9A">कक्षा 9A</option>
                  <option value="10A">कक्षा 10A</option>
                </select>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-400 mb-1">परीक्षा (Exam Type)</span>
                <select
                  value={marksExamType}
                  onChange={(e) => setMarksExamType(e.target.value as any)}
                  className="border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2 rounded-xl dark:text-white"
                >
                  <option value="halfYearly">अर्धवार्षिक परीक्षा (Half-Yearly)</option>
                  <option value="annual">वार्षिक परीक्षा (Annual Exam)</option>
                </select>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleLoadMarksForm}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl cursor-pointer"
                >
                  अंक प्रविष्टि फॉर्म लोड करें (Load Entry Sheet)
                </button>
              </div>
            </div>

            {Object.keys(marksData).length > 0 ? (
              <form onSubmit={handleSaveMarks} className="space-y-4">
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-bold">
                      <tr>
                        <th className="p-3">रोल नं</th>
                        <th className="p-3">छात्र का नाम</th>
                        <th className="p-3">विषय</th>
                        <th className="p-3 text-center">अंक (Marks out of 100)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                      {filteredStudentsForMarks.map((s) => (
                        <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300">
                          <td className="p-3 font-mono font-bold">{s.rollNo}</td>
                          <td className="p-3">
                            <span className="font-bold text-zinc-950 dark:text-white block">{s.name}</span>
                            <span className="text-[10px] text-zinc-400">ID: {s.id}</span>
                          </td>
                          <td className="p-3 font-bold text-indigo-500">{teacher.subject}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={marksData[s.id] ?? 0}
                              onChange={(e) => setMarksData({ ...marksData, [s.id]: Number(e.target.value) })}
                              className="w-20 text-center font-bold border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2 rounded-xl dark:text-white"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> अंक तालिका सहेजें (Save Marks Sheet)
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <AlertCircle className="w-8 h-8 mx-auto text-indigo-400 mb-2" />
                अंक प्रविष्टि प्रारंभ करने के लिए ऊपर से कक्षा चुनकर "अंक प्रविष्टि फॉर्म लोड करें" पर क्लिक करें।
              </div>
            )}
          </div>
        )}

        {/* 3. Homework Assignment */}
        {activeTab === 'homework' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handlePostHomework} className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
                नया गृहकार्य प्रेषित करें (Assign Homework)
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">कक्षा (Class)</label>
                    <select
                      value={hwClass}
                      onChange={(e) => setHwClass(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    >
                      <option value="6A">कक्षा 6A</option>
                      <option value="7A">कक्षा 7A</option>
                      <option value="8A">कक्षा 8A</option>
                      <option value="9A">कक्षा 9A</option>
                      <option value="10A">कक्षा 10A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">अंतिम तिथि (Due Date)</label>
                    <input
                      type="date"
                      required
                      value={hwDueDate}
                      onChange={(e) => setHwDueDate(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">विषय (Subject)</label>
                  <input
                    type="text"
                    disabled
                    value={teacher.subject}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded-xl text-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">गृहकार्य शीर्षक (Homework Title) *</label>
                  <input
                    type="text"
                    required
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    placeholder="उदा. समांतर श्रेढ़ी प्रश्नावली 5.2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">कार्य का विवरण (Description/Instructions) *</label>
                  <textarea
                    required
                    value={hwDesc}
                    onChange={(e) => setHwDesc(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    rows={3}
                    placeholder="विस्तृत निर्देश लिखें..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">दस्तावेज़/PDF संलग्नीकरण (PDF/Image file)</label>
                  <input
                    type="text"
                    value={hwFile}
                    onChange={(e) => setHwFile(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    placeholder="उदा. assignments_sheet_class10.pdf"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" /> गृहकार्य जारी करें (Publish Homework)
              </button>
            </form>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
                आपके द्वारा आवंटित गृहकार्य (Your Posted Assignments)
              </h3>
              <div className="space-y-3 overflow-y-auto max-h-96">
                {homework.filter(hw => hw.assignedBy === teacher.name).map((hw) => (
                  <div key={hw.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-850/50 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-500 text-[10px] uppercase">{hw.className} | {hw.subject}</span>
                      <span className="text-zinc-400">अंतिम तिथि: {hw.dueDate}</span>
                    </div>
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white">{hw.title}</h4>
                    <p className="text-zinc-600 dark:text-zinc-400">{hw.description}</p>
                    {hw.attachmentUrl && (
                      <div className="inline-flex items-center gap-1 bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500 font-mono">
                        📎 {hw.attachmentUrl}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Apply Leave Tab */}
        {activeTab === 'leave' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
                अवकाश प्रार्थना पत्र (Leave Application)
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">प्रारंभ तिथि (Start Date)</label>
                    <input
                      type="date"
                      required
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">अंत तिथि (End Date)</label>
                    <input
                      type="date"
                      required
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">अवकाश का कारण (Reason for Leave) *</label>
                  <textarea
                    required
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    rows={4}
                    placeholder="अवकाश का उचित कारण लिखें..."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" /> आवेदन भेजें (Apply Now)
              </button>
            </form>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
                आपके अवकाश इतिहास की स्थिति (Your Leave Request History)
              </h3>
              <div className="space-y-3">
                {teacherLeaves.length > 0 ? (
                  teacherLeaves.map((l) => (
                    <div key={l.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-2 text-xs bg-zinc-50/50 dark:bg-zinc-850/50">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">अवधि: {l.startDate} से {l.endDate}</span>
                        <span className={`px-2.5 py-0.5 font-bold rounded-full text-[9px] ${
                          l.status === 'Approved'
                            ? 'bg-emerald-500 text-white'
                            : l.status === 'Rejected'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-500 text-white'
                        }`}>
                          {l.status === 'Approved' ? 'स्वीकृत (Approved)' : l.status === 'Rejected' ? 'अस्वीकृत' : 'लंबित (Pending)'}
                        </span>
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200 font-medium">कारण: {l.reason}</p>
                      <span className="block text-[10px] text-zinc-400">आवेदन तिथि: {l.appliedDate}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic">कोई अवकाश का इतिहास उपलब्ध नहीं है।</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
