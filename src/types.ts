export interface Student {
  id: string;
  name: string;
  fatherName: string;
  className: string; // e.g. "6A", "7B", "8A", "9A", "10A"
  rollNo: string;
  busRouteId: string; // e.g. "R1", "R2", "R3", "R4", "None"
  busStop: string;
  feeTotal: number;
  feePaid: number;
  attendance: { [date: string]: 'Present' | 'Absent' | 'Leave' };
  marks: {
    [subject: string]: {
      halfYearly: number | null; // out of 100
      annual: number | null; // out of 100
    };
  };
  leaves: LeaveRequest[];
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string; // e.g. "Mathematics", "Science", "Hindi", "English", "Social Science"
  classNameAssigned: string; // Class teacher of this class, e.g. "10A" or "None"
  salary: number;
  salaryStatus: { [month: string]: 'Paid' | 'Unpaid' | 'Pending' };
  attendance: { [date: string]: 'Present' | 'Absent' | 'Leave' };
  leaves: LeaveRequest[];
}

export interface LeaveRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  role: 'Student' | 'Teacher';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

export interface Homework {
  id: string;
  className: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  assignedBy: string; // Teacher Name
  attachmentUrl?: string; // Mock PDF or Image name
  submissions: {
    studentId: string;
    studentName: string;
    submittedAt: string;
    status: 'Pending' | 'Reviewed';
    feedback?: string;
  }[];
}

export interface AccountTransaction {
  id: string;
  type: 'Income' | 'Expense' | 'Salary';
  category: string; // e.g. "Tuition Fee", "Salary", "Bus Fuel", "Electricity", "Repair", "Books"
  amount: number;
  date: string;
  description: string;
}

export interface BusRoute {
  id: string;
  routeName: string; // e.g. "Route A: Main Market"
  busNo: string;
  driverName: string;
  driverPhone: string;
  stops: string[];
}

export interface TimetableSlot {
  id: string;
  className: string;
  period: number; // 1 to 6
  subject: string;
  teacherId: string;
  teacherName: string;
}

export interface UserPasswordMap {
  [usernameOrRoll: string]: string;
}

export interface AppState {
  schoolName: string;
  students: Student[];
  teachers: Teacher[];
  homework: Homework[];
  transactions: AccountTransaction[];
  leaves: LeaveRequest[];
  busRoutes: BusRoute[];
  timetable: TimetableSlot[];
  isResultsDeclared: boolean;
  userPasswords?: UserPasswordMap;
  userProfile: {
    role: 'Admin' | 'Teacher' | 'Student' | 'Manager' | 'Exam In-charge';
    selectedId?: string; // Student ID or Teacher ID if corresponding role is chosen
  };
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student' | 'Manager' | 'Exam In-charge';
  associatedId?: string; // Student/Teacher ID
  isActive: boolean;
}

export interface SyncLog {
  timestamp: string;
  status: 'Success' | 'Failed';
  message: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  primaryColor: string; // e.g. "emerald", "indigo", "rose", "amber", "slate"
  language: 'hi' | 'en';
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  time: string;
  read: boolean;
}
