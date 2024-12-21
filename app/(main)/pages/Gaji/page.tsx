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

interface SalaryData {
    id: number;
    idKaryawan: string; // Tambahkan untuk ID Karyawan
    namaKaryawan: string;
    hadir: number;
    cuti: number;
    lembur: number;
    dinasKeluarKota: number;
    potongan: number;
    gajiPokok: number;
}

const DataGajiKaryawan = () => {
    const [salaries, setSalaries] = useState<SalaryData[]>([]);
    const [karyawanList, setKaryawanList] = useState<any[]>([]); 
    const [showDialog, setShowDialog] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<SalaryData | null>(null);
    const [formData, setFormData] = useState<SalaryData>({
        id: 0,
        idKaryawan: '',
        namaKaryawan: '',
        hadir: 0,
        cuti: 0,
        lembur: 0,
        dinasKeluarKota: 0,
        potongan: 0,
        gajiPokok: 0,
    });
    const [loading, setLoading] = useState(false); 

    const toastRef = useRef<Toast>(null); 

    const fetchKaryawanList = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get("http://192.168.200.37:8001/api/karyawan", {
                headers: { Authorization: `Bearer ${token}` },
            });
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

    const fetchEmployees = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('http://192.168.200.37:8001/api/gaji-karyawan', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const employeeData = response.data.map((employee: any) => ({
                id: employee.id, // ID gaji
                idKaryawan: employee.id_karyawan, // ID karyawan
                namaKaryawan: employee.nama_karyawan, // Nama Karyawan
                hadir: employee.hadir, // Jumlah hadir
                cuti: employee.cuti, // Jumlah cuti
                lembur: employee.lembur, // Jumlah lembur
                dinasKeluarKota: employee.dinas_keluar_kota, // Dinas keluar kota
                potongan: employee.potongan, // Potongan
                gajiPokok: employee.gaji_pokok, // Gaji Pokok
            }));
            setSalaries(employeeData);
        } catch (error) {
            handleAxiosError(error, "gaji karyawan");
        }
    };    

    useEffect(() => {
        fetchEmployees();
        fetchKaryawanList();
    }, []);

    const saveSalary = async () => {
        const token = localStorage.getItem('authToken');
        const mappedData = {
            id: formData.id,
            id_karyawan: formData.idKaryawan, // Kirim ID Karyawan
            nama_karyawan: formData.namaKaryawan, // Make sure to include the `namaKaryawan` field here
            hadir: formData.hadir,
            cuti: formData.cuti,
            lembur: formData.lembur,
            dinas_keluar_kota: formData.dinasKeluarKota,
            potongan: formData.potongan,
            gaji_pokok: formData.gajiPokok,
        };
   
        // Validate the form data before submitting
        if (!formData.namaKaryawan) {
            if (toastRef.current) {
                toastRef.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Nama karyawan harus diisi.',
                    life: 3000,
                });
            }
            return; // Stop the request if validation fails
        }
   
        try {
            if (selectedSalary) {
                await axios.put(`http://192.168.200.37:8001/api/gaji-karyawan/${formData.id}`, mappedData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                await axios.post('http://192.168.200.37:8001/api/gaji-karyawan', mappedData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
            fetchEmployees();
            setShowDialog(false);
            if (toastRef.current) {
                toastRef.current.show({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data gaji karyawan berhasil disimpan',
                });
            }
        } catch (error: any) {
            console.error('Error saving salary:', error);
            console.error('Response:', error?.response?.data); // Log server response
            if (toastRef.current) {
                toastRef.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal menyimpan data gaji karyawan.',
                    life: 3000,
                });
            }
        }
    };       

    const deleteSalary = async (id: number) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Data gaji karyawan ini akan dihapus!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('authToken');
                try {
                    await axios.delete(`http://192.168.200.37:8001/api/gaji-karyawan/${id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    fetchEmployees();
                    Swal.fire('Dihapus!', 'Data gaji karyawan telah dihapus.', 'success');
                } catch (error) {
                    console.error('Error deleting salary:', error);
                    Swal.fire('Error!', 'Gagal menghapus data gaji karyawan.', 'error');
                }
            }
        });
    };

    const hideDialog = () => {
        setShowDialog(false);
    };

    const onInputChange = (
        e: React.ChangeEvent<HTMLInputElement> | { value: any },
        field: keyof SalaryData
    ) => {
        const value = 'value' in e ? e.value : e.target.value;
        if (field === 'idKaryawan') {
            const selectedEmployee = karyawanList.find(
                (karyawan) => karyawan.id === value
            );
            setFormData({
                ...formData,
                [field]: value,
                namaKaryawan: selectedEmployee ? selectedEmployee.nama_karyawan : '',
            });
        } else {
            setFormData({ ...formData, [field]: value });
        }
    };
    
    const actionTemplate = (rowData: SalaryData) => (
        <div className="d-flex align-items-center">
            <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-success p-mr-2"
                onClick={() => {
                    setFormData({ ...rowData });
                    setSelectedSalary(rowData);
                    setShowDialog(true);
                }}
                tooltip="Edit"
            />
            <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger"
                onClick={() => deleteSalary(rowData.id)}
                tooltip="Hapus"
            />
        </div>
    );

    return (
        <div className="datatable-templating-demo">
            <div className="card">
                <h5>Data Gaji Karyawan</h5>
                <Button
                    label="Tambah"
                    icon="pi pi-plus"
                    className="p-button-primary"
                    onClick={() => {
                        setSelectedSalary(null);
                        setFormData({
                            id: 0,
                            idKaryawan: '',
                            namaKaryawan: '',
                            hadir: 0,
                            cuti: 0,
                            lembur: 0,
                            dinasKeluarKota: 0,
                            potongan: 0,
                            gajiPokok: 0,
                        });
                        setShowDialog(true);
                    }}
                />

                <DataTable value={salaries} responsiveLayout="scroll" loading={loading}>
                    <Column field="id" header="ID" style={{ width: '10%' }}></Column>
                    <Column field="namaKaryawan" header="Nama Karyawan" style={{ width: '15%' }}></Column>
                    <Column field="hadir" header="Jumlah Hadir" style={{ width: '15%' }}></Column>
                    <Column field="cuti" header="Cuti" style={{ width: '10%' }}></Column>
                    <Column field="lembur" header="Lembur" style={{ width: '10%' }}></Column>
                    <Column field="dinasKeluarKota" header="Dinas Keluar Kota" style={{ width: '15%' }}></Column>
                    <Column field="potongan" header="Potongan" style={{ width: '15%' }}></Column>
                    <Column
                        field="gajiPokok"
                        header="Gaji Pokok"
                        body={(data) => `Rp. ${data.gajiPokok.toLocaleString('id-ID')}`}
                        style={{ width: '15%' }}
                    ></Column>
                    <Column header="Aksi" body={actionTemplate} style={{ width: '10%' }}></Column>
                </DataTable>
            </div>

            <Dialog
                visible={showDialog}
                style={{ width: '450px' }}
                header={selectedSalary ? 'Edit Gaji Karyawan' : 'Tambah Gaji Karyawan'}
                modal
                footer={
                    <div>
                        <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
                        <Button label="Simpan" icon="pi pi-check" className="p-button-primary" onClick={saveSalary} />
                    </div>
                }
                onHide={hideDialog}
            >
                <div className="p-grid p-fluid">
                    <div className="p-col-12">
                        <label htmlFor="idKaryawan">Karyawan</label>
                        <Dropdown
                            id="idKaryawan"
                            value={formData.idKaryawan}
                            options={karyawanList.map((karyawan) => ({
                                label: karyawan.nama_karyawan,
                                value: karyawan.id,
                            }))}
                            onChange={(e) => onInputChange(e, 'idKaryawan')}
                        />
                    </div>
                    {['hadir', 'cuti', 'lembur', 'dinasKeluarKota', 'potongan', 'gajiPokok'].map((field) => (
                        <div className="p-col-12" key={field}>
                            <label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                            <InputText
                                id={field}
                                value={formData[field as keyof SalaryData]?.toString()}
                                onChange={(e) => onInputChange(e, field as keyof SalaryData)}
                            />
                        </div>
                    ))}
                </div>
            </Dialog>

            <Toast ref={toastRef} />
        </div>
    );
};

export default DataGajiKaryawan;
