import React, { useState } from 'react';
import { Student, Homework, BusRoute, TimetableSlot, LeaveRequest, AppState } from '../types';
import { FileText, Download, Share2, ClipboardList, BookOpen, MapPin, CalendarDays, Send, Check } from 'lucide-react';

interface StudentPanelProps {
  student: Student;
  homework: Homework[];
  busRoutes: BusRoute[];
  timetable: TimetableSlot[];
  leaves: LeaveRequest[];
  isResultsDeclared: boolean;
  onUpdateState: (updates: Partial<AppState>) => void;
  onAddNotification: (title: string, body: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
}

export default function StudentPanel({
  student,
  homework,
  busRoutes,
  timetable,
  leaves,
  isResultsDeclared,
  onUpdateState,
  onAddNotification
}: StudentPanelProps) {
  const [activeTab, setActiveTab] = useState<'homework' | 'attendance' | 'results' | 'timetable' | 'bus' | 'leave'>('homework');

  // Leave Form state
  const [startDate, setStartDate] = useState('2026-07-16');
  const [endDate, setEndDate] = useState('2026-07-17');
  const [reason, setReason] = useState('');

  // 1. Filter homework for student's class
  const classHomework = homework.filter(hw => hw.className === student.className);

  // 2. Attendance Stats
  const attDays = Object.entries(student.attendance);
  const totalDays = attDays.length;
  const presentDays = attDays.filter(([_, status]) => status === 'Present').length;
  const leaveDays = attDays.filter(([_, status]) => status === 'Leave').length;
  const absentDays = totalDays - presentDays - leaveDays;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // 3. Find assigned Bus Route
  const assignedBus = busRoutes.find(r => r.id === student.busRouteId);

  // 4. Class Timetable
  const classTimetable = timetable.filter(t => t.className === student.className).sort((a, b) => a.period - b.period);

  // 5. Submit Leave
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    const newRequest: LeaveRequest = {
      id: `SL-${Date.now()}`,
      requesterId: student.id,
      requesterName: student.name,
      role: 'Student',
      startDate,
      endDate,
      reason,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    onUpdateState({ leaves: [newRequest, ...leaves] });
    onAddNotification(
      'छात्र अवकाश प्रार्थना प्रेषित',
      'आपका अवकाश आवेदन कक्षा अध्यापक की स्वीकृति हेतु भेज दिया गया है।',
      'info'
    );
    setReason('');
  };

  // 6. Share / Download doc helpers (Simulations)
  const handleDownloadFile = (fileName: string) => {
    onAddNotification(
      'दस्तावेज़ डाउनलोड पूर्ण (Download Complete)',
      `फाइल "${fileName}" स्थानीय स्टोरेज में सफलतापूर्वक सुरक्षित कर दी गई है।`,
      'success'
    );
  };

  const handleShareDoc = (title: string, file: string) => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `स्कूल होमवर्क: ${title} (${file})`,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(`स्कूल होमवर्क: ${title} - फाइल: ${file}`);
      onAddNotification(
        'लिंक साझा किया गया (Shared Successfully)',
        `होमवर्क साझा करने हेतु लिंक क्लिपबोर्ड पर कॉपी कर लिया गया है।`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 🧭 Student Header Info */}
      <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md uppercase">विद्यार्थी प्रोफाइल (Student Profile)</span>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white mt-1">{student.name}</h2>
          <p className="text-xs text-zinc-500">पिता का नाम (Father Name): <strong className="text-zinc-700 dark:text-zinc-300">{student.fatherName}</strong></p>
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400 font-bold space-y-1">
          <div>कक्षा: <span className="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-indigo-500 rounded-md font-extrabold">{student.className}</span></div>
          <div>रोल नं: <span className="font-mono text-zinc-900 dark:text-white">{student.rollNo}</span> | ID: <span className="font-mono">{student.id}</span></div>
        </div>
      </div>

      {/* 🧭 Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('homework')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'homework' ? 'bg-indigo-500 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4" /> गृहकार्य (Homework)
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'attendance' ? 'bg-indigo-500 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> मेरी उपस्थिति (Attendance)
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'results' ? 'bg-indigo-500 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <FileText className="w-4 h-4" /> परीक्षा परिणाम (Report Card)
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'timetable' ? 'bg-indigo-500 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <CalendarDays className="w-4 h-4" /> समय सारणी (Timetable)
        </button>
        <button
          onClick={() => setActiveTab('bus')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'bus' ? 'bg-indigo-500 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <MapPin className="w-4 h-4" /> स्कूल बस (Bus Routing)
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'leave' ? 'bg-indigo-500 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Send className="w-4 h-4" /> छुट्टी आवेदन (Apply Leave)
        </button>
      </div>

      {/* 🎯 Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-xs transition-colors duration-200">
        
        {/* 1. Homework */}
        {activeTab === 'homework' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
              दैनिक गृहकार्य प्रविष्टियां (Your Class Assignments)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classHomework.length > 0 ? (
                classHomework.map((hw) => (
                  <div key={hw.id} className="p-5 border border-zinc-100 dark:border-zinc-800 rounded-2xl space-y-4 bg-zinc-50/50 dark:bg-zinc-850">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-indigo-500 bg-indigo-50 dark:bg-zinc-800 px-2 py-0.5 rounded-md uppercase">
                        {hw.subject}
                      </span>
                      <span className="text-zinc-400">अंतिम तिथि: {hw.dueDate}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white mb-1">{hw.title}</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{hw.description}</p>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-semibold border-t border-zinc-100 dark:border-zinc-800 pt-2 flex items-center justify-between">
                      <span>आवंटक: {hw.assignedBy}</span>
                      {hw.attachmentUrl && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadFile(hw.attachmentUrl!)}
                            className="p-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 rounded-lg text-indigo-500 cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShareDoc(hw.title, hw.attachmentUrl!)}
                            className="p-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 rounded-lg text-emerald-500 cursor-pointer"
                            title="Share to other apps"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center text-zinc-400 italic">आज की तारीख में कोई पेंडिंग गृहकार्य नहीं है।</div>
              )}
            </div>
          </div>
        )}

        {/* 2. Attendance Status */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
              विद्यार्थी उपस्थिति रिपोर्ट (Attendance Report card)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 rounded-xl text-center">
                <span className="block text-2xl font-black text-emerald-500">{attendanceRate}%</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">औसत उपस्थिति दर</span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-850 rounded-xl text-center">
                <span className="block text-xl font-bold text-zinc-800 dark:text-zinc-100">{presentDays} दिन</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">कुल उपस्थिति</span>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-center">
                <span className="block text-xl font-bold text-amber-500">{leaveDays} दिन</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">छुट्टी स्वीकृत (Leave)</span>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-center">
                <span className="block text-xl font-bold text-rose-500">{absentDays} दिन</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">अनुपस्थित (Absent)</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400">दैनिक इतिहास (Attendance Days Log)</h4>
              <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-bold">
                    <tr>
                      <th className="p-3">दिनांक (Date)</th>
                      <th className="p-3">दिन का विवरण</th>
                      <th className="p-3 text-center">स्थिति Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {attDays.reverse().map(([date, status]) => (
                      <tr key={date} className="text-zinc-700 dark:text-zinc-300">
                        <td className="p-3 font-mono font-semibold">{date}</td>
                        <td className="p-3 font-semibold">अध्यापन कार्य दिवस</td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 font-bold rounded-full text-[10px] ${
                            status === 'Present'
                              ? 'bg-emerald-500 text-white'
                              : status === 'Absent'
                                ? 'bg-rose-500 text-white'
                                : 'bg-amber-500 text-white'
                          }`}>
                            {status === 'Present' ? '✔ Present' : status === 'Absent' ? '❌ Absent' : '✉ Leave'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. Report Card Results */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-50 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide">
                अंकतालिका एवं प्रगति विवरण (Progress Report Card)
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full text-white ${
                isResultsDeclared ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                {isResultsDeclared ? 'परिणाम घोषित (Results Declared)' : 'परिणाम प्रगति पर है'}
              </span>
            </div>

            <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-bold">
                  <tr>
                    <th className="p-3">विषय (Subject)</th>
                    <th className="p-3 text-center">अर्धवार्षिक (Half Yearly)</th>
                    <th className="p-3 text-center">वार्षिक परीक्षा (Annual)</th>
                    <th className="p-3 text-center">कुल प्राप्तांक (Total)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {Object.entries(student.marks).map(([subject, marks]) => {
                    const total = (marks.halfYearly || 0) + (isResultsDeclared && marks.annual !== null ? marks.annual : 0);
                    return (
                      <tr key={subject} className="text-zinc-700 dark:text-zinc-300">
                        <td className="p-3 font-bold text-zinc-900 dark:text-white">{subject}</td>
                        <td className="p-3 text-center font-semibold text-zinc-600 dark:text-zinc-400">{marks.halfYearly ?? 'N/A'} / 100</td>
                        <td className="p-3 text-center font-semibold text-zinc-600 dark:text-zinc-400">
                          {isResultsDeclared ? `${marks.annual ?? 'N/A'} / 100` : <span className="text-zinc-300 italic">लंबित</span>}
                        </td>
                        <td className="p-3 text-center font-bold text-indigo-500">
                          {isResultsDeclared ? `${total} / 200` : `${marks.halfYearly ?? 'N/A'} / 100`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {isResultsDeclared && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span>समग्र उत्तीर्णता स्थिति: उत्तीर्ण (Passed)</span>
                <span>प्रतिशत: {Math.round(Object.values(student.marks).reduce((sum, m) => sum + (m.halfYearly || 0) + (m.annual || 0), 0) / 12)}%</span>
              </div>
            )}
          </div>
        )}

        {/* 4. Timetable */}
        {activeTab === 'timetable' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
              आपकी दैनिक समय सारणी (My Daily Class Schedule)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {classTimetable.map((slot) => (
                <div key={slot.period} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl text-center bg-zinc-50/50 dark:bg-zinc-850 space-y-1">
                  <span className="block text-[10px] font-black text-indigo-500 uppercase">कालांश {slot.period}</span>
                  <span className="block text-xs font-bold text-zinc-900 dark:text-white">{slot.subject}</span>
                  <span className="block text-[10px] text-zinc-400">{slot.teacherName.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Bus Routing */}
        {activeTab === 'bus' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
              बस परिवहन विवरण (School Bus Transport)
            </h3>
            {assignedBus ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-850 space-y-4">
                  <div>
                    <span className="inline-block text-[10px] bg-indigo-500 text-white font-black px-2 py-0.5 rounded-md mb-1">{assignedBus.id}</span>
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white">{assignedBus.routeName}</h4>
                    <p className="text-zinc-400">बस नंबर: {assignedBus.busNo}</p>
                  </div>
                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">ड्राइवर का नाम</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">{assignedBus.driverName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">फ़ोन नंबर</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">{assignedBus.driverPhone}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50/50 dark:bg-zinc-800/40 rounded-xl text-indigo-700 dark:text-indigo-300 font-bold flex justify-between">
                    <span>आपका बोर्डिंग स्टॉप:</span>
                    <span>📍 {student.busStop}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400">बस मार्ग ठहराव क्रम (Bus Route Stops sequence)</h4>
                  <div className="space-y-1.5 pl-4 border-l border-indigo-500 relative">
                    {assignedBus.stops.map((stop, sIdx) => (
                      <div key={sIdx} className="relative py-1 flex items-center justify-between">
                        <span className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-900"></span>
                        <span className={`font-semibold ${stop === student.busStop ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-zinc-600 dark:text-zinc-400'}`}>
                          📍 {stop}
                        </span>
                        {stop === student.busStop && (
                          <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-md">आपका स्टॉप</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-400 italic">आप स्कूल की बस सेवा का उपयोग नहीं कर रहे हैं (No Transport Assigned).</div>
            )}
          </div>
        )}

        {/* 6. Request Leave */}
        {activeTab === 'leave' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
                अवकाश प्रार्थना पत्र (Student Leave Application Form)
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">प्रारंभ तिथि</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">अंत तिथि</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">अवकाश का कारण (Reason for leave request) *</label>
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    rows={4}
                    placeholder="बीमार होने या आवश्यक कार्य के बारे में संक्षेप में लिखें..."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" /> छुट्टी आवेदन जमा करें (Submit Application)
              </button>
            </form>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
                आपके अवकाश आवेदनों की स्थिति (Leave History status)
              </h3>
              <div className="space-y-3">
                {leaves.filter(l => l.requesterId === student.id).length > 0 ? (
                  leaves.filter(l => l.requesterId === student.id).map((l) => (
                    <div key={l.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-2 text-xs bg-zinc-50/50 dark:bg-zinc-850">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">अवधि: {l.startDate} से {l.endDate}</span>
                        <span className={`px-2.5 py-0.5 font-bold rounded-full text-[9px] ${
                          l.status === 'Approved'
                            ? 'bg-emerald-500 text-white'
                            : l.status === 'Rejected'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-500 text-white'
                        }`}>
                          {l.status === 'Approved' ? 'स्वीकृत' : l.status === 'Rejected' ? 'अस्वीकृत' : 'लंबित (Pending)'}
                        </span>
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200 font-medium">कारण: {l.reason}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic">कोई पूर्व आवेदन उपलब्ध नहीं है।</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
