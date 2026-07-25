import { Student, Teacher, BusRoute, TimetableSlot, LeaveRequest, Homework, AccountTransaction } from './types';

// Indian First Names and Father Names for Realistic Generation
const firstNames = [
  'आरव', 'विहान', 'विवाण', 'अनन्या', 'दिया', 'कबीर', 'सई', 'आदित्य', 'साई', 'कृष्णा',
  'इशिका', 'आर्या', 'अथर्व', 'श्रेया', 'तन्मय', 'अंश', 'प्रणव', 'समर्थ', 'सिद्धार्थ', 'यश',
  'रुद्र', 'ईशान', 'अर्णव', 'शिवांश', 'प्रज्ञा', 'आराध्या', 'सानवी', 'साक्षी', 'खुशी', 'ऋषिता',
  'रोहन', 'अमित', 'राहुल', 'नेहा', 'अंजलि', 'दीपक', 'प्रियंका', 'संजय', 'मनोज', 'नीतू',
  'विशाल', 'अमन', 'कुणाल', 'पायल', 'निशा', 'गौरव', 'सौरभ', 'मनीष', 'कविता', 'सपना'
];

const lastNames = [
  'शर्मा', 'वर्मा', 'गुप्ता', 'मिश्रा', 'सिंह', 'यादव', 'चौधरी', 'पटेल', 'जोशी', 'दुबे',
  'तिवारी', 'पांडे', 'राठौड़', 'चौहान', 'सोनी', 'राणा', 'जैन', 'अग्रवाल', 'कुमार', 'भारद्वाज'
];

const fatherFirstNames = [
  'राजेश', 'राकेश', 'रमेश', 'सुरेश', 'अनिल', 'सुनील', 'कमल', 'दिनेश', 'महेश', 'संजय',
  'विनोद', 'पवन', 'विजय', 'सत्येन्द्र', 'मनोज', 'अरुण', 'अशोक', 'अजय', 'हरीश', 'जितेन्द्र'
];

export const initialBusRoutes: BusRoute[] = [
  { id: 'R1', routeName: 'मार्ग A: मुख्य बाजार (Main Market)', busNo: 'RJ-14-PA-1234', driverName: 'रामगोपाल यादव', driverPhone: '9829012345', stops: ['स्टेशन चौराहा', 'गांधी नगर', 'राम मंदिर गली', 'स्कूल परिसर'] },
  { id: 'R2', routeName: 'मार्ग B: रेलवे स्टेशन (Railway Station)', busNo: 'RJ-14-PA-5678', driverName: 'जगदीश प्रसाद', driverPhone: '9414054321', stops: ['रेलवे गेट', 'न्यू कॉलोनी', 'बस स्टैंड', 'स्कूल परिसर'] },
  { id: 'R3', routeName: 'मार्ग C: सिविल लाइंस (Civil Lines)', busNo: 'RJ-14-PA-9012', driverName: 'बलबीर सिंह', driverPhone: '9928098765', stops: ['शास्त्री नगर', 'कलक्ट्रेट', 'नेहरू पार्क', 'स्कूल परिसर'] },
  { id: 'R4', routeName: 'मार्ग D: सुभाष नगर (Subhash Nagar)', busNo: 'RJ-14-PA-3456', driverName: 'अमजद खान', driverPhone: '9887011223', stops: ['सुभाष सर्किल', 'हनुमान मंदिर', 'व्यास कॉलोनी', 'स्कूल परिसर'] },
];

