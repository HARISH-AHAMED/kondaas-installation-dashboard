import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TVLayout from '../components/tv/TVLayout';
import Keypad from '../components/tv/Keypad';
import { ArrowLeft, Home, Zap, Users, ChevronDown } from 'lucide-react';
import AnimatedIcon from '../components/common/AnimatedIcon';

// District data by state — add more states here in future
const STATE_DISTRICTS = {
    'Tamil Nadu': [
        'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
        'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
        'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
        'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
        'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
        'Thanjavur', 'Theni', 'Thiruvallur', 'Thiruvarur', 'Thoothukudi',
        'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvannamalai',
        'Vellore', 'Viluppuram', 'Virudhunagar'
    ],
    'Kerala': [
        'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
        'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
        'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
    ]
};

const TVHome = () => {
    const [pin, setPin] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || null);

    // Input mode: 'pincode' | 'district'
    const [inputMode, setInputMode] = useState(searchParams.get('mode') || 'district');

    // District mode state
    const [selectedState, setSelectedState] = useState('Tamil Nadu');
    const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

    const handleKeyPress = (key) => {
        if (pin.length < 6) {
            setPin(prev => prev + key);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setPin('');
    };

    const handleSubmit = () => {
        if (pin.length === 6) {
            if (activeTab) {
                navigate(`/?pincode=${pin}&tab=${activeTab}`);
            } else {
                navigate(`/?pincode=${pin}`);
            }
        } else {
            alert("Please enter a 6-digit PIN");
        }
    };

    const handleDistrictSelect = (district) => {
        if (activeTab) {
            navigate(`/?district=${encodeURIComponent(district)}&state=${encodeURIComponent(selectedState)}&tab=${activeTab}`);
        } else {
            navigate(`/?district=${encodeURIComponent(district)}&state=${encodeURIComponent(selectedState)}`);
        }
    };

    // Handle physical keyboard input (pincode mode only)
    useEffect(() => {
        if (inputMode !== 'pincode') return;
        const handleKeyDown = (e) => {
            if (e.key >= '0' && e.key <= '9') {
                if (pin.length < 6) setPin(prev => prev + e.key);
            } else if (e.key === 'Backspace') {
                setPin(prev => prev.slice(0, -1));
            } else if (e.key === 'Enter') {
                handleSubmit();
            } else if (e.key === 'Escape') {
                navigate('/');
            } else if (e.key === 'Delete') {
                setPin('');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pin, navigate, activeTab, inputMode]);

    const districts = STATE_DISTRICTS[selectedState] || [];
    // Calculate columns so all districts show without scrollbar
    const colCount = districts.length <= 14 ? 3 : 5;

    return (
        <TVLayout>
            <div className="relative w-full h-full min-h-screen bg-slate-50 overflow-hidden flex flex-col">



                {/* Back to Home Button - Top Left */}
                <div className="absolute top-[3vh] left-[1.5vw] z-50">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-[0.5vw] text-slate-600 transition-all duration-300 px-[1.5vw] py-[1vh] rounded-full backdrop-blur-sm shadow-sm border border-transparent"
                    >
                        <AnimatedIcon src="https://cdn.lordicon.com/jxwksgwv.json" colors={{ primary: "#475569", secondary: "#d71920" }} size="3.5vh" style={{ transform: 'rotate(180deg)' }} />
                        <span className="text-[2vh] font-bold">Back</span>
                    </button>
                </div>

                {/* Main Content - Centered */}
                <div className="flex-1 flex flex-col items-center justify-center p-[1vh] z-30 relative gap-[2.5vh]">



                    <div className="w-full max-w-[50vw] flex justify-center gap-[1vw] z-40">
                        {[
                            {
                                id: 'residential',
                                label: 'Residential',
                                icon: (isActive) => (
                                    <svg className={`w-[3.5vh] h-[3.5vh] ${isActive ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                )
                            },
                            {
                                id: 'commercial',
                                label: 'Commercial',
                                icon: (isActive) => (
                                    <svg className={`w-[3.5vh] h-[3.5vh] ${isActive ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>
                                )
                            },
                            {
                                id: 'waterHeater',
                                label: 'Water Heater',
                                icon: (isActive) => (
                                    <svg className={`w-[3.5vh] h-[3.5vh] ${isActive ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="16" rx="3" /><circle cx="12" cy="12" r="2" /><path d="M9 4V2" /><path d="M15 4V2" /><path d="M11 20v2" /><path d="M13 20v2" /></svg>
                                )
                            }
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(isActive ? null : tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-[1vw] py-[2vh] px-[2vw] rounded-[2vh] text-[2.2vh] font-bold transition-all duration-300 ${isActive
                                        ? 'bg-brand-red text-white shadow-[0_0.6vh_0_0_#b91c1c,0_1vh_2vh_rgba(0,0,0,0.06)] transform -translate-y-[0.3vh]'
                                        : 'bg-white text-slate-600 shadow-[0_1vh_2vh_rgba(0,0,0,0.04)] border border-slate-100'
                                        }`}
                                >
                                    {tab.icon(isActive)}
                                    <span className="whitespace-nowrap">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── PINCODE MODE ── */}
                    {inputMode === 'pincode' && (
                        <div className="w-full max-w-[50vw]">
                            <Keypad
                                value={pin}
                                onKeyPress={handleKeyPress}
                                onDelete={handleDelete}
                                onClear={handleClear}
                                onSubmit={handleSubmit}
                            />
                        </div>
                    )}


                    {inputMode === 'district' && (
                        <div className="w-full max-w-[70vw] flex flex-col gap-[1.5vh]">

                            {/* State Dropdown */}
                            <div className="relative z-50">
                                <button
                                    onClick={() => setStateDropdownOpen(prev => !prev)}
                                    className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-[2vh] px-[2vw] py-[1.5vh] shadow-md text-[2vh] font-bold text-slate-700 transition-colors"
                                >
                                    <span className="flex items-center gap-[0.8vw]">
                                        <svg className="w-[2.2vh] h-[2.2vh] text-brand-red shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </svg>
                                        {selectedState}
                                    </span>
                                    <ChevronDown className={`w-[2.5vh] h-[2.5vh] text-slate-400 transition-transform duration-200 ${stateDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {stateDropdownOpen && (
                                    <div className="absolute top-full mt-[0.5vh] left-0 w-full bg-white border border-slate-200 rounded-[2vh] shadow-xl z-50 overflow-hidden">
                                        {Object.keys(STATE_DISTRICTS).map(state => (
                                            <button
                                                key={state}
                                                onClick={() => { setSelectedState(state); setStateDropdownOpen(false); }}
                                                className={`w-full text-left px-[2vw] py-[1.2vh] text-[1.8vh] font-semibold transition-colors ${selectedState === state ? 'bg-red-50 text-brand-red' : 'text-slate-700'}`}
                                            >
                                                {state}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* District Grid — fixed height for all states */}
                            <div
                                className="bg-white rounded-[2vh] border border-slate-100 shadow-md p-[1.5vh] overflow-auto"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                                    gap: '0.8vh',
                                    height: '52.8vh',
                                    alignContent: 'start'
                                }}
                            >
                                {districts.map(district => (
                                    <button
                                        key={district}
                                        onClick={() => handleDistrictSelect(district)}
                                        className="text-left px-[1.2vw] py-[1.2vh] rounded-[1.5vh] text-[1.6vh] font-semibold text-slate-700 bg-slate-50 border border-slate-100 transition-all duration-200 active:scale-95 truncate"
                                    >
                                        {district}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* INPUT MODE TOGGLE — bottom for easy kiosk reach */}
                    <div className="flex bg-white rounded-[2vh] shadow border border-slate-100 p-[0.5vh] gap-[0.5vh]">
                        {/* District — LEFT */}
                        <button
                            onClick={() => setInputMode('district')}
                            className={`flex items-center gap-[0.8vw] px-[2.5vw] py-[1.2vh] rounded-[1.5vh] text-[1.8vh] font-bold transition-all duration-300 ${inputMode === 'district'
                                ? 'bg-brand-red text-white shadow-md'
                                : 'text-slate-500'}`}
                        >
                            <svg className="w-[2.2vh] h-[2.2vh] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                <circle cx="12" cy="9" r="2.5" />
                            </svg>
                            District
                        </button>
                        {/* Pincode — RIGHT */}
                        <button
                            onClick={() => setInputMode('pincode')}
                            className={`flex items-center gap-[0.8vw] px-[2.5vw] py-[1.2vh] rounded-[1.5vh] text-[1.8vh] font-bold transition-all duration-300 ${inputMode === 'pincode'
                                ? 'bg-brand-red text-white shadow-md'
                                : 'text-slate-500'}`}
                        >
                            <svg className="w-[2.2vh] h-[2.2vh] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="4" height="4" rx="1" /><rect x="10" y="3" width="4" height="4" rx="1" /><rect x="17" y="3" width="4" height="4" rx="1" />
                                <rect x="3" y="10" width="4" height="4" rx="1" /><rect x="10" y="10" width="4" height="4" rx="1" /><rect x="17" y="10" width="4" height="4" rx="1" />
                                <rect x="3" y="17" width="4" height="4" rx="1" /><rect x="10" y="17" width="4" height="4" rx="1" /><rect x="17" y="17" width="4" height="4" rx="1" />
                            </svg>
                            Pincode
                        </button>
                    </div>
                </div>

                {/* Footer Stats Bar */}
                <div className="relative z-20 bg-gradient-to-r from-brand-red via-red-600 to-brand-red text-white py-[1.5vh] shadow-2xl mt-auto">
                    <div className="w-[90vw] mx-auto flex justify-between items-center">

                        {/* Stat 1 */}
                        <div className="flex items-center gap-[1vw]">
                            <div className="bg-white/20 p-[0.8vh] rounded-full backdrop-blur-sm">
                                <Home className="text-white w-[2.8vh] h-[2.8vh]" />
                            </div>
                            <div className="text-left">
                                <div className="text-[2.5vh] font-bold leading-none">30,000+</div>
                                <div className="text-white/90 text-[1.2vh] font-medium">Homes Delivered</div>
                            </div>
                        </div>

                        {/* Stat 2 */}
                        <div className="flex items-center gap-[1vw] border-l border-white/20 pl-[3vw]">
                            <div className="bg-white/20 p-[0.8vh] rounded-full backdrop-blur-sm">
                                <Zap className="text-white w-[2.8vh] h-[2.8vh]" />
                            </div>
                            <div className="text-left">
                                <div className="text-[2.5vh] font-bold leading-none">50MW+</div>
                                <div className="text-white/90 text-[1.2vh] font-medium">Powered by Solar</div>
                            </div>
                        </div>

                        {/* Stat 3 */}
                        <div className="flex items-center gap-[1vw] border-l border-white/20 pl-[3vw]">
                            <div className="bg-white/20 p-[0.8vh] rounded-full backdrop-blur-sm">
                                <Users className="text-white w-[2.8vh] h-[2.8vh]" />
                            </div>
                            <div className="text-left">
                                <div className="text-[2.5vh] font-bold leading-none">Trusted by</div>
                                <div className="text-[2.5vh] font-bold leading-none">1,00,000+ Families</div>
                            </div>
                        </div>

                    </div>

                    {/* Decorative curve at top of footer */}
                    <div className="absolute top-0 left-0 w-full transform -translate-y-full overflow-hidden pointer-events-none">
                        <svg viewBox="0 0 1440 100" className="w-full h-[6vh] fill-current text-brand-red" preserveAspectRatio="none">
                            <path d="M0,100 C480,100 960,0 1440,0 L1440,100 L0,100 Z" fillOpacity="0.1" className="text-red-700" />
                            <path d="M0,100 C320,100 750,50 1440,80 L1440,100 L0,100 Z" />
                        </svg>
                    </div>
                </div>
            </div>
        </TVLayout>
    );
};

export default TVHome;
