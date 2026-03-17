export const MOCK_DATA = {
    residential: [
        {
            "category": "residential",
            "City": "Chennai",
            "State": "Tamil Nadu",
            "Pincode": 600001,
            "Installations": 125,
            "Capacity_kW": 520,
            "Savings_Estimate": 1250000,
            "District": "Chennai District",
            "Date": "1/10/2026"
        },
        {
            "category": "residential",
            "City": "Coimbatore",
            "State": "Tamil Nadu",
            "Pincode": 641001,
            "Installations": 85,
            "Capacity_kW": 360,
            "Savings_Estimate": 820000,
            "Date": "1/12/2026"
        },
        {
            "category": "residential",
            "City": "Bengaluru",
            "State": "Karnataka",
            "Pincode": 560001,
            "Installations": 210,
            "Capacity_kW": 890,
            "Savings_Estimate": 2100000,
            "Date": "1/15/2026"
        },
        {
            "category": "residential",
            "City": "Pune",
            "State": "Maharashtra",
            "Pincode": 411001,
            "Installations": 140,
            "Capacity_kW": 590,
            "Savings_Estimate": 1350000,
            "Date": "1/22/2026"
        },
        {
            "category": "residential",
            "City": "Salem",
            "State": "Tamil Nadu",
            "Pincode": 636001,
            "Installations": 65,
            "Capacity_kW": 280,
            "Savings_Estimate": 650000,
            "Date": "1/30/2026"
        }
    ],
    commercial: [
        {
            "category": "commercial",
            "City": "Hyderabad",
            "State": "Telangana",
            "Pincode": 500001,
            "Installations": 150,
            "Capacity_kW": 6400,
            "Savings_Estimate": 14800000,
            "Date": "1/18/2026"
        },
        {
            "category": "commercial",
            "City": "Mumbai",
            "State": "Maharashtra",
            "Pincode": 400001,
            "Installations": 260,
            "Capacity_kW": 11000,
            "Savings_Estimate": 27500000,
            "Date": "1/20/2026"
        },
        {
            "category": "commercial",
            "City": "Delhi",
            "State": "Delhi",
            "Pincode": 110001,
            "Installations": 300,
            "Capacity_kW": 13000,
            "Savings_Estimate": 32000000,
            "Date": "1/25/2026"
        },
        {
            "category": "commercial",
            "City": "Kolkata",
            "State": "West Bengal",
            "Pincode": 700001,
            "Installations": 120,
            "Capacity_kW": 5000,
            "Savings_Estimate": 11500000,
            "Date": "1/27/2026"
        }
    ],
    waterHeater: [
        {
            "category": "waterHeater",
            "City": "Tiruppur",
            "State": "Tamil Nadu",
            "Pincode": 641601,
            "Installations": 95,
            "Capacity_kW": 41,
            "Savings_Estimate": 95000,
            "Date": "1/28/2026"
        },
        {
            "category": "waterHeater",
            "City": "Erode",
            "State": "Tamil Nadu",
            "Pincode": 638001,
            "Installations": 70,
            "Capacity_kW": 30,
            "Savings_Estimate": 70000,
            "Date": "1/29/2026"
        },
        {
            "category": "waterHeater",
            "City": "Madurai",
            "State": "Tamil Nadu",
            "Pincode": 625001,
            "Installations": 110,
            "Capacity_kW": 48,
            "Savings_Estimate": 110000,
            "Date": "2/01/2026"
        },
        {
            "category": "waterHeater",
            "City": "Trichy",
            "State": "Tamil Nadu",
            "Pincode": 620001,
            "Installations": 90,
            "Capacity_kW": 39,
            "Savings_Estimate": 90000,
            "Date": "2/02/2026"
        }
    ]
};

export const fetchMockData = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ status: 'success', data: MOCK_DATA });
        }, 0);
    });
};
