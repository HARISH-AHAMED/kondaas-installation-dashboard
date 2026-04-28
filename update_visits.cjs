const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, 'src/services/mockData.js');

try {
  let content = fs.readFileSync(mockDataPath, 'utf8');

  // Extract MOCK_DATA
  const match = content.match(/export const MOCK_DATA = (.*?);\n\nexport const fetchMockData/s);
  if (!match) throw new Error("Could not parse MOCK_DATA");

  let mockData = eval("(" + match[1] + ")");

  const updateVisitsPerYear = (items) => {
    return items.map(item => {
      return {
        ...item,
        Service_3Yr_Visits: 4,
        Service_5Yr_Visits: 4,
        Service_10Yr_Visits: 4,
      };
    });
  };

  mockData.residential = updateVisitsPerYear(mockData.residential);
  mockData.commercial = updateVisitsPerYear(mockData.commercial);
  mockData.waterHeater = updateVisitsPerYear(mockData.waterHeater);

  const newContent = `export const MOCK_DATA = ${JSON.stringify(mockData, null, 4)};\n\nexport const fetchMockData = () => {\n    return new Promise((resolve) => {\n        setTimeout(() => {\n            resolve({ status: 'success', data: MOCK_DATA });\n        }, 0);\n    });\n};\n`;

  fs.writeFileSync(mockDataPath, newContent, 'utf8');
} catch(err) {
  console.error("Error updating mockData:", err);
}
