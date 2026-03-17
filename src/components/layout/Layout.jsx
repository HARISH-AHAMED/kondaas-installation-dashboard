import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Search, Bell, User } from 'lucide-react';

const Layout = ({ children, onSearch, searchTerm }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 mr-4 text-gray-600 rounded-lg lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-800 hidden sm:block">Dashboard</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search pincode, city..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                                value={searchTerm}
                                onChange={onSearch ? (e) => onSearch(e.target.value) : undefined}
                            />
                        </div>
                        <button className="p-2 text-gray-600 rounded-full relative">
                            <Bell size={24} />
                            <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="p-2 text-gray-600 rounded-full">
                            <User size={24} />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
