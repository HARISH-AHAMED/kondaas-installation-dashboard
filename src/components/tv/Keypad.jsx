import React from 'react';
import { MapPin, Delete } from 'lucide-react';

const Keypad = ({ onKeyPress, onDelete, onSubmit, value = "", onClear }) => {
    const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    const renderPinSlots = () => {
        const slots = [];
        for (let i = 0; i < 6; i++) {
            const digit = value[i];
            const hasValue = i < value.length;
            slots.push(
                <div
                    key={i}
                    className={`w-[5vh] h-[5.5vh] flex items-center justify-center rounded-[1vh] border-2 transition-all duration-200
                        ${hasValue
                            ? 'bg-white border-brand-red text-brand-red shadow-md scale-105'
                            : 'bg-slate-50 border-slate-200 text-transparent'
                        }`}
                >
                    <span className="text-[3vh] font-bold leading-none font-mono">
                        {hasValue ? digit : ''}
                    </span>
                </div>
            );
        }
        return slots;
    };

    return (
        <div className="relative w-full mx-auto">
            <div className="bg-white rounded-[3vh] shadow-2xl p-[2.5vh] pb-[3vh] relative z-10 w-full">

                {/* Header */}
                <div className="flex items-center justify-center gap-[2vw] mb-[2vh]">
                    <div className="h-px w-[4vw] bg-red-200"></div>
                    <div className="flex items-center gap-[1vw] text-slate-800">
                        <MapPin className="text-brand-red fill-current w-[2.5vh] h-[2.5vh]" />
                        <h3 className="text-[2.2vh] font-bold tracking-wide">Enter PIN Code</h3>
                    </div>
                    <div className="h-px w-[4vw] bg-red-200"></div>
                </div>

                {/* PIN Slots */}
                <div className="flex justify-center items-center gap-[2vw] mb-[2.5vh]">
                    {renderPinSlots()}
                </div>

                {/* Keys Grid */}
                <div className="grid grid-cols-3 gap-x-[1.5vw] gap-y-[1.5vh] px-[2vw]">
                    {numberKeys.map((key) => (
                        <button
                            key={key}
                            onClick={() => onKeyPress(key)}
                            className="
                                h-[7vh] rounded-[2vh] text-[3.8vh] font-bold transition-all duration-75 active:scale-95
                                bg-white text-slate-800
                                shadow-[0_0.5vh_0_0_rgba(203,213,225,1),0_0.3vh_0.6vh_0_rgba(0,0,0,0.1)]
                                border border-slate-100
                                active:shadow-none active:translate-y-[0.5vh]
                            "
                        >
                            {key}
                        </button>
                    ))}

                    {/* Clear */}
                    <button
                        onClick={() => { if (onClear) onClear(); }}
                        className="
                            h-[7vh] rounded-[2vh] text-[2.2vh] font-bold transition-all duration-75 active:scale-95
                            bg-red-50 text-brand-red
                            shadow-[0_0.5vh_0_0_rgba(254,202,202,1),0_0.3vh_0.6vh_0_rgba(0,0,0,0.05)]
                            border border-red-100
                            active:shadow-none active:translate-y-[0.5vh]
                            flex items-center justify-center
                        "
                    >
                        Clear
                    </button>

                    {/* 0 */}
                    <button
                        onClick={() => onKeyPress('0')}
                        className="
                            h-[7vh] rounded-[2vh] text-[3.8vh] font-bold transition-all duration-75 active:scale-95
                            bg-white text-slate-800
                            shadow-[0_0.5vh_0_0_rgba(203,213,225,1),0_0.3vh_0.6vh_0_rgba(0,0,0,0.1)]
                            border border-slate-100
                            active:shadow-none active:translate-y-[0.5vh]
                        "
                    >
                        0
                    </button>

                    {/* Backspace */}
                    <button
                        onClick={onDelete}
                        className="
                            h-[7vh] rounded-[2vh] text-[1.8vh] font-bold transition-all duration-75 active:scale-95
                            bg-red-50 text-brand-red
                            shadow-[0_0.5vh_0_0_rgba(254,202,202,1),0_0.3vh_0.6vh_0_rgba(0,0,0,0.05)]
                            border border-red-100
                            active:shadow-none active:translate-y-[0.5vh]
                            flex items-center justify-center
                        "
                    >
                        <Delete className="w-[2.8vh] h-[2.8vh]" />
                    </button>
                </div>

                {/* Submit */}
                <div className="mt-[2vh] px-[2vw]">
                    <button
                        onClick={onSubmit}
                        className="
                            w-full
                            bg-gradient-to-r from-brand-red to-[#b91c1c] text-white
                            font-bold text-[2.8vh] py-[1.5vh] rounded-[2vh]
                            shadow-[0_0.5vh_0_0_#991b1b,0_0.3vh_0.6vh_0_rgba(0,0,0,0.2)]
                            transition-all active:scale-[0.98]
                            active:shadow-none active:translate-y-[0.5vh]
                            flex items-center justify-center gap-[1vw] border-t border-white/20
                        "
                    >
                        Submit
                        <span className="text-[3.5vh] leading-none">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Keypad;
