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
        { text: 'Amazing experience! Mr. Manoj and Mr. Praveen\'s team dealt with the work politely and carefully. Thanks to Kondaas Automation and the whole team!', author: 'Chandrasekaran P.', stars: 5, category: '10 Year Customer' },
        { text: 'Sangamesvaran, Sudheesh, Praveen & Vel Murugan did an outstanding job. Very responsive, transparent, and the installation was neat, professional, and highly technical.', author: 'Midhun Mohan', stars: 5, category: '5 Year Customer' },
        { text: 'Work completed very professionally, done strictly according to norms. Mr. Sudheesh Menakath and Praveen\'s team did a wonderful job. Totally satisfied — five stars!', author: 'Umashankar', stars: 5, category: '3 Year Customer' },
        { text: 'Installed 14 KW across three homes. Mrs. Aparna\'s excellent communication and coordination made everything seamless, even for a Chennai client of a Coimbatore company.', author: 'Chandrahasa D.', stars: 5, category: '5 Year Customer' },
        { text: 'Mr. Reegan was very polite and knowledgeable. He resolved our solar issue quickly and our system is working perfectly now. Thank you for the dedicated support!', author: 'Preethi T M', stars: 5, category: '3 Year Customer' },
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
        <div className="h-screen w-screen flex flex-col bg-[#f8fafc] overflow-hidden select-none font-outfit">
            {/* TOP NAVIGATION BAR */}
            <header className="h-[10.5vh] w-full bg-brand-red flex items-center justify-between px-[2vw] relative z-[500] shadow-[0_4px_20px_rgba(215,25,32,0.15)] shrink-0">
                <div className="flex items-center gap-[1.5vw]">
                    <img src="https://kondaas.com/wp-content/uploads/2023/12/Kondaas-logo-Standard.png" alt="Kondaas Logo" className="h-[4.5vh] brightness-0 invert" />
                    <div className="w-[2px] h-[4vh] bg-white/20"></div>
                    <div>
                        <h1 className="text-white text-[3vh] font-light tracking-wider leading-none">SOLAR <span className="font-bold">SYSTEMS</span></h1>
                        <p className="text-white/80 text-[1.4vh] font-medium tracking-[0.2em] mt-1">Best Solar Installer Across South India</p>
                    </div>
                </div>

                {/* State Dropdown Selector */}
                <div className="relative">
                    <button 
                        onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                        className="bg-white/10 hover:bg-white/20 text-white px-[1.5vw] py-[1.2vh] rounded-full border border-white/20 backdrop-blur-md flex items-center gap-[1vw] transition-all min-w-[12vw] group"
                    >
                        <div className="bg-white/10 p-[0.5vh] rounded-full">
                            <Menu size="2vh" className="group-hover:rotate-180 transition-transform duration-500" />
                        </div>
                        <span className="font-bold text-[1.8vh] flex-1 text-left">{selectedState}</span>
                        <ChevronDown size="2vh" className={`transition-transform duration-300 ${stateDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {stateDropdownOpen && (
                        <div className="absolute top-full right-0 mt-[1vh] bg-white rounded-3xl shadow-2xl border border-slate-100 min-w-[18vw] py-[1.2vh] z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            {STATES.map((st) => (
                                <button
                                    key={st}
                                    onClick={() => { setSelectedState(st); setStateDropdownOpen(false); }}
                                    className={`w-full text-left px-[2vw] py-[1.5vh] text-[1.8vh] font-bold transition-all flex items-center justify-between ${selectedState === st ? 'bg-brand-red text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {st}
                                    {selectedState === st && <Check size="2vh" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {pincode ? (
                    /* MODE 1: PINCODE DRILLDOWN PAGE */
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
                        {/* Pincode content here... kept existing logic but cleaned up */}
                        <div className="absolute top-[3vh] left-[1.5vw] z-[60]">
                            <button onClick={() => navigate('/tv-dashboard')} className="flex items-center gap-[0.5vw] text-slate-600 transition-all duration-300 px-[1.5vw] py-[1vh] rounded-full backdrop-blur-sm shadow-sm border border-transparent">
                                <AnimatedIcon src="https://cdn.lordicon.com/jxwksgwv.json" colors={{ primary: "#475569", secondary: "#d71920" }} size="3.5vh" style={{ transform: 'rotate(180deg)' }} />
                                <span className="text-[2vh] font-bold">Back</span>
                            </button>
                        </div>
                        <div className="relative bg-white rounded-[4vh] shadow-2xl p-[5vh] w-full max-w-[70vw] flex flex-col items-center text-center border border-white/50 backdrop-blur-sm">
                            <h2 className="text-[3.5vh] font-medium text-slate-700 mb-[1vh]">Kondaas Systems in <span className="text-brand-red font-bold">{pincode}</span></h2>
                            <h1 className="text-[18vh] leading-none font-black text-brand-red drop-shadow-2xl">{localHomes}</h1>
                            <p className="text-slate-500 font-bold tracking-[0.2em] uppercase mt-[2vh] text-[2vh]">Installations Accomplished</p>
                            <div className="mt-[5vh] bg-green-50 px-[3vw] py-[1.5vh] rounded-full border border-green-100 flex items-center gap-[1vw]">
                                <IndianRupee className="text-green-600 w-[3vh] h-[3vh]" />
                                <span className="text-green-700 font-black text-[3.5vh]">₹{(localSavings / 100000).toFixed(2)}L <span className="text-green-600/60 font-medium text-[2vh]">Local Savings</span></span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* MODE 2: AMBIENT DASHBOARD (Default Grid) */
                    <div className="flex-1 w-full grid grid-cols-[20vw_49vw_26vw] gap-[1.2vw] px-[1.5vw] pt-[1.5vh] pb-[1.5vh] overflow-hidden">
                        {/* LEFT COLUMN */}
                        <div className="flex flex-col gap-[1.5vh] h-full justify-between overflow-hidden">
                            {/* Installations Card */}
                            <div className="bg-white p-[2.5vh] rounded-[2vh] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col flex-1 min-h-0">
                                <div className="flex items-center gap-[1.2vh] mb-[1vh] text-brand-red shrink-0">
                                    <AnimatedIcon src="https://cdn.lordicon.com/surcxhka.json" trigger="loop" delay="2000" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                    <span className="font-bold text-[1.6vh] uppercase tracking-[0.1em] text-slate-400">{!activeTab ? 'Overall' : activeTab}</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center min-h-0">
                                    <div className="text-[7.5vh] font-black text-slate-900 leading-none tracking-tight">
                                        {stats.homes.toLocaleString()}
                                    </div>
                                    <p className="text-slate-500 text-[1.6vh] font-bold mt-[0.5vh] uppercase tracking-wider">Installations</p>
                                </div>
                                {!activeTab && (
                                    <div className="mt-[0.5vh] text-[1.3vh] 2xl:text-[1.5vh] font-medium text-slate-400 shrink-0">
                                        {(stateFilteredData.residential || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} res / {(stateFilteredData.commercial || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} com / {(stateFilteredData.waterHeater || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} heater
                                    </div>
                                )}
                            </div>

                            {/* Savings Card */}
                            <div className="bg-white p-[2.5vh] rounded-[2vh] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col flex-1 min-h-0">
                                <div className="flex items-center gap-[1.2vh] mb-[1vh] text-brand-red shrink-0">
                                    <AnimatedIcon src="https://cdn.lordicon.com/qhviklyi.json" trigger="loop" delay="2500" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                    <span className="font-bold text-[1.6vh] uppercase tracking-[0.1em] text-slate-400">Savings</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="text-[7.5vh] font-black text-slate-900 leading-none tracking-tight">₹ {(stats.savings / 10000000).toFixed(2)} Cr</div>
                                    <p className="text-slate-500 text-[1.6vh] font-medium mt-[0.5vh]">Estimated annual savings</p>
                                </div>
                            </div>

                            {/* Capacity Card */}
                            <div className="bg-white p-[2.5vh] rounded-[2vh] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col flex-1 min-h-0">
                                <div className="flex items-center gap-[1.2vh] mb-[1vh] text-brand-red shrink-0">
                                    <AnimatedIcon src="https://cdn.lordicon.com/sbiheqdr.json" trigger="loop" delay="3000" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                    <span className="font-bold text-[1.6vh] uppercase tracking-[0.1em] text-slate-400">Capacity</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="text-[7.5vh] font-black text-slate-900 leading-none tracking-tight">{Math.round(stats.capacity || 0).toLocaleString()} <span className="text-[3.5vh] text-slate-400 font-bold">kW</span></div>
                                    <p className="text-slate-500 text-[1.6vh] font-medium mt-[0.5vh]">Total installed solar capacity</p>
                                </div>
                            </div>
                        </div>

                        {/* CENTER COLUMN */}
                        <div className="flex flex-col gap-[1.5vh] h-full overflow-hidden">
                            <div className="flex-1 bg-white rounded-[2vh] border border-slate-100 shadow-[0_15px_80px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden min-h-0">
                                <IndiaMap data={filteredData} darkMode={false} selectedState={selectedState} className="h-full w-full" />
                                <div className="absolute bottom-[2vh] left-1/2 -translate-x-1/2 w-full px-[2vw] z-[400]">
                                    <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border border-slate-200 flex items-center justify-between p-[0.6vh] pl-[1.5vw]">
                                        <span className="text-slate-800 text-[2.2vh] font-bold">Find matches near you</span>
                                        <button onClick={handleSearchNavigate} className="bg-brand-red text-white p-[1vh] rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform flex items-center justify-center">
                                            <AnimatedIcon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop" delay="3000" colors={{ primary: "#ffffff", secondary: "#ffffff" }} size="4vh" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Center Bottom Ratings */}
                            <div className="bg-white rounded-[2vh] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.06)] p-[1.8vh] flex flex-col justify-between h-[17vh] shrink-0 border border-slate-100 relative overflow-hidden">
                                <div className="flex justify-between items-center mb-[0.5vh]">
                                    <div className="flex items-center gap-[0.5vw]">
                                        <div className="w-[0.5vh] h-[2.5vh] bg-brand-red rounded-full"></div>
                                        <h3 className="font-bold text-[1.8vh] text-slate-800">Top Reviews</h3>
                                    </div>
                                    <span className="text-[1.2vh] font-semibold text-slate-400 bg-slate-100 px-[0.8vh] py-[0.3vh] rounded border">7,050 reviews</span>
                                </div>
                                <div className="flex items-center gap-[2.5vw] flex-1">
                                    <div className="flex flex-col items-center justify-center border-r border-slate-100 pr-[2.5vw] shrink-0 h-full">
                                        <div className="flex items-baseline gap-1"><span className="text-[6.5vh] font-black leading-none text-slate-800 tracking-tight">4.8</span></div>
                                        <div className="flex gap-0.5 mt-[-0.8vh]">
                                            {[1, 2, 3, 4, 5].map(s => <svg key={s} className={`w-[1.8vh] h-[1.8vh] ${s <= 4 ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-[0.6vh]">
                                        {[{ l: 'Service', s: 4.9, p: 98 }, { l: 'Installation', s: 4.8, p: 96 }, { l: 'Support', s: 5.0, p: 100 }].map(x => (
                                            <div key={x.l} className="flex items-center gap-[0.8vw]">
                                                <span className="text-[1.3vh] font-bold text-slate-600 w-[6vw] shrink-0 truncate">{x.l}</span>
                                                <div className="flex-1 h-[0.6vh] bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-brand-red rounded-full" style={{ width: `${x.p}%` }}></div></div>
                                                <span className="text-[1.3vh] font-black text-brand-red w-[2vw] text-right shrink-0">{x.s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-[1.5vh] h-full overflow-hidden">
                            {/* Legacy Customers */}
                            <div className="bg-white p-[2vh] rounded-[2vh] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100 shrink-0">
                                <div className="flex justify-between items-start mb-[0.8vh]">
                                    <h3 className="font-bold text-[1.8vh] text-slate-800">Legacy Customers</h3>
                                    <span className="text-emerald-500 text-[1vh] font-black uppercase tracking-widest">Verified Trust</span>
                                </div>
                                <div className="space-y-[0.6vh] mb-[1vh]">
                                    {[{ l: '3 Year Customers', c: 420 }, { l: '5 Year Customers', c: 285 }, { l: '10 Year Customers', c: 128 }].map(t => (
                                        <div key={t.l} className="flex justify-between items-center bg-slate-50/50 p-[1vh] rounded-xl border border-slate-100">
                                            <span className="font-bold text-slate-600 text-[1.4vh]">{t.l}</span>
                                            <span className="font-black text-slate-900 text-[1.6vh]">{t.c}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-brand-red/5 p-[1vh] rounded-xl border border-brand-red/10">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-brand-red font-black text-[1.1vh] uppercase tracking-[0.05em]">ACTIVE RETENTION</span>
                                        <span className="font-black text-brand-red text-[2vh]">82%</span>
                                    </div>
                                    <div className="h-[0.4vh] bg-white rounded-full overflow-hidden"><div className="h-full bg-brand-red rounded-full" style={{ width: '82%' }}></div></div>
                                </div>
                            </div>

                            {/* Service Result */}
                            <div className="bg-white p-[2.5vh] rounded-[2vh] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100 shrink-0">
                                <h3 className="font-bold text-[1.6vh] text-slate-400 uppercase mb-[1.5vh] tracking-widest">Service Result</h3>
                                <div className="flex flex-col gap-[1.8vh] py-[1vh]">
                                    <div className="flex items-center gap-[1.2vw]">
                                        <div className="bg-slate-50 p-[1vh] rounded-xl border border-slate-100 shrink-0 shadow-sm">
                                            <AnimatedIcon src="https://cdn.lordicon.com/surcxhka.json" trigger="loop" delay="3500" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                        </div>
                                        <div><p className="text-[3.2vh] font-black text-slate-800 leading-none">1,248</p><p className="text-[1.3vh] font-bold text-slate-400 uppercase mt-1">Services Completed</p></div>
                                    </div>
                                    <div className="flex items-center gap-[1.2vw]">
                                        <div className="bg-slate-50 p-[1vh] rounded-xl border border-slate-100 shrink-0 shadow-sm">
                                            <AnimatedIcon src="https://cdn.lordicon.com/qhviklyi.json" trigger="loop" delay="4000" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                        </div>
                                        <div><p className="text-[3.2vh] font-black text-slate-800 leading-none">3.5 hrs</p><p className="text-[1.3vh] font-bold text-slate-400 uppercase mt-1">Avg Downtime</p></div>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial Showcase */}
                            <div className="bg-white p-[2.5vh] rounded-[2vh] shadow-[0_15px_80px_-20px_rgba(0,0,0,0.08)] flex-1 flex flex-col justify-start gap-[1.5vh] border border-slate-100 relative overflow-hidden">
                                <div className="flex justify-between items-center mb-0">
                                    <div className="flex items-center gap-[0.5vw]">
                                        <div className="w-[0.5vh] h-[2vh] bg-brand-red rounded-full"></div>
                                        <span className="text-slate-400 font-bold text-[1.2vh] uppercase tracking-[0.2em]">Customer Testimony</span>
                                    </div>
                                    <span className="bg-brand-red/10 text-brand-red text-[1vh] font-black px-[1vh] py-[0.4vh] rounded-full uppercase tracking-widest">{REVIEWS[activeReview].category}</span>
                                </div>
                                <p className="text-[1.6vh] font-medium text-slate-500 italic leading-relaxed line-clamp-4">"{REVIEWS[activeReview].text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-[4.5vh] h-[4.5vh] rounded-full bg-brand-red flex items-center justify-center font-black text-white text-[1.8vh] shadow-lg shadow-red-500/20">{REVIEWS[activeReview].author[0]}</div>
                                    <div>
                                        <p className="font-black text-slate-800 text-[1.7vh] leading-none">{REVIEWS[activeReview].author}</p>
                                        <div className="flex gap-[0.1vw] mt-1.5">{[1, 2, 3, 4, 5].map(s => <svg key={s} className="w-[1.2vh] h-[1.2vh] text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                                    </div>
                                </div>
                                <div className="absolute bottom-[2.5vh] right-[2.5vh] flex gap-[0.5vw]">
                                    {REVIEWS.map((_, i) => (
                                        <div key={i} className={`h-[0.6vh] rounded-full transition-all duration-300 ${i === activeReview ? 'w-[1.5vw] bg-brand-red' : 'w-[0.8vh] bg-slate-200'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TVDashboard;
