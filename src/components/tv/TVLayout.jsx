import React from 'react';

const TVLayout = ({ children }) => {
    return (
        <div className="w-[100vw] h-[100vh] overflow-hidden relative bg-slate-50 text-slate-900 select-none">
            {children}
        </div>
    );
};

export default TVLayout;
