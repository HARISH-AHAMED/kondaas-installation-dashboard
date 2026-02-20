import api from '../lib/axios';
import { fetchMockData } from './mockData';

// Toggle this to force mock data even if API URL is set
const USE_MOCK = !import.meta.env.VITE_API_URL;

export const getInstallations = async () => {
    // fast-fail if no API URL is set
    if (!import.meta.env.VITE_API_URL || USE_MOCK) {
        console.log("Using Mock Data (Fast Path)");
        return fetchMockData();
    }

    try {
        const response = await api.get('');
        return response;
    } catch (error) {
        console.error("API Error, falling back to mock data", error);
        return fetchMockData();
    }
};
