const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, 'src/services/mockData.js');

try {
  let content = fs.readFileSync(mockDataPath, 'utf8');

  // Extract MOCK_DATA
  const match = content.match(/export const MOCK_DATA = (.*?);\n\nexport const fetchMockData/s);
  if (!match) throw new Error("Could not parse MOCK_DATA");

  let mockData = eval("(" + match[1] + ")");

  const updateIndividualDowntimes = (items) => {
    return items.map(item => {
      const base = item.Service_Avg_Downtime || 3.0;
      return {
        ...item,
        Service_3Yr_Downtime: parseFloat((base * 0.8).toFixed(1)),
        Service_5Yr_Downtime: parseFloat(base.toFixed(1)),
        Service_10Yr_Downtime: parseFloat((base * 1.3).toFixed(1)),
      };
    });
  };

  mockData.residential = updateIndividualDowntimes(mockData.residential);
  mockData.commercial = updateIndividualDowntimes(mockData.commercial);
  mockData.waterHeater = updateIndividualDowntimes(mockData.waterHeater);

  const newContent = `export const MOCK_DATA = ${JSON.stringify(mockData, null, 4)};\n\nexport const fetchMockData = () => {\n    return new Promise((resolve) => {\n        setTimeout(() => {\n            resolve({ status: 'success', data: MOCK_DATA });\n        }, 0);\n    });\n};\n`;

  fs.writeFileSync(mockDataPath, newContent, 'utf8');
  console.log("mockData successfully updated with individual downtime columns.");
} catch(err) {
  console.error("Error updating mockData:", err);
}
