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
        { text: 'Amazing experience! Mr. Manoj and Mr. Praveen\'s team dealt with the work politely and carefully. Thanks to Kondaas Automation and the whole team!', author: 'Chandrasekaran P.', stars: 5 },
        { text: 'Sangamesvaran, Sudheesh, Praveen & Vel Murugan did an outstanding job. Very responsive, transparent, and the installation was neat, professional, and highly technical.', author: 'Midhun Mohan', stars: 5 },
        { text: 'Work completed very professionally, done strictly according to norms. Mr. Sudheesh Menakath and Praveen\'s team did a wonderful job. Totally satisfied — five stars!', author: 'Umashankar', stars: 5 },
        { text: 'Installed 14 KW across three homes. Mrs. Aparna\'s excellent communication and coordination made everything seamless, even for a Chennai client of a Coimbatore company.', author: 'Chandrahasa D.', stars: 5 },
        { text: 'Mr. Reegan was very polite and knowledgeable. He resolved our solar issue quickly and our system is working perfectly now. Thank you for the dedicated support!', author: 'Preethi T M', stars: 5 },
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
            <div className="w-full h-full relative overflow-hidden bg-brand-gray flex flex-col">
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

                {(pincode || districtParam) ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
                        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                        </div>
                        <div className="absolute top-[3vh] left-[1.5vw] z-[60]">
                            <button onClick={() => navigate('/')} className="flex items-center gap-[0.5vw] text-slate-600 transition-all duration-300 px-[1.5vw] py-[1vh] rounded-full backdrop-blur-sm shadow-sm border border-transparent">
                                <AnimatedIcon src="https://cdn.lordicon.com/jxwksgwv.json" colors={{ primary: "#475569", secondary: "#d71920" }} size="3.5vh" style={{ transform: 'rotate(180deg)' }} />
                                <span className="text-[2vh] font-bold">Back</span>
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
                                            <div className="bg-brand-red text-white p-[0.3vh] rounded shadow-sm">
                                                <svg className="w-[3vh] h-[3vh]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                                            </div>
                                            <h2 className="text-[3.5vh] font-medium text-slate-700 leading-none">
                                                Kondaas {!activeTab ? 'Homes' : <span className="text-brand-red font-bold">{activeTab === 'residential' ? 'Residentials' : activeTab === 'commercial' ? 'Commercials' : 'Water Heaters'}</span>} in <span className="text-brand-red font-bold">{districtParam || pincode}</span>
                                            </h2>
                                        </div>
                                        <p className="text-[2.5vh] font-bold text-slate-500 uppercase tracking-wider">{districtParam ? stateParam : district}</p>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-[1vw] mb-[2vh] w-full">
                                    {['residential', 'commercial', 'waterHeater'].map(type => (
                                        <button key={type} onClick={() => setActiveTab(activeTab === type ? null : type)} className={`px-[1.8vw] py-[1vh] rounded-[1.5vh] text-[1.8vh] font-bold transition-all ${activeTab === type ? 'bg-brand-red text-white shadow-lg' : 'bg-slate-100 text-slate-600'}`}>
                                            {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col items-center">
                                    <h1 className="text-[20vh] leading-none font-bold text-brand-red tracking-tight drop-shadow-xl" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>{localHomes}</h1>
                                    <div className="h-[8vh] flex flex-col items-center justify-center">
                                        {!activeTab && localSubTotals && (
                                            <p className="text-slate-500 text-[2.5vh] font-medium text-center">
                                                {localSubTotals.residential} Residential / {localSubTotals.commercial} Commercial / {localSubTotals.waterHeater} Water Heater
                                            </p>
                                        )}
                                        {activeTab && <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-[2vh]">KONDAAS {activeTab.toUpperCase()} AROUND YOU!</p>}
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-100 rounded-full py-[1vh] px-[2vw] flex items-center gap-[1vw] shadow-lg mb-[5vh]">
                                    <div className="bg-green-100 w-[6vh] h-[6vh] rounded-full flex items-center justify-center"><IndianRupee className="text-green-700 w-[3vh] h-[3vh]" strokeWidth={2.5} /></div>
                                    <span className="text-green-700 font-bold text-[4vh]">₹{(localSavings / 100000).toFixed(2)}L <span className="text-slate-500 font-medium text-[2vh]">Savings near you</span></span>
                                </div>

                                <button onClick={handleSearchNavigate} className="w-full max-w-[40vw] bg-brand-red text-white text-[2.5vh] font-bold py-[2vh] rounded-[2vh] shadow-xl flex items-center justify-center gap-[1vw]">
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
                    <div className="flex-1 w-full grid grid-cols-[20vw_49vw_26vw] gap-[1.5vw] px-[1.5vw] pb-[2vh] overflow-hidden">
                        {/* LEFT COLUMN */}
                        <div className="flex flex-col gap-[2vh] h-full justify-between overflow-hidden">
                            <div className="bg-white p-[3vh] rounded-[2.5vh] shadow-xl border border-slate-100 flex flex-col flex-1 min-h-0">
                                <div className="flex items-center gap-[1.2vh] mb-[1.5vh] text-brand-red shrink-0">
                                    <AnimatedIcon src="https://cdn.lordicon.com/surcxhka.json" trigger="loop" delay="2000" colors={{ primary: "#d71920", secondary: "#334155" }} size="4.5vh" />
                                    <span className="font-black text-[2vh] uppercase tracking-[0.1em] text-slate-700 truncate">{!activeTab ? 'Overall' : activeTab}</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center min-h-0">
                                    <div className="text-[7vh] font-black text-slate-900 leading-none tracking-tighter">
                                        {stats.homes.toLocaleString()}
                                    </div>
                                    <p className="text-slate-400 text-[1.8vh] font-bold mt-[0.5vh] uppercase tracking-wider">Installations</p>
                                </div>
                                {!activeTab && (
                                    <div className="mt-[1.5vh] space-y-[0.5vh] shrink-0">
                                        <div className="flex items-center gap-2 text-[1.5vh] font-bold text-slate-500 truncate"><div className="w-2 h-2 rounded-full bg-brand-red shrink-0"></div>{(stateFilteredData.residential || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} Residential</div>
                                        <div className="flex items-center gap-2 text-[1.5vh] font-bold text-slate-500 truncate"><div className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></div>{(stateFilteredData.commercial || []).reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0).toLocaleString()} Commercial</div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-[3vh] rounded-[2.5vh] shadow-xl border border-slate-100 flex flex-col flex-1 min-h-0">
                                <div className="flex items-center gap-[1.2vh] mb-[1.5vh] text-brand-red shrink-0">
                                    <AnimatedIcon src="https://cdn.lordicon.com/qhviklyi.json" trigger="loop" delay="2500" colors={{ primary: "#d71920", secondary: "#334155" }} size="4.5vh" />
                                    <span className="font-black text-[2vh] uppercase tracking-[0.1em] text-slate-700">Savings</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="text-[7vh] font-black text-slate-900 leading-none tracking-tighter">₹ {(stats.savings / 10000000).toFixed(2)} Cr</div>
                                    <p className="text-slate-400 text-[1.8vh] font-bold uppercase tracking-wider">Annual Impact</p>
                                </div>
                            </div>

                            <div className="bg-white p-[3vh] rounded-[2.5vh] shadow-xl border border-slate-100 flex flex-col flex-1 min-h-0">
                                <div className="flex items-center gap-[1.2vh] mb-[1.5vh] text-brand-red shrink-0">
                                    <AnimatedIcon src="https://cdn.lordicon.com/sbiheqdr.json" trigger="loop" delay="3000" colors={{ primary: "#d71920", secondary: "#334155" }} size="4.5vh" />
                                    <span className="font-black text-[2vh] uppercase tracking-[0.1em] text-slate-700">Capacity</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="text-[7vh] font-black text-slate-900 leading-none tracking-tighter">{Math.round(stats.capacity || 0).toLocaleString()} <span className="text-[3.5vh] text-slate-400">kW</span></div>
                                    <p className="text-slate-400 text-[1.8vh] font-bold uppercase tracking-wider">Solar Power</p>
                                </div>
                            </div>
                        </div>

                        {/* CENTER COLUMN */}
                        <div className="flex flex-col gap-[2vh] h-full overflow-hidden">
                            <div className="flex-1 bg-white rounded-[3vh] border shadow-2xl relative overflow-hidden min-h-0">
                                <IndiaMap data={filteredData} darkMode={false} selectedState={selectedState} className="h-full w-full" />
                                <div className="absolute bottom-[2vh] left-1/2 -translate-x-1/2 w-full px-[2vw] z-[400]">
                                    <button onClick={handleSearchNavigate} className="w-full bg-white/95 backdrop-blur-sm text-slate-800 text-[2.2vh] font-black py-[1.8vh] rounded-full shadow-2xl border flex items-center justify-between px-[2vw] hover:scale-[1.02] transition-transform">
                                        <span>Find installations near you</span>
                                        <div className="bg-brand-red text-white p-2 rounded-full shadow-lg"><Zap size="2.5vh" /></div>
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-[3vh] shadow-xl p-[2.5vh] flex items-center gap-[3vw] h-[18vh] shrink-0">
                                <div className="flex flex-col items-center border-r border-slate-100 pr-[3vw] shrink-0">
                                    <div className="flex items-baseline gap-1"><span className="text-[7vh] font-black leading-none">4.8</span><span className="text-slate-400 text-[1.8vh]">/ 5.0</span></div>
                                    <div className="flex my-0.5">{[1, 2, 3, 4, 5].map(s => <Zap key={s} size="1.8vh" className={s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />)}</div>
                                    <span className="text-[1.3vh] font-black text-slate-400 uppercase tracking-widest">7,050 Reviews</span>
                                </div>
                                <div className="flex-1 space-y-[1.2vh]">
                                    {[{ l: 'After Sales Service', s: 4.9, p: 98 }, { l: 'Quality of Installation', s: 4.8, p: 96 }, { l: 'Executive Support', s: 5.0, p: 100 }].map(x => (
                                        <div key={x.l} className="flex items-center gap-[1.2vw]">
                                            <span className="text-[1.6vh] font-bold text-slate-600 w-[10vw] truncate shrink-0">{x.l}</span>
                                            <div className="flex-1 h-[1vh] bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-brand-red rounded-full" style={{ width: `${x.p}%` }}></div></div>
                                            <span className="text-[1.8vh] font-black text-brand-red w-[2.5vw] text-right shrink-0">{x.s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-[2vh] h-full overflow-hidden">
                            <div className="bg-white p-[2.5vh] rounded-[3vh] shadow-xl border border-slate-50 shrink-0">
                                <div className="flex justify-between items-start mb-[1.5vh]">
                                    <h3 className="font-black text-[2.2vh] text-slate-800">Legacy Customers</h3>
                                    <span className="bg-emerald-50 text-emerald-600 px-[1vh] py-[0.4vh] rounded-lg text-[1.1vh] font-black uppercase tracking-widest border border-emerald-100 shrink-0">Verified Trust</span>
                                </div>
                                <div className="space-y-[0.8vh] mb-[1.5vh]">
                                    {[{ l: '3 Year Customers', c: 420 }, { l: '5 Year Customers', c: 285 }, { l: '10 Year Customers', c: 128 }].map(t => (
                                        <div key={t.l} className="flex justify-between items-center bg-slate-50/50 p-[1.2vh] rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                                            <span className="font-bold text-slate-600 text-[1.6vh]">{t.l}</span>
                                            <span className="font-black text-slate-900 text-[1.8vh]">{t.c}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-brand-red/5 p-[1.8vh] rounded-2xl border border-brand-red/10 relative overflow-hidden">
                                    <div className="flex justify-between items-end mb-1 relative z-10">
                                        <span className="text-brand-red font-black text-[1.2vh] uppercase tracking-widest">ACTIVE RETENTION</span>
                                        <span className="font-black text-brand-red text-[2.2vh]">82%</span>
                                    </div>
                                    <div className="h-2 bg-white rounded-full overflow-hidden"><div className="h-full bg-brand-red rounded-full" style={{ width: '82%' }}></div></div>
                                </div>
                            </div>

                            <div className="bg-brand-red rounded-[3vh] p-[2.5vh] text-white shadow-xl shadow-red-500/20 shrink-0 border-b-[0.6vh] border-red-800">
                                <h3 className="font-black opacity-70 uppercase text-[1.4vh] mb-2 tracking-[0.2em]">Service Result</h3>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="bg-white/15 p-2 rounded-xl backdrop-blur-sm border border-white/20"><Zap size="2.5vh" /></div>
                                    <div><p className="text-[3.2vh] font-black leading-none tracking-tight">1,248</p><p className="text-[1.1vh] opacity-70 uppercase font-black tracking-widest">Services Completed</p></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/15 p-2 rounded-xl backdrop-blur-sm border border-white/20"><IndianRupee size="2.5vh" /></div>
                                    <div><p className="text-[3.2vh] font-black leading-none tracking-tight">3.5 hrs</p><p className="text-[1.1vh] opacity-70 uppercase font-black tracking-widest">Avg Downtime</p></div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[3vh] p-[3vh] flex-1 flex flex-col justify-between text-white relative overflow-hidden group shadow-2xl">
                                <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size="15vh" /></div>
                                <div>
                                    <span className="text-brand-red font-black text-[1.2vh] uppercase tracking-[0.3em] mb-2 block">Customer Testimony</span>
                                    <p className="text-[1.9vh] font-medium leading-relaxed italic mb-4 line-clamp-4 text-slate-200">"{REVIEWS[activeReview].text}"</p>
                                </div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-[5.5vh] h-[5.5vh] rounded-full bg-gradient-to-tr from-brand-red to-red-500 flex items-center justify-center font-black text-[2.2vh] shadow-lg shadow-brand-red/20">{REVIEWS[activeReview].author[0]}</div>
                                    <div>
                                        <p className="font-black text-[1.8vh] tracking-tight">{REVIEWS[activeReview].author}</p>
                                        <div className="flex gap-0.5 mt-0.5">{[1, 2, 3, 4, 5].map(s => <Zap key={s} size="1.2vh" className="text-amber-400 fill-amber-400" />)}</div>
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
