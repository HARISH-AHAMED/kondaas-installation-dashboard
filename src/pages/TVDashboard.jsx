import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TVLayout from '../components/tv/TVLayout';
import IndiaMap from '../components/dashboard/IndiaMap';
import { getInstallations } from '../services/api';
import { IndianRupee, Zap } from 'lucide-react';
import AnimatedIcon from '../components/common/AnimatedIcon';

// States available in the dashboard filter — add more here to extend
const STATES = ['Overall', 'Tamil Nadu', 'Kerala'];

const TVDashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const pincode = searchParams.get('pincode');
    const districtParam = searchParams.get('district');  // e.g. "Coimbatore"
    const stateParam = searchParams.get('state');        // e.g. "Tamil Nadu"
    const urlTab = searchParams.get('tab');

    // Initialize with cached data if available (Now an object with categories)
    const [data, setData] = useState(() => {
        const cached = localStorage.getItem('kondaas_dashboard_data_v2');
        return cached ? JSON.parse(cached) : { residential: [], commercial: [], waterHeater: [] };
    });

    const [activeTab, setActiveTab] = useState(urlTab || null);
    const [stats, setStats] = useState({ homes: 0, savings: 0, capacity: 0 });
    const [activeReview, setActiveReview] = useState(0);
    const [selectedState, setSelectedState] = useState('Overall'); // 'Overall' | state name
    const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

    const REVIEWS = [
        { text: 'Amazing experience! Mr. Manoj and Mr. Praveen\'s team dealt with the work politely and carefully. Thanks to Kondaas Automation and the whole team!', author: 'Chandrasekaran P.', stars: 5 },
        { text: 'Sangamesvaran, Sudheesh, Praveen & Vel Murugan did an outstanding job. Very responsive, transparent, and the installation was neat, professional, and highly technical.', author: 'Midhun Mohan', stars: 5 },
        { text: 'Work completed very professionally, done strictly according to norms. Mr. Sudheesh Menakath and Praveen\'s team did a wonderful job. Totally satisfied — five stars!', author: 'Umashankar', stars: 5 },
        { text: 'Installed 14 KW across three homes. Mrs. Aparna\'s excellent communication and coordination made everything seamless, even for a Chennai client of a Coimbatore company.', author: 'Chandrahasa D.', stars: 5 },
        { text: 'Mr. Reegan was very polite and knowledgeable. He resolved our solar issue quickly and our system is working perfectly now. Thank you for the dedicated support!', author: 'Preethi T M', stars: 5 },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveReview(prev => (prev + 1) % REVIEWS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [REVIEWS.length]);

    // Helper to get combined array
    const getCombinedData = (dataObj) => {
        if (Array.isArray(dataObj)) return dataObj;
        return [...(dataObj.residential || []), ...(dataObj.commercial || []), ...(dataObj.waterHeater || [])];
    };

    // Helper: filter an array by selected state (null/Overall = no filter)
    const filterByState = (arr) => {
        if (!selectedState || selectedState === 'Overall') return arr;
        return arr.filter(item => (item.State || '').toLowerCase() === selectedState.toLowerCase());
    };

    // Helper: get state-filtered data object
    const getStateFilteredData = () => ({
        residential: filterByState(data.residential || []),
        commercial: filterByState(data.commercial || []),
        waterHeater: filterByState(data.waterHeater || [])
    });

    // Helper to calculate totals for a specific array
    const calculateStats = (arr) => {
        return {
            homes: arr.reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0),
            savings: arr.reduce((acc, curr) => acc + (Number(curr['Savings_Estimate']) || 0), 0),
            capacity: arr.reduce((acc, curr) => acc + (Number(curr['Capacity_kW']) || 0), 0)
        };
    };

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            const response = await getInstallations();
            if (response.status === 'success') {
                setData(response.data);
                localStorage.setItem('kondaas_dashboard_data_v2', JSON.stringify(response.data));
            }
        };
        fetchData();
    }, []);

    // Update Stats when Data, Tab, or State changes
    useEffect(() => {
        const stateData = getStateFilteredData();
        let currentArray = [];
        if (!activeTab) {
            currentArray = getCombinedData(stateData);
        } else {
            currentArray = stateData[activeTab] || [];
        }
        setStats(calculateStats(currentArray));
    }, [data, activeTab, selectedState]);

    // Active Display Data (Filtered by State, Tab, Pincode, or District)
    const stateFilteredData = getStateFilteredData();
    const baseDisplayData = !activeTab ? getCombinedData(stateFilteredData) : (stateFilteredData[activeTab] || []);
    const filteredData = pincode
        ? baseDisplayData.filter(item => item.Pincode?.toString().includes(pincode))
        : districtParam
            ? baseDisplayData.filter(item =>
                (item.District || item.City || '').toLowerCase() === districtParam.toLowerCase()
            )
            : baseDisplayData;

    const localHomes = filteredData.reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0);
    const localSavings = filteredData.reduce((acc, curr) => acc + (Number(curr['Savings_Estimate']) || 0), 0);
    const district = districtParam || filteredData[0]?.District || filteredData[0]?.City;

    const getLocalSubTotals = () => {
        if (activeTab || (!pincode && !districtParam)) return null;

        const filterFn = (item) => pincode
            ? item.Pincode?.toString().includes(pincode)
            : (item.District || item.City || '').toLowerCase() === districtParam.toLowerCase();

        const countByTab = (tabData) =>
            (tabData || []).filter(filterFn)
                .reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0);

        return {
            residential: countByTab(stateFilteredData.residential),
            commercial: countByTab(stateFilteredData.commercial),
            waterHeater: countByTab(stateFilteredData.waterHeater)
        };
    };
    const localSubTotals = getLocalSubTotals();

    // Safe navigation helper
    const handleSearchNavigate = () => {
        // Default to district mode, UNLESS we are specifically viewing a pincode result
        const modeQuery = pincode ? 'mode=pincode' : 'mode=district';
        if (activeTab) {
            navigate(`/search?tab=${activeTab}&${modeQuery}`);
        } else {
            navigate(`/search?${modeQuery}`);
        }
    };

    return (
        <TVLayout>
            <div className="w-full h-full relative overflow-hidden bg-brand-gray flex flex-col">
                {/* Header */}
                <header className="bg-brand-red text-white px-[4vw] py-[2vh] shadow-lg z-20 flex justify-between items-center shrink-0 h-[10vh]">
                    <div>
                        <div className="flex items-center gap-[1vw]">
                            <div className="bg-white p-[0.5vh] rounded">
                                <svg className="w-[4vh] h-[4vh] text-brand-red" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                            </div>
                            <h1 className="text-[3.5vh] font-bold tracking-tight">Kondaas | <span className="font-light opacity-90">SOLAR SYSTEMS</span></h1>
                        </div>
                        <p className="text-[2vh] opacity-90 mt-[0.5vh] font-medium ml-[4vh]">Best Solar Installer Across South India</p>
                    </div>

                    {/* State Filter Dropdown */}
                    <div className="relative" style={{ zIndex: 100 }}>
                        <button
                            onClick={() => setStateDropdownOpen(prev => !prev)}
                            className="flex items-center gap-[0.8vw] bg-white/15 border border-white/30 rounded-[1.5vh] px-[1.5vw] py-[1vh] transition-all duration-200"
                        >
                            <svg className="w-[2.2vh] h-[2.2vh] opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
                            <span className="text-[1.8vh] font-bold">{selectedState}</span>
                            <svg className={`w-[2vh] h-[2vh] opacity-70 transition-transform duration-200 ${stateDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
                        </button>

                        {stateDropdownOpen && (
                            <div className="absolute right-0 top-full mt-[0.8vh] w-[14vw] bg-white rounded-[1.5vh] shadow-2xl border border-slate-100 overflow-hidden">
                                {STATES.map(state => (
                                    <button
                                        key={state}
                                        onClick={() => { setSelectedState(state); setStateDropdownOpen(false); }}
                                        className={`w-full flex items-center justify-between px-[1.2vw] py-[1.2vh] text-[1.7vh] font-semibold transition-colors ${selectedState === state
                                            ? 'bg-brand-red text-white'
                                            : 'text-slate-700'}`}
                                    >
                                        <span>{state}</span>
                                        {selectedState === state && (
                                            <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7" /></svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </header>

                {/* 
                    MODE 1: RESULT OVERLAY (Active when pincode exists)
                    Matches the reference image: Large centered card, glassmorphism, focus on numbers.
                */}
                {(pincode || districtParam) ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                        </div>

                        {/* Back Button - Top Left */}
                        <div className="absolute top-[3vh] left-[1.5vw] z-[60]">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-[0.5vw] text-slate-600 transition-all duration-300 px-[1.5vw] py-[1vh] rounded-full backdrop-blur-sm shadow-sm border border-transparent"
                            >
                                <AnimatedIcon src="https://cdn.lordicon.com/jxwksgwv.json" colors={{ primary: "#475569", secondary: "#d71920" }} size="3.5vh" style={{ transform: 'rotate(180deg)' }} />
                                <span className="text-[2vh] font-bold">Back</span>
                            </button>
                        </div>

                        {/* Main Content Container */}
                        <div className="relative z-10 w-full max-w-[75vw] mx-auto px-4 flex flex-col items-center">

                            {/* The Card */}
                            <div className="relative bg-white rounded-[4vh] shadow-2xl p-[5vh] w-full flex flex-col items-center text-center border border-white/50 backdrop-blur-sm">

                                {/* Decorative "Ribbons" - Simulated with absolute positioning */}
                                <div className="absolute top-1/2 -left-[1vw] w-[1vw] h-[20vh] bg-red-700 rounded-l-lg transform -translate-y-1/2 -z-10 shadow-lg hidden md:block"></div>
                                <div className="absolute top-1/2 -right-[1vw] w-[1vw] h-[20vh] bg-red-700 rounded-r-lg transform -translate-y-1/2 -z-10 shadow-lg hidden md:block"></div>

                                {/* Side Ribbons Visuals (CSS shapes) */}
                                <div className="absolute top-[40%] -left-[3vw] w-[4vw] h-[30vh] bg-gradient-to-b from-red-600 to-red-800 transform skew-y-12 -z-10 rounded-l-3xl shadow-xl hidden lg:block border-r border-red-900/20"></div>
                                <div className="absolute top-[40%] -right-[3vw] w-[4vw] h-[30vh] bg-gradient-to-b from-red-600 to-red-800 transform -skew-y-12 -z-10 rounded-r-3xl shadow-xl hidden lg:block border-l border-red-900/20"></div>


                                {/* Header Section */}
                                <div className="flex items-center gap-[1vw] mb-[1vh]">
                                    {/* Kondaas Logo Placeholder - replacing text with a more visual approach */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-[0.5vw]">
                                            <div className="bg-brand-red text-white p-[0.3vh] rounded shadow-sm">
                                                <svg className="w-[3vh] h-[3vh]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                                            </div>
                                            <h2 className="text-[3.5vh] font-medium text-slate-700 leading-none" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                                                Kondaas {!activeTab ? 'Homes' : <span className="text-brand-red font-bold">{activeTab === 'residential' ? 'Residentials' : activeTab === 'commercial' ? 'Commercials' : 'Water Heaters'}</span>} in <span className="text-brand-red font-bold">{districtParam || pincode}</span>
                                            </h2>
                                        </div>
                                        {districtParam ? (
                                            <p className="text-[2.5vh] font-bold text-slate-500 ml-[0.5vw] uppercase tracking-wider" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                {stateParam}
                                            </p>
                                        ) : district && (
                                            <p className="text-[2.5vh] font-bold text-slate-500 ml-[0.5vw] uppercase tracking-wider" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                {district}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Category Filter Tabs */}
                                <div className="flex justify-center gap-[1vw] mb-[2vh] w-full">
                                    {[
                                        { id: 'residential', label: 'Residential', icon: <svg className="w-[2vh] h-[2vh]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
                                        { id: 'commercial', label: 'Commercial', icon: <svg className="w-[2vh] h-[2vh]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /></svg> },
                                        { id: 'waterHeater', label: 'Water Heater', icon: <svg className="w-[2vh] h-[2vh]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="4" width="12" height="16" rx="3" /><circle cx="12" cy="12" r="2" /><path d="M9 4V2" /><path d="M15 4V2" /></svg> },
                                    ].map(tab => {
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(isActive ? null : tab.id)}
                                                className={`flex items-center gap-[0.5vw] px-[1.8vw] py-[1vh] rounded-[1.5vh] text-[1.8vh] font-bold transition-all duration-200 ${isActive
                                                    ? 'bg-brand-red text-white shadow-lg'
                                                    : 'bg-slate-100 text-slate-600'}`}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Main Number & Sub-totals */}
                                <div className="flex flex-col items-center">
                                    <h1 className="text-[20vh] leading-none font-bold text-brand-red font-sans tracking-tight drop-shadow-xl"
                                        style={{
                                            textShadow: '4px 4px 0px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.15)' // "DVD Back Shadow" effect
                                        }}>
                                        {localHomes}
                                    </h1>

                                    {/* Fixed-height spacer — keeps card height identical in all modes */}
                                    <div className="h-[8vh] flex flex-col items-center justify-center">
                                        {!activeTab && localSubTotals && (
                                            <p className="text-slate-500 text-[2.5vh] font-medium drop-shadow-sm text-center">
                                                {localSubTotals.residential.toLocaleString()} Residential / {localSubTotals.commercial.toLocaleString()} Commercial / {localSubTotals.waterHeater.toLocaleString()} Water Heater
                                            </p>
                                        )}
                                        {activeTab && (
                                            <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-[2vh] text-center">
                                                KONDAAS {activeTab === 'residential' ? 'RESIDENTIALS' : activeTab === 'commercial' ? 'COMMERCIALS' : 'WATER HEATERS'} AROUND YOU!
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Savings Pill */}
                                <div className="bg-white border border-slate-100 rounded-full pl-[0.5vw] pr-[2vw] py-[1vh] flex items-center gap-[1vw] shadow-lg shadow-slate-200/50 mb-[5vh] transition-transform duration-300">
                                    <div className="bg-green-100 w-[6vh] h-[6vh] rounded-full flex items-center justify-center shrink-0">
                                        <IndianRupee className="text-green-700 w-[3vh] h-[3vh]" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex items-baseline gap-[0.5vw]">
                                        <span className="text-green-700 font-bold text-[4vh]">₹{(localSavings / 100000).toFixed(2)}L</span>
                                        <span className="text-slate-500 font-medium whitespace-nowrap text-[2vh]">Savings generated near you</span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={handleSearchNavigate}
                                    className="w-full max-w-[40vw] bg-gradient-to-r from-red-600 to-red-500 text-white text-[2.5vh] font-bold py-[2vh] rounded-[2vh] shadow-xl shadow-red-500/30 transition-all flex items-center justify-center gap-[1vw] relative overflow-hidden"
                                >
                                    <span className="relative z-10">Enter Another {districtParam ? 'District' : 'PIN Code'}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[4vh] w-[4vh] relative z-10 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>

                            {/* Footer Stats */}
                            <div className="mt-[4vh] w-full grid grid-cols-3 gap-[4vw] text-center max-w-[60vw]">
                                <div className="flex flex-col items-center gap-[1vh] cursor-default">
                                    <div className="w-[8vh] h-[8vh] rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-[4vh] w-[4vh] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[2.5vh] text-slate-800">30,000+</p>
                                        <p className="text-slate-500 text-[1.5vh]">Homes Delivered</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-[1vh] cursor-default">
                                    <div className="w-[8vh] h-[8vh] rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform">
                                        <Zap className="h-[4vh] w-[4vh] text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[2.5vh] text-slate-800">50MW+</p>
                                        <p className="text-slate-500 text-[1.5vh]">Powered by Solar</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-[1vh] cursor-default">
                                    <div className="w-[8vh] h-[8vh] rounded-full bg-white border-2 border-green-500 flex items-center justify-center shadow-lg transition-transform">
                                        {/* Leaf Icon */}
                                        <svg className="w-[4vh] h-[4vh] text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="flex flex-col items-start translate-x-2">
                                            <span className="text-[1.2vh] text-slate-400 font-medium">Trusted by</span>
                                            <span className="font-bold text-[2.2vh] text-brand-red">1,00,000+ Families</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    /* 
                        MODE 2: AMBIENT DASHBOARD (Default Grid) 
                        Active when no pincode is selected.
                    */
                    <div className="w-full h-[90vh] grid grid-cols-[19vw_51vw_25vw] gap-[1vw] p-[1.5vw] overflow-hidden">

                        {/* LEFT COLUMN: Statistics */}
                        <div className="flex flex-col gap-[2vh] h-full justify-between">
                            {/* Stat Card 1: Homes */}
                            <div className="bg-white p-[3vh] rounded-[2vh] shadow-lg border border-slate-100 flex flex-col items-start justify-center flex-1 min-h-0 transition-shadow">
                                <div className="flex items-center gap-[1vh] mb-[1vh] text-brand-red">
                                    <AnimatedIcon src="https://cdn.lordicon.com/surcxhka.json" trigger="loop" delay="2000" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                    <span className="font-bold text-[1.8vh] uppercase tracking-wider text-slate-700">
                                        {!activeTab ? 'Overall' : activeTab === 'waterHeater' ? 'Water Heater' : activeTab}
                                    </span>
                                </div>
                                <div className="text-[5.5vh] font-bold text-slate-800 mb-[1vh] leading-tight flex flex-col gap-[0.5vh]">
                                    {activeTab ? (
                                        <span>{stats.homes.toLocaleString()}</span>
                                    ) : (
                                        <>
                                            <span>{stats.homes.toLocaleString()}</span>
                                            <p className="text-slate-500 text-[1.8vh] font-medium mt-[0.5vh]">
                                                {(stateFilteredData.residential || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} res / {(stateFilteredData.commercial || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} com / {(stateFilteredData.waterHeater || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} heater
                                            </p>
                                        </>
                                    )}
                                </div>
                                {activeTab && (
                                    <p className="text-slate-500 text-[1.8vh] font-medium mt-[1vh]">Total installations across India</p>
                                )}
                            </div>

                            {/* Stat Card 2: Savings */}
                            <div className="bg-white p-[3vh] rounded-[2vh] shadow-lg border border-slate-100 flex flex-col items-start justify-center flex-1 min-h-0 transition-shadow">
                                <div className="flex items-center gap-[1vh] mb-[1vh] text-brand-red">
                                    <AnimatedIcon src="https://cdn.lordicon.com/qhviklyi.json" trigger="loop" delay="2500" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                    <span className="font-bold text-[1.8vh] uppercase tracking-wider text-slate-700">Savings</span>
                                </div>
                                <div className="text-[5.5vh] font-bold text-slate-800 mb-[1vh] leading-tight">
                                    ₹ {(stats.savings / 10000000).toFixed(2)} Cr
                                </div>
                                <p className="text-slate-500 text-[1.8vh] font-medium">Estimated annual savings</p>
                            </div>

                            {/* Stat Card 3: Energy */}
                            <div className="bg-white p-[3vh] rounded-[2vh] shadow-lg border border-slate-100 flex flex-col items-start justify-center flex-1 min-h-0 transition-shadow">
                                <div className="flex items-center gap-[1vh] mb-[1vh] text-brand-red">
                                    <AnimatedIcon src="https://cdn.lordicon.com/sbiheqdr.json" trigger="loop" delay="3000" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                    <span className="font-bold text-[1.8vh] uppercase tracking-wider text-slate-700">Capacity</span>
                                </div>
                                <div className="text-[5.5vh] font-bold text-slate-800 mb-[1vh] leading-tight">
                                    {Math.round(stats.capacity || 0).toLocaleString()} kW
                                </div>
                                <p className="text-slate-500 text-[1.8vh] font-medium">Total installed solar capacity</p>
                            </div>
                        </div>

                        {/* CENTER COLUMN: Map */}
                        <div className="flex flex-col h-full bg-slate-200 rounded-[3vh] border-[0.5vh] border-white shadow-xl overflow-hidden relative">
                            {/* Light Mode Map */}
                            <IndiaMap data={filteredData} darkMode={false} selectedState={selectedState} className="h-full w-full" />

                            {/* Ambient Search Button */}
                            <div className="absolute bottom-[5vh] left-1/2 transform -translate-x-1/2 z-[400] w-full px-[5vw]">
                                <button
                                    onClick={handleSearchNavigate}
                                    className="w-full bg-white/90 backdrop-blur text-slate-800 text-[2.5vh] font-bold py-[2vh] rounded-full shadow-lg border border-slate-200 flex items-center justify-between px-[2vw] search-btn-trigger"
                                >
                                    <div className="flex items-center gap-[1vw]">
                                        <AnimatedIcon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop" delay="3000" target=".search-btn-trigger" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                        <span>Find matches near you</span>
                                    </div>
                                    <div className="bg-brand-red text-white p-[0.5vh] rounded-full transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[4vh] h-[4vh]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Lists & Tabs */}
                        <div className="flex flex-col gap-[2vh] h-full min-h-0">

                            {/* CATEGORY TABS */}
                            <div className="bg-white p-[0.8vh] rounded-[2vh] shadow-lg border border-slate-100 flex justify-between shrink-0">
                                {[
                                    { id: 'residential', label: 'Residential' },
                                    { id: 'commercial', label: 'Commercial' },
                                    { id: 'waterHeater', label: 'Water Heater' }
                                ].map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(isActive ? null : tab.id)}
                                            className={`flex-1 flex items-center justify-center py-[1.2vh] px-[0.5vw] rounded-[1.5vh] text-[1.4vh] 2xl:text-[1.6vh] whitespace-nowrap overflow-hidden text-ellipsis font-bold transition-all duration-300 mx-[0.2vw] ${isActive
                                                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-500/30 transform scale-[1.02]'
                                                : 'bg-slate-50 text-slate-600'
                                                }`}
                                        >
                                            <span className="truncate">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="bg-white p-[1.5vh] rounded-[2vh] shadow-lg border border-slate-100 shrink-0 flex flex-col min-h-0 overflow-hidden">
                                <h3 className="font-bold text-[2vh] 2xl:text-[2.5vh] text-slate-800 mb-[1vh] border-b border-slate-100 pb-[1vh] flex justify-between items-center shrink-0">
                                    <span className="truncate pr-[1vw]">Top Cities {activeTab ? `(${activeTab.replace(/([A-Z])/g, ' $1').trim()})` : ''}</span>
                                    <span className="text-[1.5vh] font-semibold text-slate-500 px-[1vh] py-[0.5vh] bg-slate-100 rounded border border-slate-200 shrink-0">Live</span>
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-[0.5vh] pr-[0.5vw] custom-scrollbar">
                                    {/* Dynamic Top Cities Data */}
                                    {Object.entries(filteredData.reduce((acc, curr) => {
                                        const city = curr.City || 'Unknown';
                                        const count = Number(curr['Installations']) || 0;
                                        acc[city] = (acc[city] || 0) + count;
                                        return acc;
                                    }, {}))
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 3)
                                        .map(([city, count], i) => (
                                            <div key={i} className="flex justify-between items-center p-[1vh] rounded-lg transition-colors">
                                                <div className="flex items-center gap-[1vw] min-w-0 pr-[1vw]">
                                                    <span className="text-brand-red font-bold font-mono w-[3vh] text-right text-[2vh] shrink-0">#{i + 1}</span>
                                                    <span className="text-slate-700 font-bold text-[2vh] truncate">{city}</span>
                                                </div>
                                                <span className="text-brand-red font-bold text-[2vh] bg-red-50 px-[1.5vh] py-[0.5vh] rounded-md min-w-[5vh] text-center shrink-0">
                                                    {count}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* TOP REVIEWS */}
                            <div className="bg-white rounded-[2vh] shadow-lg border border-slate-100 flex-1 flex flex-col min-h-0 overflow-hidden">

                                {/* Header row */}
                                <h3 className="font-bold text-[2vh] 2xl:text-[2.5vh] text-slate-800 mb-[1vh] border-b border-slate-100 pb-[1vh] flex justify-between items-center shrink-0 px-[1.5vh] pt-[1.5vh]">
                                    <span>Top Reviews</span>
                                    <span className="text-[1.5vh] font-semibold text-slate-500 px-[1vh] py-[0.5vh] bg-slate-100 rounded border border-slate-200 shrink-0">7,050 reviews</span>
                                </h3>

                                {/* Rating hero - centered */}
                                <div className="flex flex-col items-center justify-center gap-[0.8vh] px-[1.5vw] py-[1.5vh] shrink-0">
                                    <div className="flex items-end gap-[0.8vw]">
                                        <span className="text-[6vh] font-black text-slate-900 leading-none tracking-tight">4.8</span>
                                        <div className="flex flex-col pb-[0.5vh]">
                                            <div className="flex items-center gap-[0.25vw] mb-[0.2vh]">
                                                <svg className="w-0 h-0 absolute" aria-hidden="true">
                                                    <defs>
                                                        <linearGradient id="star48" x1="0" x2="100%" y1="0" y2="0">
                                                            <stop offset="80%" stopColor="#fbbf24" />
                                                            <stop offset="80%" stopColor="#e2e8f0" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                {[1, 2, 3, 4].map(s => (
                                                    <svg key={s} className="w-[2vh] h-[2vh] text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                                {/* 5th star: 80% filled = 4.8 */}
                                                <svg className="w-[2vh] h-[2vh]" viewBox="0 0 20 20">
                                                    <path fill="url(#star48)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                            <span className="text-[1.1vh] text-slate-400 font-medium">out of 5.0</span>
                                        </div>
                                    </div>
                                    <span className="text-[1.2vh] text-slate-400 font-medium tracking-widest uppercase">Based on 7,050 reviews</span>
                                </div>

                                {/* Trust score bars */}
                                <div className="flex-1 flex flex-col justify-center px-[1.8vw] gap-[1.2vh] min-h-0 border-t border-slate-100 py-[1.5vh]">
                                    {[
                                        { label: 'Service', score: 4.9, pct: 98 },
                                        { label: 'Installation', score: 4.8, pct: 96 },
                                        { label: 'Support', score: 5.0, pct: 100 },
                                    ].map(({ label, score, pct }) => (
                                        <div key={label} className="flex items-center gap-[1vw]">
                                            <span className="text-[1.5vh] font-semibold text-slate-600 w-[6vw] shrink-0">{label}</span>
                                            <div className="flex-1 bg-slate-100 rounded-full h-[1.2vh] overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400"
                                                    style={{ width: `${pct}%`, transition: 'width 1s ease-in-out' }}
                                                />
                                            </div>
                                            <span className="text-[1.5vh] font-bold text-brand-red w-[3vw] text-right shrink-0">{score}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Slideshow strip - taller + more visible */}
                                <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white shrink-0">
                                    <div
                                        key={activeReview}
                                        className="px-[1.5vw] py-[1.5vh]"
                                        style={{ animation: 'slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                                    >
                                        <p className="text-[1.5vh] text-slate-600 italic leading-relaxed line-clamp-2 mb-[1vh]">
                                            "{REVIEWS[activeReview].text}"
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-[0.8vw]">
                                                <div className="w-[3.5vh] h-[3.5vh] rounded-full bg-gradient-to-br from-brand-red to-red-700 flex items-center justify-center text-white font-bold text-[1.5vh] shrink-0">
                                                    {REVIEWS[activeReview].author[0]}
                                                </div>
                                                <span className="text-[1.4vh] font-bold text-slate-700">{REVIEWS[activeReview].author}</span>
                                            </div>
                                            <div className="flex gap-[0.4vw] items-center">
                                                {REVIEWS.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setActiveReview(i)}
                                                        className={`rounded-full transition-all duration-300 ${i === activeReview ? 'w-[1.5vw] h-[0.8vh] bg-brand-red' : 'w-[0.8vh] h-[0.8vh] bg-slate-300'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TVLayout>
    );
};

export default TVDashboard;
