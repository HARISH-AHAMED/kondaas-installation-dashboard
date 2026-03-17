import React, { useState } from 'react';
import { LayoutDashboard, Map, Settings, X, BatteryCharging, History, LogOut } from 'lucide-react';
import AnimatedIcon from '../common/AnimatedIcon';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [activepath, setActivePath] = useState('dashboard');

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, lordicon: "https://cdn.lordicon.com/osuxyevn.json" },
        { id: 'map', label: 'Installations Map', icon: Map, lordicon: "https://cdn.lordicon.com/surcxhka.json" },
        { id: 'activity', label: 'Recent Activity', icon: History, lordicon: "https://cdn.lordicon.com/gqdnbnwt.json" },
        { id: 'settings', label: 'Settings', icon: Settings, lordicon: "https://cdn.lordicon.com/hwuyodym.json" },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={toggleSidebar}
            />

            {/* Sidebar Container */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between h-16 px-6 bg-gray-900 border-b border-gray-800">
                    <div className="flex items-center space-x-2">
                        <BatteryCharging className="w-8 h-8 text-yellow-500" />
                        <span className="text-xl font-bold tracking-wider">KONDAAS</span>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActivePath(item.id)}
                                className={clsx(
                                    "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 group",
                                    `sidebar-btn-${item.id}`,
                                    activepath === item.id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                        : "text-gray-400"
                                )}
                            >
                                <div className="mr-3 w-5 h-5 flex items-center justify-center">
                                    <AnimatedIcon
                                        src={item.lordicon}
                                        trigger="hover"
                                        target={`.sidebar-btn-${item.id}`}
                                        colors={{
                                            primary: activepath === item.id ? '#ffffff' : '#9ca3af',
                                            secondary: activepath === item.id ? '#ffffff' : '#4b5563'
                                        }}
                                        size="20px"
                                    />
                                </div>
                                {item.label}
                            </button>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-400 rounded-lg transition-colors">
                        <LogOut size={20} className="mr-3" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
