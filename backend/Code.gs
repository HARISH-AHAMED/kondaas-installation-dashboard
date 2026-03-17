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
    
    // We expect sheets named: "Residential", "Commercial", "WaterHeater"
    // For fallback/robustness, we'll try to find them or just take the first 3 if names differ
    const sheetNames = ["Residential", "Commercial", "WaterHeater"];
    let dataObj = {
      residential: [],
      commercial: [],
      waterHeater: []
    };

    sheetNames.forEach((name, idx) => {
      let sheet = ss.getSheetByName(name);
      
      // Fallback: If named sheets don't exist, try getting them by index
      if (!sheet) {
        const allSheets = ss.getSheets();
        if (allSheets.length > idx) {
           sheet = allSheets[idx];
        }
      }

      if (sheet) {
        const rows = sheet.getDataRange().getValues();
        if (rows.length > 0) {
          const headers = rows[0];
          const data = rows.slice(1);
          
          const formattedData = data.map(row => {
            let obj = {};
            row.forEach((cell, index) => {
              const header = headers[index] ? headers[index].toString().trim() : `Col${index + 1}`;
              obj[header] = cell;
            });
            // Automatically inject the category back into the row for easy mapping on the frontend
            const categoryKey = name === "WaterHeater" ? "waterHeater" : name.toLowerCase();
            obj.category = categoryKey;
            return obj;
          });

          // Map to correct JSON key
          if (name === "Residential" || idx === 0) dataObj.residential = formattedData;
          if (name === "Commercial" || idx === 1) dataObj.commercial = formattedData;
          if (name === "WaterHeater" || idx === 2) dataObj.waterHeater = formattedData;
        }
      }
    });

    return {
       status: 'success',
       data: dataObj
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
