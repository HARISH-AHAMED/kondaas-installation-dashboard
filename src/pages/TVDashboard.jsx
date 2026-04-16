import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TVLayout from '../components/tv/TVLayout';
import IndiaMap from '../components/dashboard/IndiaMap';
import { getInstallations } from '../services/api';
import { IndianRupee, Zap } from 'lucide-react';
import AnimatedIcon from '../components/common/AnimatedIcon';

// States available in the dashboard filter
const STATES = ['Overall', 'Tamil Nadu', 'Kerala'];

const TVDashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const pincode = searchParams.get('pincode');
    const districtParam = searchParams.get('district');
    const stateParam = searchParams.get('state');
    const urlTab = searchParams.get('tab');

    const [data, setData] = useState(() => {
        const cached = localStorage.getItem('kondaas_dashboard_data_v2');
        return cached ? JSON.parse(cached) : { residential: [], commercial: [], waterHeater: [] };
    });

    const [activeTab, setActiveTab] = useState(urlTab || null);
    const [stats, setStats] = useState({ homes: 0, savings: 0, capacity: 0 });
    const [activeReview, setActiveReview] = useState(0);
    const [selectedState, setSelectedState] = useState('Overall');
    const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

    const REVIEWS = [
        { text: 'Amazing experience! Mr. Manoj and Mr. Praveen\'s team dealt with the work politely and carefully. Thanks to Kondaas Automation and the whole team!', author: 'Chandrasekaran P.', stars: 5, tenure: '3 Year Customer' },
        { text: 'Sangamesvaran, Sudheesh, Praveen & Vel Murugan did an outstanding job. Very responsive, transparent, and the installation was neat, professional, and highly technical.', author: 'Midhun Mohan', stars: 5, tenure: '5 Year Customer' },
        { text: 'Work completed very professionally, done strictly according to norms. Mr. Sudheesh Menakath and Praveen\'s team did a wonderful job. Totally satisfied — five stars!', author: 'Umashankar', stars: 5, tenure: '10 Year Customer' },
        { text: 'Installed 14 KW across three homes. Mrs. Aparna\'s excellent communication and coordination made everything seamless, even for a Chennai client of a Coimbatore company.', author: 'Chandrahasa D.', stars: 5, tenure: '3 Year Customer' },
        { text: 'Mr. Reegan was very polite and knowledgeable. He resolved our solar issue quickly and our system is working perfectly now. Thank you for the dedicated support!', author: 'Preethi T M', stars: 5, tenure: '5 Year Customer' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveReview(prev => (prev + 1) % REVIEWS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [REVIEWS.length]);

    const getCombinedData = (dataObj) => {
        if (Array.isArray(dataObj)) return dataObj;
        return [...(dataObj.residential || []), ...(dataObj.commercial || []), ...(dataObj.waterHeater || [])];
    };

    const filterByState = (arr) => {
        if (!selectedState || selectedState === 'Overall') return arr;
        return arr.filter(item => (item.State || '').toLowerCase() === selectedState.toLowerCase());
    };

    const getStateFilteredData = () => ({
        residential: filterByState(data.residential || []),
        commercial: filterByState(data.commercial || []),
        waterHeater: filterByState(data.waterHeater || [])
    });

    const calculateStats = (arr) => {
        return {
            homes: arr.reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0),
            savings: arr.reduce((acc, curr) => acc + (Number(curr['Savings_Estimate']) || 0), 0),
            capacity: arr.reduce((acc, curr) => acc + (Number(curr['Capacity_kW']) || 0), 0)
        };
    };

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

    const handleSearchNavigate = () => {
        const modeQuery = pincode ? 'mode=pincode' : 'mode=district';
        if (activeTab) {
            navigate(`/search?tab=${activeTab}&${modeQuery}`);
        } else {
            navigate(`/search?${modeQuery}`);
        }
    };

    return (
        <TVLayout>
            <div className="w-full h-full relative overflow-hidden bg-[#F3F4F6] flex flex-col">
                <header className="bg-[#DC2626] text-white px-[4vw] py-[2vh] shadow-lg z-20 flex justify-between items-center shrink-0 h-[10vh]">
                    <div>
                        <div className="flex items-center gap-[1vw]">
                            <div className="bg-white p-[0.5vh] rounded">
                                <svg className="w-[4vh] h-[4vh] text-[#DC2626]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                            </div>
                            <h1 className="text-[4vh] font-bold tracking-tight">Kondaas | <span className="font-light opacity-90">SOLAR SYSTEMS</span></h1>
                        </div>
                        <p className="text-[2.2vh] opacity-90 mt-[0.5vh] font-medium ml-[4vh]">Best Solar Installer Across South India</p>
                    </div>

                    <div className="relative" style={{ zIndex: 100 }}>
                        <button
                            onClick={() => setStateDropdownOpen(prev => !prev)}
                            className="flex items-center gap-[0.8vw] bg-white/15 border border-white/30 rounded-[1.5vh] px-[1.5vw] py-[1vh] transition-all duration-200"
                        >
                            <svg className="w-[2.2vh] h-[2.2vh] opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
                            <span className="text-[1.9vh] font-bold">{selectedState}</span>
                            <svg className={`w-[2vh] h-[2vh] opacity-70 transition-transform duration-200 ${stateDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
                        </button>

                        {stateDropdownOpen && (
                            <div className="absolute right-0 top-full mt-[0.8vh] w-[14vw] bg-white rounded-[1.5vh] shadow-2xl border border-[#E5E7EB] overflow-hidden">
                                {STATES.map(state => (
                                    <button
                                        key={state}
                                        onClick={() => { setSelectedState(state); setStateDropdownOpen(false); }}
                                        className={`w-full flex items-center justify-between px-[1.2vw] py-[1.2vh] text-[1.8vh] font-semibold transition-colors ${selectedState === state
                                            ? 'bg-[#DC2626] text-white'
                                            : 'text-[#0A0A0A]'}`}
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

                {(pincode || districtParam) ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
                        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                        </div>
                        <div className="absolute top-[3vh] left-[1.5vw] z-[60]">
                            <button onClick={() => navigate('/')} className="flex items-center gap-[0.5vw] text-[#4B5563] transition-all duration-300 px-[1.5vw] py-[1vh] rounded-full backdrop-blur-sm shadow-sm border border-transparent">
                                <AnimatedIcon src="https://cdn.lordicon.com/jxwksgwv.json" colors={{ primary: "#0A0A0A", secondary: "#DC2626" }} size="3.5vh" style={{ transform: 'rotate(180deg)' }} />
                                <span className="text-[2.2vh] font-bold">Back</span>
                            </button>
                        </div>
                        <div className="relative z-10 w-full max-w-[75vw] mx-auto px-4 flex flex-col items-center">
                            <div className="relative bg-white rounded-[4vh] shadow-2xl p-[5vh] w-full flex flex-col items-center text-center border border-white/50 backdrop-blur-sm">
                                <div className="absolute top-1/2 -left-[1vw] w-[1vw] h-[20vh] bg-red-700 rounded-l-lg transform -translate-y-1/2 -z-10 shadow-lg hidden md:block"></div>
                                <div className="absolute top-1/2 -right-[1vw] w-[1vw] h-[20vh] bg-red-700 rounded-r-lg transform -translate-y-1/2 -z-10 shadow-lg hidden md:block"></div>
                                <div className="absolute top-[40%] -left-[3vw] w-[4vw] h-[30vh] bg-gradient-to-b from-red-600 to-red-800 transform skew-y-12 -z-10 rounded-l-3xl shadow-xl hidden lg:block border-r border-red-900/20"></div>
                                <div className="absolute top-[40%] -right-[3vw] w-[4vw] h-[30vh] bg-gradient-to-b from-red-600 to-red-800 transform -skew-y-12 -z-10 rounded-r-3xl shadow-xl hidden lg:block border-l border-red-900/20"></div>

                                <div className="flex items-center gap-[1vw] mb-[1vh]">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-[0.5vw]">
                                            <div className="bg-[#DC2626] text-white p-[0.3vh] rounded shadow-sm">
                                                <svg className="w-[3vh] h-[3vh]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                                            </div>
                                            <h2 className="text-[4vh] font-medium text-[#0A0A0A] leading-none">
                                                Kondaas {!activeTab ? 'Homes' : <span className="text-[#DC2626] font-bold">{activeTab === 'residential' ? 'Residentials' : activeTab === 'commercial' ? 'Commercials' : 'Water Heaters'}</span>} in <span className="text-[#DC2626] font-bold">{districtParam || pincode}</span>
                                            </h2>
                                        </div>
                                        <p className="text-[2.7vh] font-bold text-[#4B5563] uppercase tracking-wider">{districtParam ? stateParam : district}</p>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-[1vw] mb-[2vh] w-full">
                                    {['residential', 'commercial', 'waterHeater'].map(type => (
                                        <button key={type} onClick={() => setActiveTab(activeTab === type ? null : type)} className={`px-[1.8vw] py-[1vh] rounded-[1.5vh] text-[1.9vh] font-bold transition-all ${activeTab === type ? 'bg-[#DC2626] text-white shadow-lg' : 'bg-slate-100 text-[#4B5563]'}`}>
                                            {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col items-center">
                                    <h1 className="text-[23vh] leading-none font-bold text-[#DC2626] tracking-tight drop-shadow-xl" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>{localHomes}</h1>
                                    <div className="h-[8vh] flex flex-col items-center justify-center">
                                        {!activeTab && localSubTotals && (
                                            <p className="text-[#4B5563] text-[2.7vh] font-medium text-center">
                                                {localSubTotals.residential} Residential / {localSubTotals.commercial} Commercial / {localSubTotals.waterHeater} Water Heater
                                            </p>
                                        )}
                                        {activeTab && <p className="text-[#4B5563] font-bold tracking-[0.2em] uppercase text-[2.2vh]">KONDAAS {activeTab.toUpperCase()} AROUND YOU!</p>}
                                    </div>
                                </div>

                                <div className="bg-white border border-[#E5E7EB] rounded-full py-[1vh] px-[2vw] flex items-center gap-[1vw] shadow-lg mb-[5vh]">
                                    <div className="bg-green-100 w-[6vh] h-[6vh] rounded-full flex items-center justify-center"><IndianRupee className="text-green-700 w-[3vh] h-[3vh]" strokeWidth={2.5} /></div>
                                    <span className="text-green-700 font-bold text-[4.6vh]">₹{(localSavings / 100000).toFixed(2)}L <span className="text-[#4B5563] font-medium text-[2.2vh]">Savings near you</span></span>
                                </div>

                                <button onClick={handleSearchNavigate} className="w-full max-w-[40vw] bg-[#DC2626] text-white text-[2.7vh] font-bold py-[2vh] rounded-[2vh] shadow-xl flex items-center justify-center gap-[1vw]">
                                    Enter Another {districtParam ? 'District' : 'PIN Code'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 
                        MODE 2: AMBIENT DASHBOARD (Default Grid) 
                        Active when no pincode is selected.
                    */
                    <div className="flex-1 w-full grid grid-cols-[20vw_49vw_26vw] gap-[1.2vw] px-[1.5vw] pt-[1.5vh] pb-[1.5vh] overflow-hidden">
                        {/* LEFT COLUMN */}
                        <div className="grid grid-rows-3 gap-[1.5vh] h-full overflow-hidden">
                            {/* Installations Card */}
                            <div className="bg-white p-[2.5vh] rounded-[2vh] shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-[#E5E7EB] flex flex-col min-h-0">
                                <div className="flex items-center gap-[1.2vh] mb-[1vh] text-[#DC2626] shrink-0">
                                    <AnimatedIcon src="https://cdn.lordicon.com/surcxhka.json" trigger="loop" delay="2000" colors={{ primary: "#DC2626", secondary: "#0A0A0A" }} size="4vh" />
                                    <span className="font-bold text-[1.7vh] uppercase tracking-[0.1em] text-[#6B7280]">{!activeTab ? 'Overall' : activeTab}</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center min-h-0">
                                    <div className="text-[8.6vh] font-bold text-[#0A0A0A] leading-none tracking-tight">
                                        {stats.homes.toLocaleString()}
                                    </div>
                                    <p className="text-[#4B5563] text-[1.7vh] font-bold mt-[0.5vh] uppercase tracking-wider">Installations</p>
                                </div>
                                {!activeTab && (
                                    <div className="mt-[0.5vh] text-[1.4vh] 2xl:text-[1.6vh] font-medium text-[#6B7280] shrink-0">
                                        {(stateFilteredData.residential || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} res / {(stateFilteredData.commercial || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} com / {(stateFilteredData.waterHeater || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} heater
                                    </div>
                                )}
                            </div>

                            {/* Savings Card */}
                            <div className="bg-white p-[2.5vh] rounded-[2vh] shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-[#E5E7EB] flex flex-col min-h-0">
                                <div className="flex items-center gap-[1.2vh] mb-[1vh] text-[#DC2626] shrink-0">
                                    <AnimatedIcon src="https://cdn.lordicon.com/qhviklyi.json" trigger="loop" delay="2500" colors={{ primary: "#DC2626", secondary: "#0A0A0A" }} size="4vh" />
                                    <span className="font-bold text-[1.7vh] uppercase tracking-[0.1em] text-[#6B7280]">Savings</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="text-[8.6vh] font-bold text-[#0A0A0A] leading-none tracking-tight">₹ {(stats.savings / 10000000).toFixed(2)} Cr</div>
                                    <p className="text-[#4B5563] text-[1.7vh] font-medium mt-[0.5vh]">Estimated annual savings</p>
                                </div>
                            </div>

                            {/* Capacity Card */}
                            <div className="bg-white p-[2.5vh] rounded-[2vh] shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-[#E5E7EB] flex flex-col min-h-0">
                                <div className="flex items-center gap-[1.2vh] mb-[1vh] text-[#DC2626] shrink-0">
                                    <AnimatedIcon src="https://cdn.lordicon.com/sbiheqdr.json" trigger="loop" delay="3000" colors={{ primary: "#DC2626", secondary: "#0A0A0A" }} size="4vh" />
                                    <span className="font-bold text-[1.7vh] uppercase tracking-[0.1em] text-[#6B7280]">Capacity</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="text-[8.6vh] font-bold text-[#0A0A0A] leading-none tracking-tight">{Math.round(stats.capacity || 0).toLocaleString()} <span className="text-[4vh] text-[#6B7280] font-bold">kW</span></div>
                                    <p className="text-[#4B5563] text-[1.7vh] font-medium mt-[0.5vh]">Total installed solar capacity</p>
                                </div>
                            </div>
                        </div>

                        {/* CENTER COLUMN */}
                        <div className="flex flex-col gap-[1.5vh] h-full overflow-hidden">
                            <div className="flex-1 bg-white rounded-[2vh] border border-[#E5E7EB] shadow-[0_0_25px_rgba(0,0,0,0.07)] relative overflow-hidden min-h-0">
                                <IndiaMap data={filteredData} darkMode={false} selectedState={selectedState} className="h-full w-full" />
                                <div className="absolute bottom-[2vh] left-1/2 -translate-x-1/2 w-full px-[2vw] z-[400]">
                                    <button 
                                        onClick={handleSearchNavigate}
                                        className="w-full bg-white/95 backdrop-blur-sm rounded-full shadow-[0_0_25px_rgba(0,0,0,0.1)] border border-[#E5E7EB] flex items-center justify-between p-[0.6vh] pl-[1.8vw] hover:bg-white active:scale-95 transition-all group"
                                    >
                                        <span className="text-[#0A0A0A] text-[2.4vh] font-bold">Find matches near you</span>
                                        <div className="bg-[#DC2626] text-white p-[1.2vh] rounded-full shadow-lg group-hover:scale-105 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-[3vh] w-[3vh]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-[1.5vh] h-full overflow-hidden">
                            {/* Category Filter Tabs */}
                            <div className="flex gap-[0.8vw] w-full shrink-0">
                                {['residential', 'commercial', 'waterHeater'].map(type => (
                                    <button 
                                        key={type} 
                                        onClick={() => setActiveTab(activeTab === type ? null : type)}
                                        className={`flex-1 py-[1.2vh] rounded-[1.5vh] text-[1.5vh] font-bold uppercase tracking-wider transition-all shadow-sm border ${activeTab === type ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-lg' : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-slate-50 shadow-[0_0_15px_rgba(0,0,0,0.04)]'}`}
                                    >
                                        {type === 'waterHeater' ? 'Heater' : type}
                                    </button>
                                ))}
                            </div>

                            {/* Legacy Customers (Reformatted to white theme) */}
                            <div className="bg-white p-[2vh] rounded-[2vh] shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-[#E5E7EB] shrink-0">
                                <div className="flex justify-between items-start mb-[0.8vh]">
                                    <h3 className="font-bold text-[1.9vh] text-[#0A0A0A]">Legacy Customers</h3>
                                    <span className="text-emerald-500 text-[1.1vh] font-bold uppercase tracking-widest">Verified Trust</span>
                                </div>
                                <div className="space-y-[0.6vh]">
                                    {[{ l: '3 Year Customers', a: 234, t: 420 }, { l: '5 Year Customers', a: 180, t: 285 }, { l: '10 Year Customers', a: 95, t: 128 }].map(item => (
                                        <div key={item.l} className="flex justify-between items-center bg-slate-50/50 p-[1vh] rounded-xl border border-[#E5E7EB]">
                                            <span className="font-bold text-[#4B5563] text-[1.5vh]">{item.l}</span>
                                            <span className="font-bold text-[#0A0A0A] text-[1.7vh]">{item.a} / {item.t}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Service Result */}
                            <div className="bg-white p-[1.8vh] px-[2vh] rounded-[2vh] shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-[#E5E7EB] shrink-0">
                                <div className="mb-[1vh]">
                                    <h3 className="font-bold text-[1.7vh] text-[#4B5563] uppercase tracking-widest mb-[0.2vh]">Service</h3>
                                    <p className="text-[#4B5563] font-medium text-[1.4vh]">Avg Downtime Across Customers: 3.1 hrs</p>
                                </div>
                                
                                <div className="flex flex-col gap-[0.6vh]">
                                    {[{ l: '3 Year Customers', v: '1,680', d: 2.5 }, { l: '5 Year Customers', v: '2,140', d: 3.1 }, { l: '10 Year Customers', v: '3,520', d: 3.8 }].map(item => (
                                        <div key={item.l} className="flex items-center bg-slate-50/50 py-[0.8vh] px-[1vh] rounded-xl border border-[#E5E7EB] gap-[1vw]">
                                            <span className="font-bold text-[#4B5563] text-[1.5vh] flex-1">{item.l}</span>
                                            <span className="font-bold text-[#0A0A0A] text-[1.6vh] flex-1 text-center">{item.v} <span className="text-[#6B7280] font-bold text-[1.2vh] uppercase">Visits</span></span>
                                            <span className="font-bold text-[#DC2626] text-[1.6vh] flex-1 text-right">{item.d} <span className="text-[#6B7280] font-bold text-[1.2vh] uppercase">hrs</span></span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Testimonial Showcase (Reduced padding to fit category tabs) */}
                            <div className="bg-white pt-[1.5vh] pb-[2.5vh] px-[2vh] rounded-[2vh] shadow-[0_0_20px_rgba(0,0,0,0.05)] flex-1 flex flex-col justify-between border border-[#E5E7EB] relative overflow-hidden">
                                <div className="flex justify-between items-center bg-slate-50 py-[0.8vh] px-[1.2vh] rounded-[1.2vh] border border-[#E5E7EB]">
                                    <div className="flex items-center gap-[1vw]">
                                        <span className="text-[3.5vh] font-bold text-[#0A0A0A] leading-none">4.8</span>
                                        <div className="flex gap-[0.2vw]">
                                            {[1, 2, 3, 4, 5].map(s => <svg key={s} className={`w-[1.6vh] h-[1.6vh] ${s <= 4 ? 'text-[#F59E0B]' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                                        </div>
                                    </div>
                                    <span className="text-[1.2vh] font-bold text-[#6B7280]">7,050 reviews</span>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-[0.5vh]">
                                        <div className="flex items-center gap-[0.5vw]">
                                            <div className="w-[0.5vh] h-[1.8vh] bg-[#DC2626] rounded-full"></div>
                                            <span className="text-[#6B7280] font-bold text-[1.1vh] uppercase tracking-[0.2em]">Customer Testimony</span>
                                        </div>
                                        <span className="bg-[#DC2626]/10 text-[#DC2626] font-bold text-[1vh] px-[0.8vh] py-[0.3vh] rounded-full uppercase tracking-widest border border-[#DC2626]/20 shrink-0">
                                            {REVIEWS[activeReview].tenure}
                                        </span>
                                    </div>
                                    <p className="text-[1.5vh] font-medium text-[#4B5563] italic leading-relaxed line-clamp-3">"{REVIEWS[activeReview].text}"</p>
                                </div>
                                <div className="flex items-center gap-2.5 mt-[0.5vh]">
                                    <div className="w-[3.5vh] h-[3.5vh] rounded-full bg-[#DC2626] flex items-center justify-center font-bold text-white text-[1.5vh] shadow-lg shadow-red-500/20">{REVIEWS[activeReview].author[0]}</div>
                                    <div>
                                        <p className="font-bold text-[#0A0A0A] text-[1.5vh] leading-none">{REVIEWS[activeReview].author}</p>
                                        <div className="flex gap-[0.1vw] mt-1">{[1, 2, 3, 4, 5].map(s => <svg key={s} className="w-[1vh] h-[1vh] text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                                    </div>
                                </div>
                                <div className="absolute bottom-[1vh] right-[2vh] flex gap-[0.4vw]">
                                    {REVIEWS.map((_, i) => (
                                        <div key={i} className={`h-[0.5vh] rounded-full transition-all duration-300 ${i === activeReview ? 'w-[1.2vw] bg-[#DC2626]' : 'w-[0.7vh] bg-slate-200'}`}></div>
                                    ))}
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
