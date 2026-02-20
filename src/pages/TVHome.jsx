import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TVLayout from '../components/tv/TVLayout';
import Keypad from '../components/tv/Keypad';
import { ArrowLeft, Home, Zap, Users } from 'lucide-react';
import AnimatedIcon from '../components/common/AnimatedIcon';

const TVHome = () => {
    const [pin, setPin] = useState('');
    const navigate = useNavigate();

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
            navigate(`/?pincode=${pin}`);
        } else {
            // Shake animation or error feedback could go here
            alert("Please enter a 6-digit PIN");
        }
    };

    // Handle physical keyboard input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key >= '0' && e.key <= '9') {
                if (pin.length < 6) {
                    setPin(prev => prev + e.key);
                }
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
    }, [pin, navigate]);

    return (
        <TVLayout>
            <div className="relative w-full h-full min-h-screen bg-slate-50 overflow-hidden flex flex-col">

                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-[70vw] h-[70vh] bg-gradient-to-bl from-slate-200/50 to-transparent transform skew-x-12 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-red-50/30 to-transparent pointer-events-none" />

                {/* Back to Home Button - Top Left */}
                <div className="absolute top-[3vh] left-[3vw] z-50">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-[0.5vw] text-slate-600 hover:text-brand-red transition-all duration-300 px-[1.5vw] py-[1vh] rounded-full hover:bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md border border-transparent hover:border-red-100"
                    >
                        <AnimatedIcon src="https://cdn.lordicon.com/jxwksgwv.json" trigger="hover" colors={{ primary: "#475569", secondary: "#d71920" }} size="3.5vh" style={{ transform: 'rotate(180deg)' }} />
                        <span className="text-[2vh] font-bold">Back</span>
                    </button>
                </div>

                {/* Header */}
                <div className="pt-[2vh] text-center z-10 relative">
                    <h2 className="text-[3.5vh] font-bold text-slate-800 tracking-tight leading-tight">
                        Find Out How Many <span className="text-brand-red">Homes Near You</span>
                    </h2>
                    <h2 className="text-[3.5vh] font-bold text-slate-800 tracking-tight leading-tight mt-[0.5vh]">
                        Are <span className="text-brand-red">Kondaas Homes</span>
                    </h2>
                    <div className="w-[4vw] h-[0.5vh] bg-brand-red mx-auto mt-[1vh] rounded-full opacity-80" />
                </div>

                {/* Main Content - Centered */}
                <div className="flex-1 flex items-center justify-center p-[1vh] z-30 relative">
                    {/* Keypad Card */}
                    <div className="w-full max-w-[40vw]">
                        <Keypad
                            value={pin}
                            onKeyPress={handleKeyPress}
                            onDelete={handleDelete}
                            onClear={handleClear}
                            onSubmit={handleSubmit}
                        />

                        {/* Back to Home Button placed below component as actionable footer */}

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

                        {/* Stat 2 - Center */}
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
