'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { CSSTransition } from 'react-transition-group';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface AttendanceEntry {
    id: number;
    idKaryawan: string;
    tanggal: string;
    jam_masuk: string;
    foto_masuk: string;
    latitude_masuk: number;
    longitude_masuk: number;
    status: string;
}
interface Entry {
    id?: number;
    idKaryawan: string;
    tanggal: Date | null;
    jam_masuk: Date;
    jam_Keluar?: Date;
    foto_masuk?: string | File | null;
    foto_Keluar?: string | File | null;  
    latitude_masuk: number;
    latitude_Keluar?: number;
    longitude_masuk: number;
    longitude_Keluar?: number;
    status: string;
}

interface Employee {
    id: string;
    nama_karyawan: string;
}

const Hadir = () => {

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

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
    const [isFormVisible, setFormVisible] = useState(false);
    const [newEntry, setNewEntry] = useState<Entry>({
        idKaryawan: '',
        tanggal: null,
        jam_masuk: new Date(),
        jam_Keluar: new Date(),
        foto_masuk: null,
        foto_Keluar: null,
        latitude_masuk: 0,
        latitude_Keluar: 0,
        longitude_masuk: 0,
        longitude_Keluar: 0,
        status: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const toast = useRef<Toast>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchEmployees();
        fetchAttendance();
    }, []);

    const fetchEmployees = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/karyawan', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data karyawan.', life: 3000 });
        }
    };

    const fetchAttendance = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/absensi', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const attendanceData = response.data.map((entry: any) => ({
                id: entry.id,
                idKaryawan: entry.id_karyawan.toString(),
                tanggal: entry.tanggal,
                jam_masuk: entry.jam_masuk,
                foto_masuk: entry.foto_masuk,
                latitude_masuk: entry.latitude_masuk,
                longitude_masuk: entry.longitude_masuk,
                status: entry.status,
                foto_keluar: entry.foto_keluar,
                jam_keluar:entry.jam_keluar
            }));
            console.log('ini res')
            console.log(response.data)

            console.log('ini att')
            console.log(attendanceData)

            setAttendance(attendanceData);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data absensi.', life: 3000 });
        }
    };

    const handleShowForm = () => {
        setIsEditing(false);
        setFormVisible(true);
        setNewEntry({
            idKaryawan: '',
            tanggal: null,
            jam_masuk: new Date(),
            status: 'Tepat Waktu',
            foto_masuk: null,
            latitude_masuk: -7.636952968680463,
            longitude_masuk: 111.54260035904063,
        });
    };

    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);


    const handleEdit = (attendance: AttendanceEntry) => {
        setIsEditing(true);
        setFormVisible(true);
        setNewEntry({
            id: attendance.id,
            idKaryawan: attendance.idKaryawan,
            tanggal: new Date(attendance.tanggal),
            jam_masuk: new Date(`1970-01-01T${attendance.jam_masuk}`),
            status: attendance.status,
            foto_masuk: attendance.foto_masuk,
            latitude_masuk: attendance.latitude_masuk ?? -7.636952968680463,
            longitude_masuk: attendance.longitude_masuk ?? 111.54260035904063,
        });
    };

    const handleDelete = async (attendanceId: number) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Data absensi akan dihapus dan tidak bisa dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('authToken');
                try {
                    await axios.delete(`http://127.0.0.1:8000/api/absensi/${attendanceId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    Swal.fire("Dihapus!", "absensi berhasil dihapus.", "success");
                    fetchAttendance();
                } catch (error) {
                    console.error('Error deleting attendance:', error);
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus data absensi.', life: 3000 });
                }
            }
        });
    };

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            console.log(reader.result); // Ini adalah Base64
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!newEntry.idKaryawan || !newEntry.tanggal || !newEntry.jam_masuk) {
            toast.current?.show({ severity: 'warn', summary: 'Peringatan', detail: 'Semua field harus diisi.', life: 3000 });
            return;
        }

        const formattedTanggal = newEntry.tanggal instanceof Date && !isNaN(newEntry.tanggal.getTime())
            ? newEntry.tanggal.toISOString().split('T')[0]
            : '';

        const formattedJamMasuk = newEntry.jam_masuk.toTimeString().split(' ')[0].slice(0, 5);

        const latitude = Number(newEntry.latitude_masuk);
        const longitude = Number(newEntry.longitude_masuk);

        if (isNaN(latitude) || isNaN(longitude)) {
            toast.current?.show({ severity: 'warn', summary: 'Peringatan', detail: 'Latitude dan longitude harus berupa angka yang valid.', life: 3000 });
            return;
        }

        let fotoMasukBase64 = '';
        if (newEntry.foto_masuk && newEntry.foto_masuk instanceof File) {
            const maxFileSize = 20 * 1024 * 1024; // 20 MB in bytes
            if (newEntry.foto_masuk.size > maxFileSize) {
                toast.current?.show({ severity: 'warn', summary: 'Peringatan', detail: 'Ukuran foto melebihi 20 MB.', life: 3000 });
                return;
            }
            fotoMasukBase64 = await convertToBase64(newEntry.foto_masuk) as string;
        }

        const newAttendanceData = {
            id_karyawan: newEntry.idKaryawan,
            tanggal: formattedTanggal,
            jam_masuk: formattedJamMasuk,
            foto_masuk: fotoMasukBase64,
            latitude_masuk: latitude,
            longitude_masuk: longitude,
            status: newEntry.status,
        };

        const token = localStorage.getItem('authToken');
        try {
            const url = isEditing
                ? `http://127.0.0.1:8000/api/absensi/${newEntry.id}`
                : 'http://127.0.0.1:8000/api/absensi/created';

            const method = isEditing ? 'put' : 'post';
            const response = await axios({
                method,
                url,
                data: newAttendanceData,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200 || response.status === 201) {
                fetchAttendance();
                setFormVisible(false);
                setNewEntry({
                    idKaryawan: '',
                    tanggal: null,
                    jam_masuk: new Date(),
                    status: 'Tepat Waktu',
                    foto_masuk: null,
                    latitude_masuk: 0,
                    longitude_masuk: 0,
                });

                Swal.fire({
                    title: "Berhasil!",
                    text: isEditing
                        ? "Data absensi berhasil diperbarui."
                        : "Data absensi berhasil disimpan.",
                    icon: "success",
                    confirmButtonText: "OK"
                });

            }
        } catch (error: any) {
            console.error('Error saving attendance:', error);
            if (error.response && error.response.data) {
                console.error('Server response:', error.response.data);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: `Gagal menyimpan data absensi: ${error.response.data.message || 'Periksa data Anda.'}`, life: 3000 });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Gagal menyimpan data absensi.', life: 3000 });
            }
        }
    };

    const convertToBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleMapClose = () => {
        setSelectedLocation(null); // Menutup dialog dengan mengatur selectedLocation menjadi null
    };

    const getEmployeeNameById = (idKaryawan: string) => {
        const employee = employees.find(emp => emp.id.toString() === idKaryawan);
        return employee ? employee.nama_karyawan : 'Tidak Diketahui';
    };

    useEffect(() => {
        console.log(attendance)
    }, [attendance])


    const [showAbsensiKeluarForm, setShowAbsensiKeluarForm] = useState(false);
    const [absensiKeluarData, setAbsensiKeluarData] = useState({
        jam_keluar: '',
        foto_keluar: '',
        latitude_keluar: '',
        longitude_keluar: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAbsensiKeluarData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSaveAbsensiKeluar = async () => {
        try {

            const response = await fetch(`http://127.0.0.1:8000/api/absensi/${newEntry.id}/keluar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jam_keluar: absensiKeluarData.jam_keluar,
                    foto_keluar: absensiKeluarData.foto_keluar,
                    latitude_keluar: absensiKeluarData.latitude_keluar,
                    longitude_keluar: absensiKeluarData.longitude_keluar,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Data absensi keluar berhasil disimpan.', life: 3000 });
            console.log(result);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Gagal', detail: 'Gagal menyimpan data absensi keluar.', life: 3000 });
            console.error(error);
        }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h5>Absensi Karyawan</h5>

                    <div className="flex align-items-center">
                        <Button
                            label="Tambah Data Absensi"
                            icon="pi pi-plus"
                            className="mb-3"
                            style={{ width: '220px', borderRadius: '10px' }}
                            onClick={() => handleShowForm()}
                        />
                        <Button
                            label="Absensi Keluar"
                            icon="pi pi-sign-out"
                            className="mb-3 ml-2"
                            style={{ width: '220px', borderRadius: '10px' }}
                            onClick={() => setShowAbsensiKeluarForm(true)}
                        />
                    </div>
                </div>
            </div>
            <CSSTransition
                nodeRef={formRef}
                in={isFormVisible}
                timeout={300}
                classNames="fade"
                unmountOnExit
            >
                <div ref={formRef}>
                    <Dialog
                        visible={isFormVisible}
                        style={{ width: '50vw' }}
                        header="Form Absensi"
                        modal
                        onHide={() => setFormVisible(false)}
                    >
                        <div className="p-fluid grid formgrid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="karyawan">Pilih Karyawan</label>
                                <Dropdown
                                    id="karyawan"
                                    value={newEntry.idKaryawan}
                                    options={employees.map(emp => ({ label: emp.nama_karyawan, value: emp.id }))}
                                    onChange={(e) => setNewEntry({ ...newEntry, idKaryawan: e.value })}
                                    placeholder="Pilih Karyawan"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="tanggal">Tanggal</label>
                                <Calendar
                                    id="tanggal"
                                    value={newEntry.tanggal}
                                    onChange={(e) => setNewEntry({ ...newEntry, tanggal: e.value || null })}
                                    dateFormat="yy-mm-dd"
                                    showIcon
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="jamMasuk">Jam Masuk</label>
                                <input
                                    type="time"
                                    id="jamMasuk"
                                    value={newEntry.jam_masuk.toTimeString().split(' ')[0]}
                                    onChange={(e) => setNewEntry({ ...newEntry, jam_masuk: new Date(`1970-01-01T${e.target.value}:00`) })}
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="status">Status</label>
                                <Dropdown
                                    id="status"
                                    value={newEntry.status}
                                    options={[{ label: 'Tepat Waktu', value: 'Tepat Waktu' }, { label: 'Terlambat', value: 'Terlambat' }]}
                                    onChange={(e) => setNewEntry({ ...newEntry, status: e.value })}
                                    placeholder="Pilih Status"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="fotoMasuk">Foto Masuk</label>
                                <input
                                    type="file"
                                    id="fotoMasuk"
                                    onChange={(e) => setNewEntry({ ...newEntry, foto_masuk: e.target.files ? e.target.files[0] : null })}
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="latitude">Latitude</label>
                                <input
                                    type="number"
                                    id="latitude"
                                    value={newEntry.latitude_masuk}
                                    onChange={(e) => setNewEntry({ ...newEntry, latitude_masuk: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="longitude">Longitude</label>
                                <input
                                    type="number"
                                    id="longitude"
                                    value={newEntry.longitude_masuk}
                                    onChange={(e) => setNewEntry({ ...newEntry, longitude_masuk: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="field col-12">
                                <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
                            </div>
                        </div>
                    </Dialog>
                </div>
                {/* Dialog untuk Absensi Keluar */}
            </CSSTransition>
            <Dialog
                visible={showAbsensiKeluarForm}
                onHide={() => setShowAbsensiKeluarForm(false)}
                header="Form Absensi Keluar"
                style={{ width: '500px' }}
            >
                <div className="p-fluid">
                     {/* Dropdown for selecting employee */}
        <div className="field col-12 md:col-4">
            <label htmlFor="karyawan">Pilih Karyawan</label>
            <Dropdown
                id="karyawan"
                value={newEntry.idKaryawan}
                options={employees.map(emp => ({ label: emp.nama_karyawan, value: emp.id }))}
                onChange={(e) => setNewEntry({ ...newEntry, idKaryawan: e.value })}
                placeholder="Pilih Karyawan"
            />
        </div>
                <div className="field col-12 md:col-4">
                                <label htmlFor="jamKeluar">Jam Keluar</label>
                                <input
                                    type="time"
                                    id="jamKeluar"
                                    value={newEntry.jam_masuk.toTimeString().split(' ')[0]}
                                    onChange={(e) => setNewEntry({ ...newEntry, jam_masuk: new Date(`1970-01-01T${e.target.value}:00`) })}
                                />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="fotoKeluar">Foto Keluar</label>
                        <input
                            type="file"
                            id="fotoKeluar"
                            onChange={(e) => setNewEntry({ ...newEntry, foto_Keluar: e.target.files ? e.target.files[0] : null })}  // Handle foto_Keluar
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="latitudeKeluar">Latitude Keluar</label>
                        <input
                            type="number"
                            id="latitudeKeluar"
                            value={newEntry.latitude_Keluar}  // Bind latitude_Keluar
                            onChange={(e) => setNewEntry({ ...newEntry, latitude_Keluar: parseFloat(e.target.value) })}  // Set latitude_Keluar
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="longitudeKeluar">Longitude Keluar</label>
                        <input
                            type="number"
                            id="longitudeKeluar"
                            value={newEntry.longitude_Keluar}  // Bind longitude_Keluar
                            onChange={(e) => setNewEntry({ ...newEntry, longitude_Keluar: parseFloat(e.target.value) })}  // Set longitude_Keluar
                        />
                    </div>
                </div>
                <div className="flex justify-content-end mt-3">
                    <Button
                        label="Simpan"
                        icon="pi pi-check"
                        className="p-button-success"
                        onClick={handleSaveAbsensiKeluar}
                    />
                    <Button
                        label="Batal"
                        icon="pi pi-times"
                        className="p-button-secondary ml-2"
                        onClick={() => setShowAbsensiKeluarForm(false)}
                    />
                </div>
            </Dialog>
            <DataTable
                value={attendance}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                header="Daftar Absensi"
                responsiveLayout="scroll"
                className="mt-3"
            >
                <Column
                    field="idKaryawan"
                    header="Karyawan"
                    body={(rowData) => getEmployeeNameById(rowData.idKaryawan)}
                />
                <Column field="tanggal" header="Tanggal" />
                <Column field="jam_masuk" header="Jam Masuk" />
                <Column field="status" header="Status" />
                <Column field="foto_masuk" header="Foto Masuk" body={(rowData) => (
                    <img src={rowData.foto_masuk} alt="Foto Masuk" style={{ width: '100px', height: 'auto' }} />
                )} />
                <Column field="latitude_masuk" header="Latitude Masuk" />
                <Column field="longitude_masuk" header="Longitude Masuk" />
                <Column
                    header="Peta Lokasi masuk"
                    body={(rowData) => {
                        const latitude = rowData.latitude_masuk;
                        const longitude = rowData.longitude_masuk;

                        return latitude && longitude ? (
                            <Button
                                label="Lihat Peta"
                                icon="pi pi-map"
                                onClick={() => setSelectedLocation({ latitude, longitude })}
                                className="p-button-info"
                            />
                        ) : (
                            'Lokasi Tidak Diketahui'
                        );
                    }}
                />
                {/* Kolom Jam Keluar */}
                <Column field="jam_keluar" header="Jam Keluar" />
                {/* Kolom Foto Keluar */}
                <Column
                    field="foto_keluar"
                    header="Foto Keluar"
                    body={(rowData) =>
                        rowData.foto_keluar ? (
                            <img
                                src={rowData.foto_keluar}
                                alt="Foto Keluar"
                                style={{ width: '80px', height: '80px', borderRadius: '10px' }}
                            />
                        ) : (
                            <span>No Image</span>
                        )
                    }
                />
                {/* Kolom Latitude Keluar */}
                <Column field="latitude_keluar" header="Latitude Keluar" />
                {/* Kolom Longitude Keluar */}
                <Column field="longitude_keluar" header="Longitude Keluar" />
                <Column
                    header="Peta Lokasi keluar"
                    body={(rowData) => {
                        const latitude = rowData.latitude_masuk;
                        const longitude = rowData.longitude_masuk;

                        return latitude && longitude ? (
                            <Button
                                label="Lihat Peta"
                                icon="pi pi-map"
                                onClick={() => setSelectedLocation({ latitude, longitude })}
                                className="p-button-info"
                            />
                        ) : (
                            'Lokasi Tidak Diketahui'
                        );
                    }}
                />
                {/* Kolom Aksi */}
                <Column
                    header="Aksi"
                    body={(rowData) => (
                        <div className="d-flex align-items-center">
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-rounded p-button-success mr-2"
                                onClick={() => handleEdit(rowData)}
                                tooltip="Edit"
                            />
                            <Button
                                icon="pi pi-trash"
                                className="p-button-rounded p-button-danger"
                                onClick={() => handleDelete(rowData.id)}
                                tooltip="Hapus"
                            />
                        </div>
                    )}
                />
            </DataTable>
            {/* Map Dialog to show map when location button is clicked */}
            <Dialog
                visible={!!selectedLocation}
                style={{ width: '50vw' }}
                header="Peta Lokasi"
                modal
                onHide={handleMapClose}
            >
                {selectedLocation && (
                    <div style={{ height: '400px', width: '100%' }}>
                        <MapContainer
                            center={[selectedLocation.latitude, selectedLocation.longitude]}
                            zoom={14}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />
                            <Marker
                                position={[selectedLocation.latitude, selectedLocation.longitude]}
                                icon={pinIcon} // Custom pin icon
                            >
                                <Popup>
                                    Lokasi: Lat: {selectedLocation.latitude}, Long: {selectedLocation.longitude}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                )}
            </Dialog>
        </div>
    );
}

export default Hadir;