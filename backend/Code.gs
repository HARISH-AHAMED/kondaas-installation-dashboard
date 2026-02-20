/**
 * SERVES GET REQUESTS
 *
 * @param {Object} e - Event parameter from Google Apps Script Web App
 * @returns {ContentService} JSON response
 */
function doGet(e) {
  const result = getData();
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * FETCHES DATA FROM THE SHEET
 * 
 * Assumes the first row is the header.
 * 
 * @returns {Object} { status: 'success', data: [...] }
 */
function getData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0]; // Gets the first sheet
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const data = rows.slice(1);
    
    // Map rows to objects based on headers
    const formattedData = data.map(row => {
      let obj = {};
      row.forEach((cell, index) => {
        // Convert headers to camelCase or keep as is. Using generic key for now.
        // It's better to sanitize headers to be valid JSON keys
        const header = headers[index].toString().trim();
        obj[header] = cell;
      });
      return obj;
    });

    return {
      status: 'success',
      data: formattedData
    };

  } catch (error) {
    return {
      status: 'error',
      message: error.toString()
    };
  }
}

/**
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet.
 * 2. Add some data (Row 1 = Headers).
 * 3. Extensions > Apps Script.
 * 4. Paste this code into Code.gs.
 * 5. Deploy > New Deployment.
 * 6. Select type: Web App.
 * 7. Description: "Solar Dashboard API".
 * 8. Execute as: "Me" (your email).
 * 9. Who has access: "Anyone".
 * 10. Click Deploy and copy the Web App URL.
 * 11. Create a .env file in the frontend project root and add:
 *     VITE_API_URL=https://script.google.com/macros/s/.../exec
 */
