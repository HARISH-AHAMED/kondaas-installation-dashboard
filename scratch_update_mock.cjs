const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, 'src/services/mockData.js');

try {
  let content = fs.readFileSync(mockDataPath, 'utf8');

  // Extract MOCK_DATA
  const match = content.match(/export const MOCK_DATA = (.*?);\n\nexport const fetchMockData/s);
  if (!match) throw new Error("Could not parse MOCK_DATA");

  let mockData = eval("(" + match[1] + ")");

  const addMetrics = (items, category) => {
    return items.map(item => {
      // Create some slightly randomized but category-specific sensible data
      const factor = category === 'commercial' ? 5 : category === 'residential' ? 1.5 : 0.5;
      
      const legacy_3a = Math.floor((Math.random() * 50 + 20) * factor);
      const legacy_3t = legacy_3a + Math.floor(Math.random() * 20 * factor);
      const legacy_5a = Math.floor((Math.random() * 40 + 10) * factor);
      const legacy_5t = legacy_5a + Math.floor(Math.random() * 15 * factor);
      const legacy_10a = Math.floor((Math.random() * 20 + 5) * factor);
      const legacy_10t = legacy_10a + Math.floor(Math.random() * 10 * factor);

      const s_3v = Math.floor((Math.random() * 200 + 100) * factor);
      const s_5v = Math.floor((Math.random() * 300 + 150) * factor);
      const s_10v = Math.floor((Math.random() * 400 + 200) * factor);

      const s_avg_d = parseFloat((Math.random() * 2 + 1.5).toFixed(1)); // 1.5 to 3.5

      return {
        ...item,
        Legacy_3Yr_Active: legacy_3a,
        Legacy_3Yr_Total: legacy_3t,
        Legacy_5Yr_Active: legacy_5a,
        Legacy_5Yr_Total: legacy_5t,
        Legacy_10Yr_Active: legacy_10a,
        Legacy_10Yr_Total: legacy_10t,
        Service_3Yr_Visits: s_3v,
        Service_5Yr_Visits: s_5v,
        Service_10Yr_Visits: s_10v,
        Service_Avg_Downtime: s_avg_d
      };
    });
  };

  mockData.residential = addMetrics(mockData.residential, 'residential');
  mockData.commercial = addMetrics(mockData.commercial, 'commercial');
  mockData.waterHeater = addMetrics(mockData.waterHeater, 'waterHeater');

  const newContent = `export const MOCK_DATA = ${JSON.stringify(mockData, null, 4)};\n\nexport const fetchMockData = () => {\n    return new Promise((resolve) => {\n        setTimeout(() => {\n            resolve({ status: 'success', data: MOCK_DATA });\n        }, 0);\n    });\n};\n`;

  fs.writeFileSync(mockDataPath, newContent, 'utf8');
  console.log("mockData successfully updated with legacy and service metrics.");
} catch(err) {
  console.error("Error updating mockData:", err);
}
