import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

const MapUpdater = ({ selectedState }) => {
    const map = useMap();
    React.useEffect(() => {
        const flyOptions = {
            duration: 1.5,
            easeLinearity: 0.25, // Makes the zoom arc smooth without vibrating
        };

        if (!selectedState || selectedState === 'Overall') {
            map.flyTo([11.1271, 78.6569], 7, flyOptions);
        } else if (selectedState === 'Tamil Nadu') {
            map.flyTo([11.1271, 78.6569], 7.2, flyOptions);
        } else if (selectedState === 'Kerala') {
            map.flyTo([10.8505, 76.2711], 7.5, flyOptions);
        }
    }, [selectedState, map]);
    return null;
};

// Fix for default marker icon issues in React Leaflet if we were using Markers
// We are using CircleMarkers so it is less of an issue, but good to know.

const IndiaMap = ({ data, darkMode = false, selectedState = 'Overall', className = "h-[400px]" }) => {
    // Center of South India (Tamil Nadu focus)
    const center = [11.1271, 78.6569];

    // Expanded mapping of cities (focusing on Tamil Nadu & Major South Indian Cities)
    const cityCoords = {
        // Major Metros
        'coimbatore': [11.0168, 76.9558],
        'mumbai': [19.0760, 72.8777],
        'bangalore': [12.9716, 77.5946],
        'bengaluru': [12.9716, 77.5946], // Handle alternate spelling
        'chennai': [13.0827, 80.2707],
        'delhi': [28.7041, 77.1025],
        'hyderabad': [17.3850, 78.4867],
        'kolkata': [22.5726, 88.3639],
        'pune': [18.5204, 73.8567],
        'ahmedabad': [23.0225, 72.5714],
        'jaipur': [26.9124, 75.7873],
        'surat': [21.1702, 72.8311],
        'lucknow': [26.8467, 80.9462],

        // Tamil Nadu Cities & Districts
        'tiruppur': [11.1085, 77.3411],
        'erode': [11.3410, 77.7172],
        'salem': [11.6643, 78.1460],
        'madurai': [9.9252, 78.1198],
        'trichy': [10.7905, 78.7047],
        'tiruchirappalli': [10.7905, 78.7047], // Alternate
        'tirunelveli': [8.7139, 77.7567],
        'vellore': [12.9165, 79.1325],
        'thoothukudi': [8.7642, 78.1348],
        'tuticorin': [8.7642, 78.1348], // Alternate
        'nagercoil': [8.1833, 77.4119],
        'thanjavur': [10.7870, 79.1378],
        'dindigul': [10.3673, 77.9803],
        'cuddalore': [11.7480, 79.7714],
        'kanchipuram': [12.8185, 79.7036],
        'karur': [10.9601, 78.0766],
        'hosur': [12.7409, 77.8253],
        'kumbakonam': [10.9602, 79.3845],
        'dharmapuri': [12.1211, 78.1582],
        'krishnagiri': [12.5186, 78.2138],
        'namakkal': [11.2189, 78.1674],
        'pudukkottai': [10.3797, 78.8208],
        'ramanathapuram': [9.3639, 78.8395],
        'sivaganga': [9.8433, 78.4809],
        'theni': [10.0104, 77.4777],
        'nilgiris': [11.4916, 76.7337],
        'ooty': [11.4102, 76.6950],
        'virudhunagar': [9.5680, 77.9624],
        'ariyalur': [11.1401, 79.0786],
        'nagapattinam': [10.7672, 79.8431],
        'perambalur': [11.2358, 78.8661],
        'thiruvarur': [10.7766, 79.6344],
        'villupuram': [11.9401, 79.4861],
        'kallakurichi': [11.7384, 78.9635],
        'chengalpattu': [12.6819, 79.9888],
        'ranipet': [12.9296, 79.3324],
        'tenkasi': [8.9564, 77.3014],
        'tirupathur': [12.4925, 78.5676],
        'mayiladuthurai': [11.0970, 79.6524],

        // Other South Indian Majors
        'kochi': [9.9312, 76.2673],
        'thiruvananthapuram': [8.5241, 76.9366],
        'trivandrum': [8.5241, 76.9366],
        'kozhikode': [11.2588, 75.7804],
        'calicut': [11.2588, 75.7804],        // alternate name
        'thrissur': [10.5276, 76.2144],
        'palakkad': [10.7867, 76.6548],
        'malappuram': [11.0730, 76.0740],
        'kannur': [11.8745, 75.3704],
        'kollam': [8.8932, 76.6141],
        'alappuzha': [9.4981, 76.3388],
        'kottayam': [9.5916, 76.5222],
        'idukki': [9.9189, 76.9727],
        'ernakulam': [9.9816, 76.2999],
        'pathanamthitta': [9.2648, 76.7870],
        'kasaragod': [12.4996, 74.9869],
        'wayanad': [11.6854, 76.1320],
        'mysore': [12.2958, 76.6394],
        'visakhapatnam': [17.6868, 83.2185],
        'vijayawada': [16.5062, 80.6480],
    };

    const tileUrl = darkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attribution = darkMode
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    return (
        <div className={`w-full rounded-xl overflow-hidden shadow-sm border ${darkMode ? 'border-slate-700' : 'border-gray-200'} z-0 relative ${className}`}>
            <MapContainer
                center={center}
                zoom={7}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution={attribution}
                    url={tileUrl}
                />

                <MapUpdater selectedState={selectedState} />

                {React.useMemo(() => {
                    if (!data) return [];
                    const cityMap = {};

                    data.forEach(item => {
                        const city = item.City ? item.City.trim() : 'Unknown';
                        if (!cityMap[city]) {
                            cityMap[city] = {
                                ...item,
                                City: city,
                                Installations: 0,
                                Capacity_kW: 0
                            };
                        }
                        cityMap[city].Installations += (Number(item.Installations) || 0);
                        cityMap[city].Capacity_kW += (Number(item.Capacity_kW) || 0);
                    });

                    return Object.values(cityMap);
                }, [data]).map((item, index) => {
                    const normalizedCity = item.City ? item.City.toLowerCase() : '';
                    const coords = cityCoords[normalizedCity];
                    if (!coords) {
                        console.warn(`Missing coordinates for city: ${item.City}`);
                        return null;
                    }

                    return (
                        <CircleMarker
                            key={index}
                            center={coords}
                            pathOptions={{ color: '#D71920', fillColor: '#D71920', fillOpacity: 0.6 }}
                            radius={6} // Fixed size as requested by user
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold text-gray-900">{item.City}</h3>
                                    <p className="text-gray-600">{item.State}</p>
                                    <p className="text-blue-600 font-semibold">{item.Capacity_kW} kW Capacity</p>
                                    <p className="text-sm text-gray-500">Installations: {item.Installations}</p>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default IndiaMap;
