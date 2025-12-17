/**
 * TEAM MANAGER WEB APP BACKEND
 * 
 * Serves the React Application and handles data requests.
 */

// 1. SERVE THE APP
function doGet(e) {
  try {
    // Try "Index" (Capital I)
    return HtmlService.createHtmlOutputFromFile('Index')
        .setTitle('Team Manager')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (e) {
    // Fallback to "index" (lowercase i) or "Introduction" if referenced elsewhere, 
    // but usually users name it "index" or "Index".
    return HtmlService.createHtmlOutputFromFile('index')
        .setTitle('Team Manager')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// 2. DATA API
function getInitialData() {
  const sheet = ensureDataSheet();
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove headers
  
  // Parse into clean objects
  const employees = data.map(row => ({
    id: row[0],
    name: row[1],
    role: row[2],
    email: row[3],
    location: row[4],
    shift: row[5],
    project: row[6],
    status: row[7] || "Active"
  }));
  
  // Calculate unique lists for dropdowns
  const locations = [...new Set(employees.map(e => e.location).filter(Boolean))].sort();
  const shifts = [...new Set(employees.map(e => e.shift).filter(Boolean))].sort();
  const projects = [...new Set(employees.map(e => e.project).filter(Boolean))].sort();
  
  return {
    employees,
    config: { locations, shifts, projects }
  };
}

// 3. UPDATE API
function updateEmployee(id, updates) {
  const sheet = ensureDataSheet();
  const data = sheet.getDataRange().getValues();
  
  // Find row (assume ID is unique in Col A)
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) return { success: false, error: "Employee not found" };
  
  // Columns: A=1, E(Loc)=5, F(Shift)=6, G(Proj)=7
  if (updates.location) sheet.getRange(rowIndex, 5).setValue(updates.location);
  if (updates.shift) sheet.getRange(rowIndex, 6).setValue(updates.shift);
  if (updates.project) sheet.getRange(rowIndex, 7).setValue(updates.project);
  
  return { success: true };
}

// HELPER
function ensureDataSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Data');
  if (!sheet) {
    var allSheets = ss.getSheets();
    for (var i = 0; i < allSheets.length; i++) {
        if (allSheets[i].getRange("A1").getValue() == "Employee ID") {
            sheet = allSheets[i];
            if (sheet.getName() !== "Data") sheet.setName("Data");
            break;
        }
    }
  }
  return sheet;
}
