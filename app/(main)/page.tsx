'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Calendar } from 'primereact/calendar';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { addLocale, locale } from 'primereact/api';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import dynamic from 'next/dynamic';
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Data locations with Madiun included
const locations = [
    { id: 6, name: 'PT. MARSTECH GLOBAL', position: [-7.6369966, 111.5426286] as [number, number] }, // Lokasi perusahaan
];

const Dashboard = () => {

    // Custom Pin Icon with a red pin
    let pinIcon = null;
    if (typeof window !== 'undefined') {
        const L = require('leaflet');
        pinIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -41],
        });
    }

    const menu1 = useRef<Menu>(null);
    const [calendarDate, setCalendarDate] = useState<Date | null>(null);
    const [employees, setEmployees] = useState<any[]>([]); // State to store employees data
    const [requests, setRequests] = useState<any[]>([]); // State to store leave requests data
    const [overtime, setOvertime] = useState<any[]>([]); // State to store overtime data
    const [dinasLuarKota, setDinasLuarKota] = useState<any[]>([]); // State to store dinas luar kota data
    const toast = useRef<Toast>(null); // Toast reference for showing error messages
    const router = useRouter(); // Initialize useRouter
    const [loading, setLoading] = useState<boolean>(false);

    // Configure the locale for the Calendar
    useEffect(() => {
        addLocale('en', {
            firstDayOfWeek: 1,
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            monthNames: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ],
            monthNamesShort: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ],
            today: 'Today',
            clear: 'Clear',
            dateFormat: 'dd/mm/yy',
            weekHeader: 'Wk'
        });
        locale('en');
    }, []);



    // Fetch employees data
    const fetchEmployees = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/karyawan', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEmployees(response.data); // Save employee data in state
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch employee data.', life: 3000 });
        }
    };

    // Fetch leave requests data
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get("http://127.0.0.1:8000/api/izin", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch leave requests.', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    // Fetch overtime data
    const fetchOvertime = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get("http://127.0.0.1:8000/api/lembur", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOvertime(response.data); // Save overtime data in state
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch overtime data.', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    // Fetch dinas luar kota data
    const fetchDinasLuarKota = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get("http://127.0.0.1:8000/api/dinas_luarkota", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDinasLuarKota(response.data); // Save dinas luar kota data in state
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch dinas luar kota data.', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees(); // Fetch employees on component mount
        fetchRequests(); // Fetch leave requests on component mount
        fetchOvertime(); // Fetch overtime data on component mount
        fetchDinasLuarKota(); // Fetch dinas luar kota data on component mount
    }, []);

    // Handle clicks for navigation
    const handleHadirClick = () => {
        router.push('/pages/Hadir');
    };

    const handleCutiClick = () => {
        router.push('/pages/Cuti');
    };

    const handleLemburClick = () => {
        router.push('/pages/Lembur');
    };

    const handleDinasClick = () => {
        router.push('/pages/Dinas');
    };

    return (
        <div className="grid">
            {/* Container HADIR */}
            <div className="col-12 lg:col-6 xl:col-3" onClick={handleHadirClick} style={{ cursor: 'pointer' }}>
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">HADIR</span>
                            <div className="text-900 font-medium text-xl">{employees.length}</div> {/* Display employee count */}
                        </div>
                        <div className="flex align-items-center justify-content-center"
                            style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#8FFF7C', borderRadius: '50%' }}>
                            <i className="pi pi-user text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{employees.length} </span>
                    <span className="text-500">Lihat selengkapnya</span>
                </div>
            </div>

            {/* Container CUTI */}
            <div className="col-12 lg:col-6 xl:col-3" onClick={handleCutiClick} style={{ cursor: 'pointer' }}>
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">CUTI</span>
                            <div className="text-900 font-medium text-xl">{requests.length}</div> {/* Display leave requests count */}
                        </div>
                        <div className="flex align-items-center justify-content-center"
                            style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#7C96FF', borderRadius: '50%' }}>
                            <i className="pi pi-fw pi-exclamation-circle text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{requests.length} </span>
                    <span className="text-500">Lihat selengkapnya</span>
                </div>
            </div>

            {/* Container LEMBUR */}
            <div className="col-12 lg:col-6 xl:col-3" onClick={handleLemburClick} style={{ cursor: 'pointer' }}>
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">LEMBUR</span>
                            <div className="text-900 font-medium text-xl">{overtime.length}</div> {/* Display overtime count */}
                        </div>
                        <div className="flex align-items-center justify-content-center"
                            style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#FA6568', borderRadius: '50%' }}>
                            <i className="pi pi-clock text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{overtime.length} </span>
                    <span className="text-500">Lihat selengkapnya</span>
                </div>
            </div>

            {/* Container DINAS LUAR KOTA */}
            <div className="col-12 lg:col-6 xl:col-3" onClick={handleDinasClick} style={{ cursor: 'pointer' }}>
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">DINAS LUAR KOTA</span>
                            <div className="text-900 font-medium text-xl">{dinasLuarKota.length}</div> {/* Display dinas luar kota count */}
                        </div>
                        <div className="flex align-items-center justify-content-center"
                            style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#EFE070', borderRadius: '50%' }}>
                            <i className="pi pi-fw pi-car text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{dinasLuarKota.length} </span>
                    <span className="text-500">Lihat selengkapnya</span>
                </div>
            </div>

            {/* Peta Lokasi */}
            <div className="col-12 xl:col-6">
                <div className="card mb-0">
                    <div className="flex justify-content-between align-items-center mb-5">
                        <h5>LOKASI PERUSAHAAN</h5>
                    </div>
                    <div style={{ height: '400px', width: '100%' }}>
                        <MapContainer center={[-7.6369966, 111.5426286]} zoom={14} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {locations.map((loc) => (
                                <Marker key={loc.id} position={loc.position as LatLngExpression} icon={pinIcon}>
                                    <Popup>{loc.name}</Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>

            {/* Calendar Card */}
            <div className="col-12 xl:col-6">
                <div className="card mb-0">
                    <div className="flex justify-content-between align-items-center mb-5">
                        <h5>KALENDER</h5>
                        <div>
                            <Button
                                type="button"
                                icon="pi pi-ellipsis-v"
                                rounded
                                text
                                className="p-button-plain"
                                onClick={(event) => menu1.current?.toggle(event)}
                            />
                            <Menu
                                ref={menu1}
                                popup
                                model={[{ label: 'Add New', icon: 'pi pi-fw pi-plus' }, { label: 'Remove', icon: 'pi pi-fw pi-minus' }]} />
                        </div>
                    </div>
                    <div className="relative" style={{ width: '100%', height: '400px' }}>
                        <Calendar
                            value={calendarDate}
                            onChange={(e) => {
                                if (e.value !== undefined) {
                                    setCalendarDate(e.value);
                                }
                            }}
                            dateFormat="dd/mm/yy"
                            yearNavigator
                            monthNavigator
                            yearRange="2020:2030"
                            locale="en"
                            inline
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
