export const MOCK_DATA = [
    {
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
        "City": "Coimbatore",
        "State": "Tamil Nadu",
        "Pincode": 641001,
        "Installations": 85,
        "Capacity_kW": 360,
        "Savings_Estimate": 820000,
        "Date": "1/12/2026"
    },
    {
        "City": "Bengaluru",
        "State": "Karnataka",
        "Pincode": 560001,
        "Installations": 210,
        "Capacity_kW": 890,
        "Savings_Estimate": 2100000,
        "Date": "1/15/2026"
    },
    {
        "City": "Hyderabad",
        "State": "Telangana",
        "Pincode": 500001,
        "Installations": 150,
        "Capacity_kW": 640,
        "Savings_Estimate": 1480000,
        "Date": "1/18/2026"
    },
    {
        "City": "Mumbai",
        "State": "Maharashtra",
        "Pincode": 400001,
        "Installations": 260,
        "Capacity_kW": 1100,
        "Savings_Estimate": 2750000,
        "Date": "1/20/2026"
    },
    {
        "City": "Pune",
        "State": "Maharashtra",
        "Pincode": 411001,
        "Installations": 140,
        "Capacity_kW": 590,
        "Savings_Estimate": 1350000,
        "Date": "1/22/2026"
    },
    {
        "City": "Delhi",
        "State": "Delhi",
        "Pincode": 110001,
        "Installations": 300,
        "Capacity_kW": 1300,
        "Savings_Estimate": 3200000,
        "Date": "1/25/2026"
    },
    {
        "City": "Kolkata",
        "State": "West Bengal",
        "Pincode": 700001,
        "Installations": 120,
        "Capacity_kW": 500,
        "Savings_Estimate": 1150000,
        "Date": "1/27/2026"
    },
    {
        "City": "Tiruppur",
        "State": "Tamil Nadu",
        "Pincode": 641601,
        "Installations": 95,
        "Capacity_kW": 410,
        "Savings_Estimate": 950000,
        "Date": "1/28/2026"
    },
    {
        "City": "Erode",
        "State": "Tamil Nadu",
        "Pincode": 638001,
        "Installations": 70,
        "Capacity_kW": 300,
        "Savings_Estimate": 700000,
        "Date": "1/29/2026"
    },
    {
        "City": "Salem",
        "State": "Tamil Nadu",
        "Pincode": 636001,
        "Installations": 65,
        "Capacity_kW": 280,
        "Savings_Estimate": 650000,
        "Date": "1/30/2026"
    },
    {
        "City": "Madurai",
        "State": "Tamil Nadu",
        "Pincode": 625001,
        "Installations": 110,
        "Capacity_kW": 480,
        "Savings_Estimate": 1100000,
        "Date": "2/01/2026"
    },
    {
        "City": "Trichy",
        "State": "Tamil Nadu",
        "Pincode": 620001,
        "Installations": 90,
        "Capacity_kW": 390,
        "Savings_Estimate": 900000,
        "Date": "2/02/2026"
    }
];

export const fetchMockData = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ status: 'success', data: MOCK_DATA });
        }, 0);
    });
};
