import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TVLayout from '../components/tv/TVLayout';
import IndiaMap from '../components/dashboard/IndiaMap';
import { getInstallations } from '../services/api';
import { IndianRupee, Zap, MapPin, Search } from 'lucide-react';
import AnimatedIcon from '../components/common/AnimatedIcon';

const TVDashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const pincode = searchParams.get('pincode');

    // Initialize with cached data if available
    const [data, setData] = useState(() => {
        const cached = localStorage.getItem('kondaas_dashboard_data');
        return cached ? JSON.parse(cached) : [];
    });

    const [stats, setStats] = useState({ homes: 0, savings: 0, capacity: 0 });
    const [timeLeft, setTimeLeft] = useState(30);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            const response = await getInstallations();
            if (response.status === 'success') {
                setData(response.data);
                // Cache the fresh data
                localStorage.setItem('kondaas_dashboard_data', JSON.stringify(response.data));

                // Calculate global stats
                const totalHomes = response.data.reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0);
                const totalSavings = response.data.reduce((acc, curr) => acc + (Number(curr['Savings_Estimate']) || 0), 0);
                const totalCapacity = response.data.reduce((acc, curr) => acc + (Number(curr['Capacity_kW']) || 0), 0);

                setStats({ homes: totalHomes, savings: totalSavings, capacity: totalCapacity });
            }
        };
        fetchData();

        // Recalculate stats from cached data initially to avoid zero flash
        if (data.length > 0) {
            const totalHomes = data.reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0);
            const totalSavings = data.reduce((acc, curr) => acc + (Number(curr['Savings_Estimate']) || 0), 0);
            const totalCapacity = data.reduce((acc, curr) => acc + (Number(curr['Capacity_kW']) || 0), 0);
            setStats({ homes: totalHomes, savings: totalSavings, capacity: totalCapacity });
        }
    }, []);

    // Auto-Redirect Timer (Only when pincode is present)
    useEffect(() => {
        if (!pincode) return; // Don't redirect if just viewing map

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate, pincode]);

    // Derived Data based on Pincode
    const filteredData = pincode
        ? data.filter(item => item.Pincode?.toString().includes(pincode))
        : data;

    const localHomes = filteredData.reduce((acc, curr) => acc + (Number(curr['Installations']) || 0), 0);
    const localSavings = filteredData.reduce((acc, curr) => acc + (Number(curr['Savings_Estimate']) || 0), 0);
    const localCapacity = filteredData.reduce((acc, curr) => acc + (Number(curr['Capacity_kW']) || 0), 0);
    const district = filteredData[0]?.District || filteredData[0]?.City; // Fallback to City if District missing

    return (
        <TVLayout>
            <div className="w-full h-full relative overflow-hidden bg-brand-gray flex flex-col">
                {/* Header */}
                <header className="bg-brand-red text-white px-[4vw] py-[2vh] shadow-lg z-20 flex justify-between items-center shrink-0 h-[10vh]">
                    <div>
                        <div className="flex items-center gap-[1vw]">
                            <div className="bg-white p-[0.5vh] rounded">
                                {/* Simple Icon/Logo placeholder if no asset */}
                                <svg className="w-[4vh] h-[4vh] text-brand-red" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                            </div>
                            <h1 className="text-[3.5vh] font-bold tracking-tight">Kondaas | <span className="font-light opacity-90">SOLAR SYSTEMS</span></h1>
                        </div>
                        <p className="text-[2vh] opacity-90 mt-[0.5vh] font-medium ml-[4vh]">Best Solar Installer Across South India</p>
                    </div>
                </header>

                {/* 
                    MODE 1: RESULT OVERLAY (Active when pincode exists)
                    Matches the reference image: Large centered card, glassmorphism, focus on numbers.
                */}
                {pincode ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                        </div>

                        {/* Main Content Container */}
                        <div className="relative z-10 w-full max-w-[80vw] mx-auto px-4 flex flex-col items-center">

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
                                                Kondaas Homes in <span className="text-brand-red font-bold">{pincode}</span>
                                            </h2>
                                        </div>
                                        {district && (
                                            <p className="text-[2.5vh] font-bold text-slate-500 ml-[0.5vw] uppercase tracking-wider" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                {district}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Main Number */}
                                <h1 className="text-[20vh] leading-none font-bold text-brand-red font-sans tracking-tight drop-shadow-xl"
                                    style={{
                                        textShadow: '4px 4px 0px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.15)' // "DVD Back Shadow" effect
                                    }}>
                                    {localHomes}
                                </h1>

                                {/* Subtext */}
                                <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-[2vh] mt-[2vh] mb-[4vh]">
                                    KONDAAS HOMES AROUND YOU!
                                </p>

                                {/* Savings Pill */}
                                <div className="bg-white border border-slate-100 rounded-full pl-[0.5vw] pr-[2vw] py-[1vh] flex items-center gap-[1vw] shadow-lg shadow-slate-200/50 mb-[5vh] transform hover:scale-105 transition-transform duration-300">
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
                                    onClick={() => navigate('/search')}
                                    className="w-full max-w-[40vw] bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-[2.5vh] font-bold py-[2vh] rounded-[2vh] shadow-xl shadow-red-500/30 transition-all flex items-center justify-center gap-[1vw] group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="relative z-10">Enter Another PIN Code</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[4vh] w-[4vh] relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>

                            {/* Footer Stats */}
                            <div className="mt-[4vh] w-full grid grid-cols-3 gap-[4vw] text-center max-w-[60vw]">
                                <div className="flex flex-col items-center gap-[1vh] group cursor-default">
                                    <div className="w-[8vh] h-[8vh] rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-[4vh] w-[4vh] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[2.5vh] text-slate-800">30,000+</p>
                                        <p className="text-slate-500 text-[1.5vh]">Homes Delivered</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-[1vh] group cursor-default">
                                    <div className="w-[8vh] h-[8vh] rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                                        <Zap className="h-[4vh] w-[4vh] text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[2.5vh] text-slate-800">50MW+</p>
                                        <p className="text-slate-500 text-[1.5vh]">Powered by Solar</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-[1vh] group cursor-default">
                                    <div className="w-[8vh] h-[8vh] rounded-full bg-white border-2 border-green-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
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
                    <div className="w-full h-[90vh] grid grid-cols-[21vw_53vw_21vw] gap-[1vw] p-[1.5vw] overflow-hidden">

                        {/* LEFT COLUMN: Statistics */}
                        <div className="flex flex-col gap-[2vh] h-full justify-between pb-[2vh]">
                            {/* Stat Card 1: Homes */}
                            <div className="bg-white p-[3vh] rounded-[2vh] shadow-lg border border-slate-100 flex flex-col items-start justify-center flex-1 min-h-0 hover:shadow-xl transition-shadow">
                                <div className="flex items-center gap-[1vh] mb-[1vh] text-brand-red">
                                    <AnimatedIcon src="https://cdn.lordicon.com/surcxhka.json" trigger="loop" delay="2000" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                    <span className="font-bold text-[1.8vh] uppercase tracking-wider text-slate-700">Homes</span>
                                </div>
                                <div className="text-[6vh] font-bold text-slate-800 mb-[1vh] leading-tight">
                                    {stats.homes.toLocaleString()}
                                </div>
                                <p className="text-slate-500 text-[1.8vh] font-medium">Total installations across India</p>
                            </div>

                            {/* Stat Card 2: Savings */}
                            <div className="bg-white p-[3vh] rounded-[2vh] shadow-lg border border-slate-100 flex flex-col items-start justify-center flex-1 min-h-0 hover:shadow-xl transition-shadow">
                                <div className="flex items-center gap-[1vh] mb-[1vh] text-brand-red">
                                    <AnimatedIcon src="https://cdn.lordicon.com/qhviklyi.json" trigger="loop" delay="2500" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                    <span className="font-bold text-[1.8vh] uppercase tracking-wider text-slate-700">Savings</span>
                                </div>
                                <div className="text-[6vh] font-bold text-slate-800 mb-[1vh] leading-tight">
                                    ₹ {(stats.savings / 10000000).toFixed(2)} Cr
                                </div>
                                <p className="text-slate-500 text-[1.8vh] font-medium">Estimated annual savings</p>
                            </div>

                            {/* Stat Card 3: Energy */}
                            <div className="bg-white p-[3vh] rounded-[2vh] shadow-lg border border-slate-100 flex flex-col items-start justify-center flex-1 min-h-0 hover:shadow-xl transition-shadow">
                                <div className="flex items-center gap-[1vh] mb-[1vh] text-brand-red">
                                    <AnimatedIcon src="https://cdn.lordicon.com/sbiheqdr.json" trigger="loop" delay="3000" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                    <span className="font-bold text-[1.8vh] uppercase tracking-wider text-slate-700">Capacity</span>
                                </div>
                                <div className="text-[6vh] font-bold text-slate-800 mb-[1vh] leading-tight">
                                    {stats.capacity} kW
                                </div>
                                <p className="text-slate-500 text-[1.8vh] font-medium">Total installed solar capacity</p>
                            </div>
                        </div>

                        {/* CENTER COLUMN: Map */}
                        <div className="flex flex-col h-full bg-slate-200 rounded-[3vh] border-[0.5vh] border-white shadow-xl overflow-hidden relative">
                            {/* Light Mode Map */}
                            <IndiaMap data={data} darkMode={false} className="h-full w-full" />

                            {/* Ambient Search Button */}
                            <div className="absolute bottom-[5vh] left-1/2 transform -translate-x-1/2 z-[400] w-full px-[5vw]">
                                <button
                                    onClick={() => navigate('/search')}
                                    className="w-full bg-white/90 backdrop-blur hover:bg-white text-slate-800 text-[2.5vh] font-bold py-[2vh] rounded-full shadow-lg border border-slate-200 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-between px-[2vw] group search-btn-trigger"
                                >
                                    <div className="flex items-center gap-[1vw]">
                                        <AnimatedIcon src="https://cdn.lordicon.com/msoeawqm.json" trigger="hover" target=".search-btn-trigger" colors={{ primary: "#d71920", secondary: "#334155" }} size="4vh" />
                                        <span>Find matches near you</span>
                                    </div>
                                    <div className="bg-brand-red text-white p-[0.5vh] rounded-full group-hover:bg-red-700 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[4vh] h-[4vh]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Lists */}
                        <div className="flex flex-col gap-[2vh] h-full pb-[2vh]">
                            <div className="bg-white p-[2vh] rounded-[2vh] shadow-lg border border-slate-100 h-full flex flex-col">
                                <h3 className="font-bold text-[2.5vh] text-slate-800 mb-[2vh] border-b border-slate-100 pb-[1vh] flex justify-between items-center">
                                    <span>Top Cities</span>
                                    <span className="text-[1.5vh] font-semibold text-slate-500 px-[1vh] py-[0.5vh] bg-slate-100 rounded border border-slate-200">Live</span>
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-[1vh] pr-[0.5vw] custom-scrollbar">
                                    {/* Dynamic Top Cities Data */}
                                    {Object.entries(data.reduce((acc, curr) => {
                                        const city = curr.City || 'Unknown';
                                        const count = Number(curr['Installations']) || 0;
                                        acc[city] = (acc[city] || 0) + count;
                                        return acc;
                                    }, {}))
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 8)
                                        .map(([city, count], i) => (
                                            <div key={i} className="flex justify-between items-center p-[1vh] rounded-lg hover:bg-slate-50 transition-colors group">
                                                <div className="flex items-center gap-[1vw]">
                                                    <span className="text-brand-red font-bold font-mono w-[3vh] text-right text-[2vh]">#{i + 1}</span>
                                                    <span className="text-slate-700 font-bold text-[2vh]">{city}</span>
                                                </div>
                                                <span className="text-brand-red font-bold text-[2vh] bg-red-50 px-[1.5vh] py-[0.5vh] rounded-md min-w-[5vh] text-center">
                                                    {count}
                                                </span>
                                            </div>
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
