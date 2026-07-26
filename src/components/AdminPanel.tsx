import React, { useState } from 'react';
import { Student, Teacher, BusRoute, TimetableSlot, AppState, UserAccount } from '../types';
import { Plus, Trash, Shield, Users, MapPin, CalendarDays, KeyRound, Check, RefreshCw, Sparkles, UserCheck, GraduationCap, Briefcase, FileCheck2, LogIn } from 'lucide-react';

interface AdminPanelProps {
  students: Student[];
  teachers: Teacher[];
  busRoutes: BusRoute[];
  timetable: TimetableSlot[];
  onUpdateState: (updates: Partial<AppState>) => void;
  onAddNotification: (title: string, body: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
  onSwitchUser?: (user: UserAccount) => void;
}

export default function AdminPanel({
  students,
  teachers,
  busRoutes,
  timetable,
  onUpdateState,
  onAddNotification,
  onSwitchUser
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'routes' | 'timetable' | 'users' | 'demo'>('students');

  // Form States
  const [newStudent, setNewStudent] = useState({ name: '', fatherName: '', className: '6A', rollNo: '', busRouteId: 'None', busStop: 'None' });
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', subject: 'Mathematics', classNameAssigned: 'None', salary: 30000 });
  const [newRoute, setNewRoute] = useState({ id: '', routeName: '', busNo: '', driverName: '', driverPhone: '', stops: '' });
  const [newSlot, setNewSlot] = useState({ className: '6A', period: 1, subject: 'Mathematics', teacherId: '' });

  // Users Management State (Admin can view and toggle activation of accounts)
  const [users, setUsers] = useState<UserAccount[]>([
    { id: 'U1', name: 'Admin Principal', email: 'principal@school.com', role: 'Admin', isActive: true },
    { id: 'U2', name: 'सुरेश कुमार (Suresh Kumar)', email: 'suresh@school.com', role: 'Teacher', associatedId: 'T100', isActive: true },
    { id: 'U3', name: 'महेंद्र सिंह (Manager)', email: 'manager@school.com', role: 'Manager', isActive: true },
    { id: 'U4', name: 'कैलाश चंद (Exam In-charge)', email: 'exam@school.com', role: 'Exam In-charge', isActive: true },
    { id: 'U5', name: 'आरव सिंह (Student)', email: 'aarav@school.com', role: 'Student', associatedId: 'S1001', isActive: true },
  ]);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Teacher' as any, associatedId: '' });

  // 1. Add Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.rollNo) return;
    
    const studentId = `S${1000 + students.length + 1}`;
    const addedStudent: Student = {
      id: studentId,
      name: newStudent.name,
      fatherName: newStudent.fatherName || 'पिता का नाम',
      className: newStudent.className,
      rollNo: newStudent.rollNo.padStart(2, '0'),
      busRouteId: newStudent.busRouteId,
      busStop: newStudent.busRouteId !== 'None' ? newStudent.busStop : 'None',
      feeTotal: 24000,
      feePaid: 0,
      attendance: {},
      marks: {
        'Mathematics': { halfYearly: null, annual: null },
        'Science': { halfYearly: null, annual: null },
        'English': { halfYearly: null, annual: null },
        'Hindi': { halfYearly: null, annual: null },
        'Social Science': { halfYearly: null, annual: null },
        'Computer Science': { halfYearly: null, annual: null },
      },
      leaves: [],
    };

    onUpdateState({ students: [addedStudent, ...students] });
    onAddNotification('नया छात्र पंजीकृत (Student Registered)', `छात्र ${newStudent.name} को कक्षा ${newStudent.className} में पंजीकृत कर दिया गया है। ID: ${studentId}`, 'success');
    setNewStudent({ name: '', fatherName: '', className: '6A', rollNo: '', busRouteId: 'None', busStop: 'None' });
  };

  // 2. Add Teacher
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.email) return;

    const teacherId = `T${100 + teachers.length}`;
    const addedTeacher: Teacher = {
      id: teacherId,
      name: newTeacher.name,
      email: newTeacher.email,
      subject: newTeacher.subject,
      classNameAssigned: newTeacher.classNameAssigned,
      salary: Number(newTeacher.salary),
      salaryStatus: {},
      attendance: {},
      leaves: [],
    };

