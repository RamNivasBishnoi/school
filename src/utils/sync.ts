import { AppState, Student, Teacher, AccountTransaction, LeaveRequest } from '../types';

/**
 * Google Workspace (Sheets & Drive) Synchronizer Engine
 * Connects directly using Google API endpoints and the Firebase Google accessToken.
 */

interface GSheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Searches for an existing School ERP spreadsheet, or creates a new one
 */
export async function findOrCreateSpreadsheet(accessToken: string): Promise<GSheetResponse> {
  const searchUrl = 'https://www.googleapis.com/drive/v3/files?q=name=\'School_Management_ERP_Sync\' and mimeType=\'application/vnd.google-apps.spreadsheet\' and trashed=false';
  
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    throw new Error('Google Drive search failed');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    const file = searchData.files[0];
    return {
      spreadsheetId: file.id,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
    };
  }

  // Create a new Spreadsheet with Sheet Tabs
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  const newSheetBody = {
    properties: {
      title: 'School_Management_ERP_Sync',
    },
    sheets: [
      { properties: { title: 'Students' } },
      { properties: { title: 'Teachers' } },
      { properties: { title: 'Accounting' } },
      { properties: { title: 'Leaves' } },
      { properties: { title: 'Timetable' } },
      { properties: { title: 'Homework' } },
    ],
  };

  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newSheetBody),
  });

  if (!createRes.ok) {
    throw new Error('Spreadsheet creation failed');
  }

  const createData = await createRes.json();
  return {
    spreadsheetId: createData.spreadsheetId,
    spreadsheetUrl: createData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${createData.spreadsheetId}/edit`,
  };
}

/**
 * Helper to push an array of rows to a specific Sheet Tab
 */
export async function updateSheetData(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rows: string[][]
): Promise<boolean> {
  // Clear existing values in the sheet first
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z500:clear`;
  await fetch(clearUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Write new values
  const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1?valueInputOption=USER_ENTERED`;
  const body = {
    values: rows,
  };

  const writeRes = await fetch(writeUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return writeRes.ok;
}

/**
 * Synchronizes the entire local AppState to Google Sheets
 */
export async function syncStateToSheets(
  accessToken: string,
  state: AppState
): Promise<{ success: boolean; url: string; timestamp: string }> {
  try {
    const { spreadsheetId, spreadsheetUrl } = await findOrCreateSpreadsheet(accessToken);

    // 1. Prepare Students Sheet
    const studentRows = [
      ['Student ID', 'Roll No', 'Name', 'Father\'s Name', 'Class Name', 'Bus Route', 'Bus Stop', 'Total Fee', 'Paid Fee', 'Dues Fee', 'Attendance Rate %'],
    ];
    state.students.forEach((s) => {
      const attValues = Object.values(s.attendance);
      const totalDays = attValues.length;
      const presentDays = attValues.filter(v => v === 'Present').length;
      const attRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '100';

      studentRows.push([
        s.id,
        s.rollNo,
        s.name,
        s.fatherName,
        s.className,
        s.busRouteId,
        s.busStop,
        s.feeTotal.toString(),
        s.feePaid.toString(),
        (s.feeTotal - s.feePaid).toString(),
        `${attRate}%`
      ]);
    });

    // 2. Prepare Teachers Sheet
    const teacherRows = [
      ['Teacher ID', 'Name', 'Email', 'Subject', 'Class Teacher of', 'Monthly Salary', 'July 2026 Salary Status'],
    ];
    state.teachers.forEach((t) => {
      teacherRows.push([
        t.id,
        t.name,
        t.email,
        t.subject,
        t.classNameAssigned,
        t.salary.toString(),
        t.salaryStatus['July 2026'] || 'Pending'
      ]);
    });

    // 3. Prepare Accounting Sheet
    const accRows = [
      ['Transaction ID', 'Type', 'Category', 'Amount', 'Date', 'Description'],
    ];
    state.transactions.forEach((tx) => {
      accRows.push([
        tx.id,
        tx.type,
        tx.category,
        tx.amount.toString(),
        tx.date,
        tx.description
      ]);
    });

    // 4. Prepare Leaves Sheet
    const leaveRows = [
      ['Leave ID', 'Requester ID', 'Requester Name', 'Role', 'Start Date', 'End Date', 'Reason', 'Status', 'Applied Date'],
    ];
    state.leaves.forEach((l) => {
      leaveRows.push([
        l.id,
        l.requesterId,
        l.requesterName,
        l.role,
        l.startDate,
        l.endDate,
        l.reason,
        l.status,
        l.appliedDate
      ]);
    });

    // 5. Prepare Timetable Sheet
    const timetableRows = [
      ['Class Name', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'],
    ];
    // Group timetable by class
    const classes = ['6A', '7A', '8A', '9A', '10A'];
    classes.forEach(cls => {
      const clsSlots = state.timetable.filter(t => t.className === cls);
      const row = [cls];
      for (let p = 1; p <= 6; p++) {
        const slot = clsSlots.find(s => s.period === p);
        row.push(slot ? `${slot.subject} (${slot.teacherName.split(' ')[0]})` : 'Empty');
      }
      timetableRows.push(row);
    });

    // 6. Prepare Homework Sheet
    const hwRows = [
      ['Homework ID', 'Class Name', 'Subject', 'Title', 'Description', 'Due Date', 'Assigned By', 'Attachment'],
    ];
    state.homework.forEach(hw => {
      hwRows.push([
        hw.id,
        hw.className,
        hw.subject,
        hw.title,
        hw.description,
        hw.dueDate,
        hw.assignedBy,
        hw.attachmentUrl || 'None'
      ]);
    });

    // Push all sheet logs in parallel
    const syncs = await Promise.all([
      updateSheetData(accessToken, spreadsheetId, 'Students', studentRows),
      updateSheetData(accessToken, spreadsheetId, 'Teachers', teacherRows),
      updateSheetData(accessToken, spreadsheetId, 'Accounting', accRows),
      updateSheetData(accessToken, spreadsheetId, 'Leaves', leaveRows),
      updateSheetData(accessToken, spreadsheetId, 'Timetable', timetableRows),
      updateSheetData(accessToken, spreadsheetId, 'Homework', hwRows),
    ]);

    const allSuccessful = syncs.every(Boolean);

    if (allSuccessful) {
      return {
        success: true,
        url: spreadsheetUrl,
        timestamp: new Date().toLocaleTimeString('hi-IN'),
      };
    } else {
      throw new Error('Some sheets failed to update');
    }
  } catch (error: any) {
    console.error('Google Sheets sync error:', error);
    throw error;
  }
}

/**
 * Uploads a simulated PDF document or JSON configuration directly to Google Drive
 */
export async function uploadFileToDrive(
  accessToken: string,
  fileName: string,
  fileContent: string,
  mimeType: string = 'text/plain'
): Promise<{ success: boolean; fileId: string; url: string }> {
  try {
    const metadata = {
      name: fileName,
      mimeType: mimeType,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: mimeType }));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!res.ok) {
      throw new Error('Google Drive file upload failed');
    }

    const data = await res.json();
    return {
      success: true,
      fileId: data.id,
      url: `https://drive.google.com/file/d/${data.id}/view`,
    };
  } catch (error) {
    console.error('Drive upload failed:', error);
    throw error;
  }
}