export function generateDemoData() {
  const classes = ['6A', '7A', '8A', '9A', '10A'];
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'];

  // Generate 15 Teachers
  const teachers: Teacher[] = [];
  const teacherSubjects = [
    { name: 'सुरेश कुमार (Suresh Kumar)', sub: 'Mathematics', cls: '10A', sal: 45000 },
    { name: 'सुनीता शर्मा (Sunita Sharma)', sub: 'Science', cls: '9A', sal: 42000 },
    { name: 'रमेश वर्मा (Ramesh Verma)', sub: 'English', cls: '8A', sal: 40000 },
    { name: 'पूजा सिंह (Pooja Singh)', sub: 'Hindi', cls: '7A', sal: 38000 },
    { name: 'विकास यादव (Vikas Yadav)', sub: 'Social Science', cls: '6A', sal: 38000 },
    { name: 'अमित सोनी (Amit Soni)', sub: 'Computer Science', cls: 'None', sal: 35000 },
    { name: 'किरण जोशी (Kiran Joshi)', sub: 'Sanskrit', cls: 'None', sal: 32000 },
    { name: 'राजेश दुबे (Rajesh Dubey)', sub: 'Mathematics', cls: 'None', sal: 41000 },
    { name: 'नीलम मिश्रा (Neelam Mishra)', sub: 'Science', cls: 'None', sal: 39000 },
    { name: 'संदीप चौधरी (Sandeep Choudhary)', sub: 'English', cls: 'None', sal: 37000 },
    { name: 'विजया राणा (Vijaya Rana)', sub: 'Hindi', cls: 'None', sal: 36000 },
    { name: 'योगेश पांडे (Yogesh Pandey)', sub: 'Social Science', cls: 'None', sal: 35000 },
    { name: 'सीमा जैन (Seema Jain)', sub: 'Art', cls: 'None', sal: 30000 },
    { name: 'हरिओम सिंह (Hariom Singh)', sub: 'Physical Education', cls: 'None', sal: 32000 },
    { name: 'मनीष शर्मा (Manish Sharma)', sub: 'Music', cls: 'None', sal: 31000 },
  ];

  const dates = ['2026-07-11', '2026-07-12', '2026-07-13', '2026-07-14', '2026-07-15'];

  teacherSubjects.forEach((ts, idx) => {
    const tAttendance: { [date: string]: 'Present' | 'Absent' | 'Leave' } = {};
    dates.forEach(d => {
      // 95% Present rate
      tAttendance[d] = Math.random() > 0.05 ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Leave');
    });

    teachers.push({
      id: `T${100 + idx}`,
      name: ts.name,
      email: `${ts.name.split(' ')[0].toLowerCase()}@school.com`,
      subject: ts.sub,
      classNameAssigned: ts.cls,
      salary: ts.sal,
      salaryStatus: {
        'June 2026': 'Paid',
        'July 2026': Math.random() > 0.3 ? 'Paid' : 'Pending',
      },
      attendance: tAttendance,
      leaves: [],
    });
  });

  // Generate 100 Students
  const students: Student[] = [];
  let studentCount = 100;
  
  for (let i = 1; i <= studentCount; i++) {
    const cls = classes[(i - 1) % classes.length];
    const rollNo = String(Math.floor((i - 1) / classes.length) + 1).padStart(2, '0');
    const fNameIdx = (i * 7) % firstNames.length;
    const lNameIdx = (i * 11) % lastNames.length;
    const fatNameIdx = (i * 13) % fatherFirstNames.length;

    const sName = `${firstNames[fNameIdx]} ${lastNames[lNameIdx]}`;
    const fName = `${fatherFirstNames[fatNameIdx]} ${lastNames[lNameIdx]}`;

    // Bus Route selection (80% use bus)
    const usesBus = Math.random() > 0.2;
    const rIdx = (i % 4);
    const busRouteId = usesBus ? `R${rIdx + 1}` : 'None';
    const busStop = usesBus ? initialBusRoutes[rIdx].stops[i % 3] : 'None';

    // Fees Setup (e.g. 24,000 yearly fees)
    const feeTotal = 24000;
    // Paid fees varying between 6000, 12000, 18000, 24000
    const feeLevels = [6000, 12000, 18000, 24000];
    const feePaid = feeLevels[(i % feeLevels.length)];

    // Attendance (random for recent 5 days)
    const sAttendance: { [date: string]: 'Present' | 'Absent' | 'Leave' } = {};
    dates.forEach(d => {
      const rand = Math.random();
      sAttendance[d] = rand > 0.1 ? 'Present' : (rand > 0.04 ? 'Absent' : 'Leave');
    });

    // Marks Setup (e.g. Half yearly is entered, Annual is pending)
    const sMarks: { [sub: string]: { halfYearly: number | null; annual: number | null } } = {};
    subjects.forEach((sub, sIdx) => {
      // Create interesting deterministic random marks out of 100 (range 40-98)
      const baseMark = 50 + ((i * 3 + sIdx * 7) % 45);
      sMarks[sub] = {
        halfYearly: baseMark,
        annual: null, // Keep annual marks empty for teachers to update in demo!
      };
    });

    students.push({
      id: `S${1000 + i}`,
      name: sName,
      fatherName: fName,
      className: cls,
      rollNo,
      busRouteId,
      busStop,
      feeTotal,
      feePaid,
      attendance: sAttendance,
      marks: sMarks,
      leaves: [],
    });
  }

  // Create Timetables class-wise and teacher-wise
  // For each of the 5 classes: 6 slots per day
  const timetable: TimetableSlot[] = [];
  const classList = ['6A', '7A', '8A', '9A', '10A'];
  
  classList.forEach((cls) => {
    for (let period = 1; period <= 6; period++) {
      // Find a teacher corresponding to subjects
      const subIdx = (period - 1) % subjects.length;
      const sub = subjects[subIdx];
      // Select appropriate teacher
      const matchingTeacher = teachers.find(t => t.subject === sub) || teachers[0];
      timetable.push({
        id: `TT-${cls}-P${period}`,
        className: cls,
        period,
        subject: sub,
        teacherId: matchingTeacher.id,
        teacherName: matchingTeacher.name,
      });
    }
  });

  // Some Leave Requests for Demo
  const leaves: LeaveRequest[] = [
    {
      id: 'L1',
      requesterId: 'T101',
      requesterName: 'सुनीता शर्मा (Sunita Sharma)',
      role: 'Teacher',
      startDate: '2026-07-20',
      endDate: '2026-07-22',
      reason: 'घरेलू आवश्यक कार्य हेतु अवकाश',
      status: 'Pending',
      appliedDate: '2026-07-15',
    },
    {
      id: 'L2',
      requesterId: 'S1001',
      requesterName: 'आरव सिंह',
      role: 'Student',
      startDate: '2026-07-16',
      endDate: '2026-07-17',
      reason: 'बुखार होने के कारण अवकाश',
      status: 'Pending',
      appliedDate: '2026-07-15',
    },
    {
      id: 'L3',
      requesterId: 'T102',
      requesterName: 'रमेश वर्मा (Ramesh Verma)',
      role: 'Teacher',
      startDate: '2026-07-10',
      endDate: '2026-07-10',
      reason: 'बीमार होने के कारण छुट्टी',
      status: 'Approved',
      appliedDate: '2026-07-09',
    }
  ];

  // Some Homework Demo Posts
  const homework: Homework[] = [
    {
      id: 'H1',
      className: '10A',
      subject: 'Mathematics',
      title: 'अध्याय 5 - समांतर श्रेढ़ी अभ्यास कार्य',
      description: 'कृपया प्रश्नावली 5.2 के प्रश्न संख्या 1 से 10 तक अपनी गृहकार्य पुस्तिका में हल करें और हल का फोटो अपलोड करें।',
      dueDate: '2026-07-18',
      assignedBy: 'सुरेश कुमार (Suresh Kumar)',
      attachmentUrl: 'maths_class10_ap.pdf',
      submissions: [
        { studentId: 'S1001', studentName: 'आरव शर्मा', submittedAt: '2026-07-14', status: 'Pending' },
      ]
    },
    {
      id: 'H2',
      className: '9A',
      subject: 'Science',
      title: 'गुरुत्वाकर्षण नियम के प्रयोग',
      description: 'न्यूटन के गुरुत्वाकर्षण नियम की व्याख्या करें और एक सुंदर चार्ट पेपर तैयार करें।',
      dueDate: '2026-07-19',
      assignedBy: 'सुनीता शर्मा (Sunita Sharma)',
      attachmentUrl: 'science_gravity_notes.pdf',
      submissions: []
    }
  ];

  // Transactions (Accounting)
  const transactions: AccountTransaction[] = [
    { id: 'TX1', type: 'Income', category: 'Tuition Fee', amount: 150000, date: '2026-07-05', description: 'कक्षा 10 और 9 के छात्रों से प्राप्त मासिक शुल्क' },
    { id: 'TX2', type: 'Expense', category: 'Electricity', amount: 12500, date: '2026-07-10', description: 'स्कूल परिसर विद्युत बिल भुगतान' },
    { id: 'TX3', type: 'Expense', category: 'Bus Fuel', amount: 28000, date: '2026-07-11', description: 'स्कूल बसों के लिए ईंधन भुगतान (मार्ग A, B, C, D)' },
    { id: 'TX4', type: 'Salary', category: 'Salary', amount: 180000, date: '2026-07-01', description: 'शिक्षकों और सहायक कर्मचारियों का जून माह का वेतन' },
    { id: 'TX5', type: 'Income', category: 'Tuition Fee', amount: 95000, date: '2026-07-12', description: 'कक्षा 6, 7 और 8 के छात्रों से प्राप्त मासिक शुल्क' },
    { id: 'TX6', type: 'Expense', category: 'Repair', amount: 8000, date: '2026-07-14', description: 'कक्षा 8B के पंखे और लाइट की मरम्मत' }
  ];

  return {
    schoolName: 'राजकीय आदर्श उच्च माध्यमिक विद्यालय',
    students,
    teachers,
    homework,
    transactions,
    leaves,
    busRoutes: initialBusRoutes,
    timetable,
    isResultsDeclared: false,
    userProfile: {
      role: 'Admin' as const,
    }
  };
}
