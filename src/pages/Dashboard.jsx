import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/dashboard/StatCard';
import IndiaMap from '../components/dashboard/IndiaMap';
import { getInstallations } from '../services/api';
import { Zap, Users, IndianRupee, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

const Dashboard = () => {
    const [loading, setLoading] = useState(false); // Default to false if we have cache
    const [data, setData] = useState(() => {
        const cached = localStorage.getItem('kondaas_dashboard_data');
        return cached ? JSON.parse(cached) : [];
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Initial stats calculation function
    const calculateStats = (items) => {
        const totalInstalls = items.length;
        const totalCap = items.reduce((acc, curr) => acc + (Number(curr.CapacityKW) || 0), 0);
        const totalSav = items.reduce((acc, curr) => acc + (Number(curr.Savings) || 0), 0);
        return {
            totalInstallations: totalInstalls,
            totalCapacity: totalCap,
            totalSavings: totalSav,
        };
    };

    const [stats, setStats] = useState(() => {
        const cached = localStorage.getItem('kondaas_dashboard_data');
        return cached ? calculateStats(JSON.parse(cached)) : {
            totalInstallations: 0,
            totalCapacity: 0,
            totalSavings: 0,
        };
    });

    // Filter data based on search term
    const filteredData = data.filter(item =>
        item.Pincode?.toString().includes(searchTerm) ||
        item.City?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchData = async () => {
            // Only set loading true if we don't have data
            if (data.length === 0) setLoading(true);

            try {
                const response = await getInstallations();
                if (response.status === 'success') {
                    processData(response.data);
                    // Cache the fresh data
                    localStorage.setItem('kondaas_dashboard_data', JSON.stringify(response.data));
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, []);

    const processData = (items) => {
        setData(items);
        setStats(calculateStats(items));
    };

    return (
        <Layout searchTerm={searchTerm} onSearch={setSearchTerm}>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Installations"
                            value={stats.totalInstallations}
                            icon={Users}
                            color="bg-blue-100 text-blue-600"
                            trend="up"
                            trendValue="12%"
                        />
                        <StatCard
                            title="Total Capacity (kW)"
                            value={stats.totalCapacity}
                            icon={Zap}
                            color="bg-yellow-100 text-yellow-600"
                            trend="up"
                            trendValue="8%"
                        />
                        <StatCard
                            title="Est. Savings (₹)"
                            value={`₹${stats.totalSavings.toLocaleString()}`}
                            icon={IndianRupee}
                            color="bg-green-100 text-green-600"
                            trend="up"
                            trendValue="15%"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Map & Recent Activity */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-gray-900">Installation Map</h2>
                                    <span className="text-sm text-gray-500">Live View</span>
                                </div>
                                <IndiaMap data={filteredData} />
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Installations</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                                <th className="pb-3 font-medium">Customer</th>
                                                <th className="pb-3 font-medium">Location</th>
                                                <th className="pb-3 font-medium">Capacity</th>
                                                <th className="pb-3 font-medium">Status</th>
                                                <th className="pb-3 font-medium">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {filteredData.slice(0, 10).map((item, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                    <td className="py-3 font-medium text-gray-900">{item.CustomerName}</td>
                                                    <td className="py-3 text-gray-600">{item.City}, {item.State}</td>
                                                    <td className="py-3 text-gray-900">{item.CapacityKW} kW</td>
                                                    <td className="py-3">
                                                        <span className={clsx(
                                                            "px-2 py-1 rounded-full text-xs font-medium",
                                                            item.Status === 'Completed' ? "bg-green-100 text-green-700" :
                                                                item.Status === 'In Progress' ? "bg-blue-100 text-blue-700" :
                                                                    "bg-gray-100 text-gray-700"
                                                        )}>
                                                            {item.Status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-gray-500">{new Date(item.Date).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Top Cities & Info */}
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Top Cities</h2>
                                <div className="space-y-4">
                                    {/* Logic to aggregate city counts would go here. Mocking for now. */}
                                    {['Coimbatore', 'Chennai', 'Bangalore', 'Mumbai'].map((city, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-gray-500">
                                                    <MapPin size={16} />
                                                </div>
                                                <span className="font-medium text-gray-700">{city}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{Math.floor(Math.random() * 20) + 5} Install</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl text-white shadow-lg">
                                <h3 className="text-xl font-bold mb-2">Pro Tip</h3>
                                <p className="text-blue-100 text-sm mb-4">
                                    Regular maintenance ensures 15% better efficiency in solar panels. content.
                                </p>
                                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors w-full">
                                    View Maintenance Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
};

export default Dashboard;