    onUpdateState({ teachers: [...teachers, addedTeacher] });
    onAddNotification('नया शिक्षक पंजीकृत (Teacher Registered)', `शिक्षक ${newTeacher.name} को ${newTeacher.subject} विषय हेतु पंजीकृत किया गया। ID: ${teacherId}`, 'success');
    setNewTeacher({ name: '', email: '', subject: 'Mathematics', classNameAssigned: 'None', salary: 30000 });
  };

  // 3. Add Bus Route
  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.id || !newRoute.routeName) return;

    const stopsArray = newRoute.stops.split(',').map(s => s.trim()).filter(Boolean);
    const addedRoute: BusRoute = {
      id: newRoute.id,
      routeName: newRoute.routeName,
      busNo: newRoute.busNo,
      driverName: newRoute.driverName,
      driverPhone: newRoute.driverPhone,
      stops: stopsArray,
    };

    onUpdateState({ busRoutes: [...busRoutes, addedRoute] });
    onAddNotification('नया बस मार्ग निर्मित', `बस मार्ग ${newRoute.routeName} (बस नंबर ${newRoute.busNo}) सफलतापूर्वक जोड़ा गया।`, 'success');
    setNewRoute({ id: '', routeName: '', busNo: '', driverName: '', driverPhone: '', stops: '' });
  };

  // 4. Update Timetable Slot
  const handleAddTimetableSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.teacherId) return;

    const t = teachers.find(teach => teach.id === newSlot.teacherId);
    if (!t) return;

    // Check if slot already exists, overwrite if yes, otherwise append
    const updatedTimetable = timetable.filter(
      slot => !(slot.className === newSlot.className && slot.period === Number(newSlot.period))
    );

    const addedSlot: TimetableSlot = {
      id: `TT-${newSlot.className}-P${newSlot.period}`,
      className: newSlot.className,
      period: Number(newSlot.period),
      subject: newSlot.subject,
      teacherId: newSlot.teacherId,
      teacherName: t.name,
    };

    onUpdateState({ timetable: [...updatedTimetable, addedSlot] });
    onAddNotification('टाइम टेबल अपडेटेड', `कक्षा ${newSlot.className} में कालांश ${newSlot.period} हेतु ${newSlot.subject} विषय के शिक्षक ${t.name} को नियुक्त किया गया।`, 'info');
  };

  // 5. Add User Account
  const handleAddUserAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const u: UserAccount = {
      id: `U${users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      associatedId: newUser.associatedId || undefined,
      isActive: true,
    };

    setUsers([...users, u]);
    onAddNotification('नया यूजर खाता सक्रिय (User Activated)', `यूज़र ${newUser.name} को ${newUser.role} रोल के साथ जोड़ा गया है।`, 'success');
    setNewUser({ name: '', email: '', role: 'Teacher', associatedId: '' });
  };

  return (
    <div className="space-y-6">
      {/* 🧭 Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'students'
              ? 'bg-indigo-500 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Users className="w-4 h-4" /> छात्र जोड़ें (Students)
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'teachers'
              ? 'bg-indigo-500 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Shield className="w-4 h-4" /> शिक्षक जोड़ें (Teachers)
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'routes'
              ? 'bg-indigo-500 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <MapPin className="w-4 h-4" /> बस रूट प्रबंधन (Bus)
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'timetable'
              ? 'bg-indigo-500 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <CalendarDays className="w-4 h-4" /> कालांश सेट करें (Timetable)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'users'
              ? 'bg-indigo-500 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <KeyRound className="w-4 h-4" /> यूजर एक्सेस (Access Control)
        </button>
        <button
          onClick={() => setActiveTab('demo')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'demo'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> ⚡ डेमो एक्सप्लोरर (Demo Mode)
        </button>
      </div>

      {/* 🎯 Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-xs transition-colors duration-200">
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <form onSubmit={handleAddStudent} className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> नया छात्र पंजीकृत करें
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">विद्यार्थी का नाम (Student Name) *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl outline-hidden focus:border-indigo-500 dark:text-white"
                    placeholder="उदा. राहुल शर्मा"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">पिता का नाम (Father Name)</label>
                  <input
                    type="text"
                    value={newStudent.fatherName}
                    onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl outline-hidden focus:border-indigo-500 dark:text-white"
                    placeholder="उदा. राजेश शर्मा"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">कक्षा (Class)</label>
                    <select
                      value={newStudent.className}
                      onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}
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
                    <label className="block text-xs font-bold text-zinc-500 mb-1">रोल नंबर (Roll No) *</label>
                    <input
                      type="number"
                      required
                      value={newStudent.rollNo}
                      onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                      placeholder="उदा. 45"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">बस मार्ग (Bus Route)</label>
                  <select
                    value={newStudent.busRouteId}
                    onChange={(e) => {
                      const rId = e.target.value;
                      const matched = busRoutes.find(r => r.id === rId);
                      setNewStudent({
                        ...newStudent,
                        busRouteId: rId,
                        busStop: matched ? matched.stops[0] : 'None'
                      });
                    }}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                  >
                    <option value="None">कोई परिवहन नहीं (No Transport)</option>
                    {busRoutes.map(r => (
                      <option key={r.id} value={r.id}>{r.routeName}</option>
                    ))}
                  </select>
                </div>
                {newStudent.busRouteId !== 'None' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">बस स्टॉप (Bus Stop)</label>
                    <select
                      value={newStudent.busStop}
                      onChange={(e) => setNewStudent({ ...newStudent, busStop: e.target.value })}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    >
                      {busRoutes.find(r => r.id === newStudent.busRouteId)?.stops.map(stop => (
                        <option key={stop} value={stop}>{stop}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> छात्र जोड़ें (Save Student)
              </button>
            </form>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-50 dark:border-zinc-800 pb-2">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide">
                  हाल ही में जोड़े गए विद्यार्थी (Recent Students Log)
                </h3>
                <span className="text-xs bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-full">
                  कुल {students.length} छात्र
                </span>
              </div>
              <div className="overflow-y-auto max-h-96 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-semibold sticky top-0">
                    <tr>
                      <th className="p-3">ID / रोल</th>
                      <th className="p-3">नाम / पिता का नाम</th>
                      <th className="p-3">कक्षा</th>
                      <th className="p-3">बस रूट / स्टॉप</th>
                      <th className="p-3 text-center">हटाएं</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {students.slice(0, 10).map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300">
                        <td className="p-3 font-mono">
                          <span className="font-bold text-zinc-900 dark:text-white block">{s.id}</span>
                          <span>रोल नं: {s.rollNo}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-zinc-900 dark:text-white block">{s.name}</span>
                          <span className="text-zinc-400">पिता: {s.fatherName}</span>
                        </td>
                        <td className="p-3 font-semibold text-indigo-500">{s.className}</td>
                        <td className="p-3">
                          <span className="block">{s.busRouteId !== 'None' ? s.busRouteId : 'स्वयं'}</span>
                          <span className="text-[10px] text-zinc-400">{s.busStop}</span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              onUpdateState({ students: students.filter(st => st.id !== s.id) });
                              onAddNotification('विद्यार्थी हटाया गया', `छात्र ${s.name} का रिकॉर्ड हटा दिया गया।`, 'warning');
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> नया शिक्षक जोड़ें
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">शिक्षक का नाम (Teacher Name) *</label>
                  <input
                    type="text"
                    required
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    placeholder="उदा. सुरेश शर्मा"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">ईमेल (Email) *</label>
                  <input
                    type="email"
                    required
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    placeholder="उदा. suresh@school.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">अध्यापन विषय (Subject)</label>
                  <select
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">कक्षा अध्यापक प्रभार (Class Teacher of)</label>
                  <select
                    value={newTeacher.classNameAssigned}
                    onChange={(e) => setNewTeacher({ ...newTeacher, classNameAssigned: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                  >
                    <option value="None">कोई प्रभार नहीं (None)</option>
                    <option value="6A">कक्षा 6A</option>
                    <option value="7A">कक्षा 7A</option>
                    <option value="8A">कक्षा 8A</option>
                    <option value="9A">कक्षा 9A</option>
                    <option value="10A">कक्षा 10A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">मासिक वेतन (Monthly Salary) *</label>
                  <input
                    type="number"
                    required
                    value={newTeacher.salary}
                    onChange={(e) => setNewTeacher({ ...newTeacher, salary: Number(e.target.value) })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    placeholder="उदा. 45000"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> शिक्षक सहेजें (Save Teacher)
              </button>
            </form>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-50 dark:border-zinc-800 pb-2">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide">
                  शिक्षक रजिस्टर (Teachers Directory)
                </h3>
                <span className="text-xs bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-full">
                  कुल {teachers.length} शिक्षक
                </span>
              </div>
              <div className="overflow-y-auto max-h-96 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-semibold sticky top-0">
                    <tr>
                      <th className="p-3">ID / नाम</th>
                      <th className="p-3">विषय प्रभार</th>
                      <th className="p-3">कक्षा प्रभार</th>
                      <th className="p-3">वेतन विवरण</th>
                      <th className="p-3 text-center">हटाएं</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {teachers.map((t) => (
                      <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300">
                        <td className="p-3">
                          <span className="font-bold text-zinc-900 dark:text-white block">{t.name}</span>
                          <span className="text-zinc-400 font-mono">{t.id} / {t.email}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full font-bold">
                            {t.subject}
                          </span>
                        </td>
                        <td className="p-3 font-semibold">{t.classNameAssigned !== 'None' ? `कक्षा ${t.classNameAssigned}` : 'प्रभार नहीं'}</td>
                        <td className="p-3 font-semibold text-zinc-950 dark:text-zinc-100">₹{t.salary.toLocaleString('hi-IN')} / माह</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              onUpdateState({ teachers: teachers.filter(tc => tc.id !== t.id) });
                              onAddNotification('शिक्षक का विवरण हटाया गया', `शिक्षक ${t.name} का रिकॉर्ड डिलीट किया गया।`, 'warning');
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleAddRoute} className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> नया बस मार्ग जोड़ें
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">मार्ग कोड (Route ID) *</label>
                  <input
                    type="text"
                    required
                    value={newRoute.id}
                    onChange={(e) => setNewRoute({ ...newRoute, id: e.target.value.toUpperCase() })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    placeholder="उदा. R5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">मार्ग का नाम (Route Name) *</label>
                  <input
                    type="text"
                    required
                    value={newRoute.routeName}
                    onChange={(e) => setNewRoute({ ...newRoute, routeName: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    placeholder="उदा. मार्ग E: सांगानेर चौराहा"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">बस नंबर (Bus No)</label>
                    <input
                      type="text"
                      value={newRoute.busNo}
                      onChange={(e) => setNewRoute({ ...newRoute, busNo: e.target.value })}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                      placeholder="उदा. RJ-14-1100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">चालक का नाम (Driver)</label>
                    <input
                      type="text"
                      value={newRoute.driverName}
                      onChange={(e) => setNewRoute({ ...newRoute, driverName: e.target.value })}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                      placeholder="उदा. राम सिंह"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">चालक फ़ोन नंबर</label>
                  <input
                    type="text"
                    value={newRoute.driverPhone}
                    onChange={(e) => setNewRoute({ ...newRoute, driverPhone: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    placeholder="उदा. 9887XXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">प्रमुख स्टॉप (कमा द्वारा अलग करें) *</label>
                  <textarea
                    required
                    value={newRoute.stops}
                    onChange={(e) => setNewRoute({ ...newRoute, stops: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    rows={2}
                    placeholder="उदा. स्टॉप A, स्टॉप B, स्टॉप C, स्कूल"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> मार्ग सहेजें (Save Route)
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
                सक्रिय बस परिवहन मार्ग (Active Transport Routes)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {busRoutes.map((route) => (
                  <div key={route.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl space-y-3 bg-zinc-50/50 dark:bg-zinc-850">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block text-[10px] bg-indigo-500 text-white font-black px-2 py-0.5 rounded-md mb-1">{route.id}</span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{route.routeName}</h4>
                        <p className="text-xs text-zinc-500">बस नंबर: {route.busNo}</p>
                      </div>
                      <button
                        onClick={() => {
                          onUpdateState({ busRoutes: busRoutes.filter(br => br.id !== route.id) });
                          onAddNotification('परिवहन रूट विलोपित', `रूट ${route.routeName} हटा दिया गया।`, 'warning');
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-700 pt-2 text-xs grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">चालक (Driver)</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{route.driverName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">फ़ोन (Phone)</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{route.driverPhone}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase mb-1">प्रमुख ठहराव (Stops)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {route.stops.map((stop, sIdx) => (
                          <span key={sIdx} className="text-[9px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md font-semibold">
                            📍 {stop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleAddTimetableSlot} className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> कालांश टाइम टेबल सेट करें
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">कक्षा (Class)</label>
                  <select
                    value={newSlot.className}
                    onChange={(e) => setNewSlot({ ...newSlot, className: e.target.value })}
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
                  <label className="block text-xs font-bold text-zinc-500 mb-1">कालांश सं. (Period Number)</label>
                  <select
                    value={newSlot.period}
                    onChange={(e) => setNewSlot({ ...newSlot, period: Number(e.target.value) })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                  >
                    <option value="1">प्रथम कालांश (Period 1)</option>
                    <option value="2">द्वितीय कालांश (Period 2)</option>
                    <option value="3">तृतीय कालांश (Period 3)</option>
                    <option value="4">चतुर्थ कालांश (Period 4)</option>
                    <option value="5">पंचम कालांश (Period 5)</option>
                    <option value="6">षष्ठम कालांश (Period 6)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">अध्यापन विषय (Subject)</label>
                  <select
                    value={newSlot.subject}
                    onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">शिक्षक (Teacher) *</label>
                  <select
                    value={newSlot.teacherId}
                    onChange={(e) => setNewSlot({ ...newSlot, teacherId: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                  >
                    <option value="">शिक्षक चुनें...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> टाइम टेबल स्लॉट बदलें (Apply Setup)
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
                समग्र कालांश सारणी (Class-wise Schedule Matrix)
              </h3>
              <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-left border-collapse text-[11px] min-w-400">
                  <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-bold">
                    <tr>
                      <th className="p-3">कक्षा</th>
                      <th className="p-3">Period 1</th>
                      <th className="p-3">Period 2</th>
                      <th className="p-3">Period 3</th>
                      <th className="p-3">Period 4</th>
                      <th className="p-3">Period 5</th>
                      <th className="p-3">Period 6</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {['6A', '7A', '8A', '9A', '10A'].map((cls) => {
                      const slots = timetable.filter(slot => slot.className === cls);
                      return (
                        <tr key={cls} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300">
                          <td className="p-3 font-bold text-indigo-500 bg-zinc-50/30 dark:bg-zinc-800/20">{cls}</td>
                          {[1, 2, 3, 4, 5, 6].map((p) => {
                            const found = slots.find(s => s.period === p);
                            return (
                              <td key={p} className="p-3">
                                {found ? (
                                  <div>
                                    <span className="font-bold text-zinc-900 dark:text-white block">{found.subject}</span>
                                    <span className="text-[10px] text-zinc-400">{found.teacherName.split(' ')[0]}</span>
                                  </div>
                                ) : (
                                  <span className="text-zinc-300 dark:text-zinc-600 italic">खाली (Empty)</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleAddUserAccount} className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> नया यूज़र एक्सेस बनाएं
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">यूज़र का नाम *</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    placeholder="उदा. कैलाश चंद"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">ईमेल एड्रेस *</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    placeholder="उदा. kailash@school.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">सिस्टम रोल (Role) *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                  >
                    <option value="Admin">Admin (प्रधान / एडमिन)</option>
                    <option value="Teacher">Teacher (कक्षा अध्यापक / विषय अध्यापक)</option>
                    <option value="Manager">Manager (मैनेजर / अकाउंटिंग)</option>
                    <option value="Exam In-charge">Exam In-charge (परीक्षा प्रभारी)</option>
                    <option value="Student">Student (छात्र / छात्रा)</option>
                  </select>
                </div>
                {newUser.role === 'Teacher' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">संबंधित शिक्षक (Associated Teacher ID)</label>
                    <select
                      value={newUser.associatedId}
                      onChange={(e) => setNewUser({ ...newUser, associatedId: e.target.value })}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    >
                      <option value="">चुनें...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                      ))}
                    </select>
                  </div>
                )}
                {newUser.role === 'Student' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">संबंधित छात्र (Associated Student ID)</label>
                    <select
                      value={newUser.associatedId}
                      onChange={(e) => setNewUser({ ...newUser, associatedId: e.target.value })}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-2.5 rounded-xl dark:text-white"
                    >
                      <option value="">चुनें...</option>
                      {students.slice(0, 20).map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" /> यूजर सक्रिय करें (Activate User)
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide border-b border-zinc-50 dark:border-zinc-800 pb-2">
                उपयोगकर्ता सूची और सुरक्षा स्थिति (Access Permissions)
              </h3>
              <div className="overflow-y-auto max-h-96 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-bold sticky top-0">
                    <tr>
                      <th className="p-3">यूज़र का नाम / ईमेल</th>
                      <th className="p-3">निर्धारित रोल</th>
                      <th className="p-3">संबद्ध ID</th>
                      <th className="p-3 text-center">स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300">
                        <td className="p-3">
                          <span className="font-bold text-zinc-900 dark:text-white block">{u.name}</span>
                          <span className="text-zinc-400 font-mono text-[10px]">{u.email}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-extrabold rounded-md text-[10px]">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{u.associatedId || 'N/A'}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              const updated = users.map(us => us.id === u.id ? { ...us, isActive: !us.isActive } : us);
                              setUsers(updated);
                              onAddNotification('अकाउंट स्टेटस परिवर्तित', `${u.name} का खाता ${!u.isActive ? 'सक्रिय' : 'निलंबित'} किया गया।`, 'info');
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                              u.isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {u.isActive ? '● Active' : '○ Suspended'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-amber-300" />
                <h3 className="text-lg font-black font-display">⚡ 1-क्लिक डेमो एक्सप्लोरर (Admin Control)</h3>
              </div>
              <p className="text-xs text-purple-200">
                यहाँ से एडमिन के रूप में आप सिस्टम के विभिन्न रोल्स (शिक्षक, छात्र, प्रबंधक, परीक्षा प्रभारी) में 1-क्लिक के साथ स्विच करके ऐप के सभी फीचर्स लाइव एक्सप्लोर कर सकते हैं।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Admin */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 text-white rounded-xl">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white">👑 Admin (प्रधानाचार्य)</h4>
                    <p className="text-[11px] text-zinc-500">सभी मॉड्यूल्स व सेटिंग्स का पूर्ण अधिकार</p>
                  </div>
                </div>
                <button
                  onClick={() => onSwitchUser && onSwitchUser({ id: 'U1', name: 'राजेश शर्मा (प्रधानाचार्य)', email: 'admin@school.com', role: 'Admin', isActive: true })}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" /> स्विच करें
                </button>
              </div>

              {/* Teacher */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-600 text-white rounded-xl">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white">👩‍🏫 Teacher (सुरेश कुमार)</h4>
                    <p className="text-[11px] text-zinc-500">कक्षा 10A - गणित, उपस्थिति, गृहकार्य</p>
                  </div>
                </div>
                <button
                  onClick={() => onSwitchUser && onSwitchUser({ id: 'U2', name: 'सुरेश कुमार', email: 'suresh@school.com', role: 'Teacher', associatedId: 'T100', isActive: true })}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" /> स्विच करें
                </button>
              </div>

              {/* Student */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-xl">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white">🎓 Student (आरव शर्मा)</h4>
                    <p className="text-[11px] text-zinc-500">कक्षा 10A (Roll No: 01) - परिणाम, फीस कार्ड</p>
                  </div>
                </div>
                <button
                  onClick={() => onSwitchUser && onSwitchUser({ id: 'U3', name: 'आरव शर्मा', email: 'aarav@school.com', role: 'Student', associatedId: 'S1001', isActive: true })}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" /> स्विच करें
                </button>
              </div>

              {/* Manager */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-600 text-white rounded-xl">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white">💼 Manager (महेन्द्र सिंह)</h4>
                    <p className="text-[11px] text-zinc-500">कोषाध्यक्ष - वित्तीय लेखा-जोखा व वेतन</p>
                  </div>
                </div>
                <button
                  onClick={() => onSwitchUser && onSwitchUser({ id: 'U4', name: 'महेन्द्र सिंह', email: 'manager@school.com', role: 'Manager', isActive: true })}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" /> स्विच करें
                </button>
              </div>

              {/* Exam In-charge */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center justify-between md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600 text-white rounded-xl">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white">📝 Exam Controller (विकास यादव)</h4>
                    <p className="text-[11px] text-zinc-500">परीक्षा प्रभारी - अंक तालिका व रिजल्ट घोषणा</p>
                  </div>
                </div>
                <button
                  onClick={() => onSwitchUser && onSwitchUser({ id: 'U5', name: 'विकास यादव', email: 'exam@school.com', role: 'Exam In-charge', isActive: true })}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" /> स्विच करें
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
