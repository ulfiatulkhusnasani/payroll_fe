'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown'; // Tambahkan ini untuk dropdown jika diperlukan
import axios from 'axios';
import Swal from 'sweetalert2';

interface PayrollData {
    id: number;
    idKaryawan: string;
    namaKaryawan: string;
    izinCount: number;
    cutiCount: number;
    lemburCount: number;
    dinasLuarKotaCount: number;
    kehadiranCount: number;
    gajiPokok: number;
    uangKehadiran: number;
    uangMakan: number;
    tunjangan: number;
    bonus: number;
    totalBonus: number;
    potongan: number;
    totalgaji: number;
    slipGaji: string | null;
}

const DataPayrollKaryawan = () => {
    const [payrolls, setPayrolls] = useState<PayrollData[]>([]);
    const [karyawanList, setKaryawanList] = useState<any[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<PayrollData | null>(null);
    const [formData, setFormData] = useState<PayrollData>({
        id: 0,
        idKaryawan: '',
        namaKaryawan: '',
        izinCount: 0,
        cutiCount: 0,
        lemburCount: 0,
        dinasLuarKotaCount: 0,
        kehadiranCount: 0,
        gajiPokok: 0,
        uangKehadiran: 0,
        uangMakan: 0,
        tunjangan: 0,
        bonus: 0,
        totalBonus: 0,
        potongan: 0,
        totalgaji: 0,
        slipGaji: ''
    });
    const [loading, setLoading] = useState(false);
    const toastRef = useRef<Toast>(null);

    const fetchKaryawanList = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get("http://127.0.0.1:8000/api/karyawan-with-jabatan", {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Pastikan data sesuai dengan struktur yang diterima dari backend
            setKaryawanList(response.data);
        } catch (error) {
            handleAxiosError(error, "data karyawan");
        } finally {
            setLoading(false);
        }
    };    

    const handleAxiosError = (error: any, source: string) => {
        console.error(`Error occurred while fetching ${source}:`, error);
        if (toastRef.current) {
            toastRef.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Gagal mengambil data ${source}.`,
                life: 3000,
            });
        }
    };

    const fetchPayrollData = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/payroll-summary/{id}', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const payrollData = response.data.payroll_summaries.map((employee: any) => ({
                id: employee.id_karyawan,
                idKaryawan: employee.id_karyawan,
                namaKaryawan: employee.nama_karyawan,
                izinCount: employee.izin_count || 0,
                cutiCount: employee.cuti_count || 0,
                lemburCount: employee.lembur_count || 0,
                dinasLuarKotaCount: employee.dinas_luar_kota_count || 0,
                kehadiranCount: employee.kehadiran_count || 0,
                gajiPokok: employee.gaji_pokok || 0,
                uangKehadiran: employee.uang_kehadiran_perhari || 0,
                uangMakan: employee.uang_makan || 0,
                tunjangan: employee.tunjangan || 0,
                bonus: employee.bonus || 0,
                totalBonus: employee.total_bonus || 0,
                potongan: employee.potongan || 0,
                totalgaji: employee.total_gaji || 0, // Pastikan total_gaji diterima
                slipGaji: employee.slip_gaji || '',
            }));            
            setPayrolls(payrollData);
        } catch (error) {
            handleAxiosError(error, "payroll");
        }
    };

    useEffect(() => {
        fetchPayrollData();
        fetchKaryawanList();
    }, []);

    const savePayroll = async () => {
        const token = localStorage.getItem('authToken');
        const mappedData = {
            id: formData.id,
            id_karyawan: formData.idKaryawan,
            nama_karyawan: formData.namaKaryawan,
            izin_count: formData.izinCount,
            cuti_count: formData.cutiCount,
            lembur_count: formData.lemburCount,
            dinas_luar_kota_count: formData.dinasLuarKotaCount,
            kehadiran_count: formData.kehadiranCount,
            gaji_pokok: formData.gajiPokok,
            uang_kehadiran: formData.uangKehadiran,
            uang_makan: formData.uangMakan,
            bonus: formData.bonus,
            total_bonus: formData.totalBonus,
            potongan: formData.potongan,
        };

        if (!formData.namaKaryawan) {
            if (toastRef.current) {
                toastRef.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Nama karyawan harus diisi.',
                    life: 3000,
                });
            }
            return;
        }

        try {
            if (selectedPayroll) {
                await axios.put(`http://127.0.0.1:8000/api/payroll-karyawan/${formData.id}`, mappedData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post('http://127.0.0.1:8000/api/payroll-karyawan', mappedData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchPayrollData();
            setShowDialog(false);
            if (toastRef.current) {
                toastRef.current.show({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data payroll karyawan berhasil disimpan',
                });
            }
        } catch (error) {
            console.error("Error saving payroll:", error);
            if (toastRef.current) {
                toastRef.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to save payroll data.',
                    life: 3000,
                });
            }
        }
    };

    const hideDialog = () => {
        setShowDialog(false);
    };

    const onInputChange = async (
        e: React.ChangeEvent<HTMLInputElement> | { value: any },
        field: keyof PayrollData
    ) => {
        const value = 'value' in e ? e.value : e.target.value;
        const parsedValue = ['izinCount', 'cutiCount', 'lemburCount', 'dinasLuarKotaCount', 'kehadiranCount', 'gajiPokok', 'uangKehadiran', 'uangMakan', 'bonus', 'totalBonus', 'potongan'].includes(field)
            ? Number(value)
            : value;
        setFormData({ ...formData, [field]: parsedValue });
    };

    const actionTemplate = (rowData: PayrollData) => (
        <div className="d-flex align-items-center">
            <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-success p-mr-2"
                onClick={() => {
                    setFormData({ ...rowData });
                    setSelectedPayroll(rowData);
                    setShowDialog(true);
                }}
                tooltip="Edit"
            />
        </div>
    );

    return (
        <div className="datatable-templating-demo">
            <div className="card">
                <h5>Data Payroll Karyawan</h5>
                <DataTable
                    value={payrolls}
                    responsiveLayout="scroll"
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                > 
                <Column field="id" header="ID" style={{ width: '10%' }} />
                <Column field="namaKaryawan" header="Nama Karyawan" style={{ width: '15%' }} />
                <Column field="izinCount" header="Jumlah Izin" style={{ width: '10%' }} />
                <Column field="cutiCount" header="Jumlah Cuti" style={{ width: '10%' }} />
                <Column field="lemburCount" header="Jumlah Lembur" style={{ width: '10%' }} />
                <Column field="dinasLuarKotaCount" header="Dinas Keluar Kota" style={{ width: '15%' }} />
                <Column field="kehadiranCount" header="Jumlah Kehadiran" style={{ width: '15%' }} />
                <Column 
    field="gajiPokok" 
    header="Gaji Pokok" 
    body={(data) => `Rp. ${data.gajiPokok ? data.gajiPokok.toLocaleString('id-ID') : '0'}`} 
    style={{ width: '15%' }} 
/>
<Column 
    field="uangKehadiran" 
    header="Uang Kehadiran" 
    body={(data) => `Rp. ${data.uangKehadiran ? data.uangKehadiran.toLocaleString('id-ID') : '0'}`} 
    style={{ width: '15%' }} 
/>
<Column 
    field="uangMakan" 
    header="Uang Makan" 
    body={(data) => `Rp. ${data.uangMakan ? data.uangMakan.toLocaleString('id-ID') : '0'}`} 
    style={{ width: '15%' }} 
/>
<Column 
    field="tunjangan" 
    header="Tunjangan" 
    body={(data) => `Rp. ${data.tunjangan ? data.tunjangan.toLocaleString('id-ID') : '0'}`} 
    style={{ width: '15%' }} 
/>
<Column 
    field="bonus" 
    header="Bonus" 
    body={(data) => `Rp. ${data.bonus ? data.bonus.toLocaleString('id-ID') : '0'}`} 
    style={{ width: '15%' }} 
/>
<Column 
    field="totalBonus" 
    header="Total Bonus" 
    body={(data) => `Rp. ${data.totalBonus ? data.totalBonus.toLocaleString('id-ID') : '0'}`} 
    style={{ width: '15%' }} 
/>
 <Column 
                    field="potongan" 
                    header="Potongan" 
                    body={(data) => `Rp. ${data.potongan ? data.potongan.toLocaleString('id-ID') : '0'}`} 
                    style={{ width: '15%' }} 
                />
                <Column 
                    field="totalgaji" 
                    header="Total Gaji" 
                    body={(rowData) => rowData.totalgaji.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} 
                />
                <Column 
    field="slipGaji" 
    header="Slip Gaji" 
    body={(data) => (
        <Button 
            label="Lihat Slip Gaji" 
            icon="pi pi-eye" 
            className="p-button-sm p-button-info"
            onClick={() => {
                // Tindakan ketika tombol diklik, misalnya membuka dialog untuk melihat slip gaji
                Swal.fire({
                    title: `Slip Gaji ${data.namaKaryawan}`,
                    text: 'Ini adalah slip gaji kosong',
                    icon: 'info',
                    confirmButtonText: 'Tutup',
                });
            }}
        />
    )}
    style={{ width: '15%' }}
/>
            </DataTable>
        </div>
    </div>
);
};

export default DataPayrollKaryawan;