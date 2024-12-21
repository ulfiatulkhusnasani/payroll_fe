'use client';

import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import Swal from 'sweetalert2';

// Definisikan tipe data untuk salary
interface SalaryData {
    id: number;
    name: string;
    jabatan: string;
    gajiPokok: number;
    lembur: number;
    totalGaji: number;
    potongan: number;
    jumlahGaji: number;
}

const SlipGajiKaryawan = () => {
    const [salaries, setSalaries] = useState<SalaryData[]>([
        {
            id: 1,
            name: 'Sonya Kuriasawandu',
            jabatan: 'Manager',
            gajiPokok: 5000000,
            lembur: 500000,
            totalGaji: 5500000,
            potongan: 300000,
            jumlahGaji: 5200000,
        },
        {
            id: 2,
            name: 'Andi Santoso',
            jabatan: 'Staff',
            gajiPokok: 3000000,
            lembur: 200000,
            totalGaji: 3200000,
            potongan: 150000,
            jumlahGaji: 3050000,
        },
        {
            id: 3,
            name: 'Budi Hartono',
            jabatan: 'Supervisor',
            gajiPokok: 4500000,
            lembur: 300000,
            totalGaji: 4800000,
            potongan: 250000,
            jumlahGaji: 4550000,
        },
    ]);
    const [showDialog, setShowDialog] = useState(false);
    const [formData, setFormData] = useState<Partial<SalaryData>>({});
    const toast = useRef<Toast>(null); // Menambahkan tipe Toast pada useRef

    // Template aksi (edit dan hapus)
    const actionTemplate = (rowData: SalaryData) => {
        return (
            <div>
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-success p-mr-2"
                    onClick={() => editSalary(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => deleteSalary(rowData.id)}
                />
            </div>
        );
    };

    // Fungsi untuk mengedit data gaji
    const editSalary = (salary: SalaryData) => {
        setFormData({ ...salary });
        setShowDialog(true);
    };

    // Fungsi untuk menghapus data gaji
    const deleteSalary = (id: number) => {
        Swal.fire({
            title: 'Yakin ingin hapus?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Hapus',
        }).then((result) => {
            if (result.isConfirmed) {
                setSalaries(salaries.filter((salary) => salary.id !== id));
                toast.current?.show({ severity: 'success', summary: 'Dihapus', detail: 'Data gaji telah dihapus' });
            }
        });
    };

    // Fungsi untuk menyimpan data gaji
    const saveSalary = () => {
        if (formData.id) {
            setSalaries(salaries.map((salary) => (salary.id === formData.id ? formData as SalaryData : salary)));
        } else {
            setSalaries([...salaries, { ...(formData as SalaryData), id: salaries.length + 1 }]);
        }
        setShowDialog(false);
        toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Data gaji telah disimpan' });
    };

    return (
        <div>
            <Toast ref={toast} />
            <Button label="Tambah Gaji" onClick={() => setShowDialog(true)} />
            <DataTable value={salaries}>
                <Column field="name" header="Nama" />
                <Column field="jabatan" header="Jabatan" />
                <Column 
                    field="gajiPokok" 
                    header="Gaji Pokok" 
                    body={(data) => `Rp ${data.gajiPokok ? data.gajiPokok.toLocaleString() : '0'}`} 
                />
                <Column 
                    field="lembur" 
                    header="Lembur" 
                    body={(data) => `Rp ${data.lembur ? data.lembur.toLocaleString() : '0'}`} 
                />
                <Column 
                    field="totalGaji" 
                    header="Total Gaji" 
                    body={(data) => `Rp ${data.totalGaji ? data.totalGaji.toLocaleString() : '0'}`} 
                />
                <Column 
                    field="potongan" 
                    header="Potongan" 
                    body={(data) => `Rp ${data.potongan ? data.potongan.toLocaleString() : '0'}`} 
                />
                <Column 
                    field="jumlahGaji" 
                    header="Jumlah Gaji" 
                    body={(data) => `Rp ${data.jumlahGaji ? data.jumlahGaji.toLocaleString() : '0'}`} 
                />
                <Column header="Aksi" body={actionTemplate} />
            </DataTable>

            <Dialog header="Tambah/Edit Gaji" visible={showDialog} style={{ width: '50vw' }} onHide={() => setShowDialog(false)}>
                <div className="p-grid">
                    <div className="p-col">
                        <label>Nama Karyawan</label>
                        <InputText 
                            value={formData.name || ''} 
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                        />
                    </div>
                    <div className="p-col">
                        <label>Jabatan</label>
                        <InputText 
                            value={formData.jabatan || ''} 
                            onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })} 
                        />
                    </div>
                    <div className="p-col">
                        <label>Gaji Pokok</label>
                        <InputText 
                            value={formData.gajiPokok?.toString() || ''} 
                            onChange={(e) => setFormData({ ...formData, gajiPokok: Number(e.target.value) })} 
                        />
                    </div>
                    <div className="p-col">
                        <label>Lembur</label>
                        <InputText 
                            value={formData.lembur?.toString() || ''} 
                            onChange={(e) => setFormData({ ...formData, lembur: Number(e.target.value) })} 
                        />
                    </div>
                    <div className="p-col">
                        <label>Potongan</label>
                        <InputText 
                            value={formData.potongan?.toString() || ''} 
                            onChange={(e) => setFormData({ ...formData, potongan: Number(e.target.value) })} 
                        />
                    </div>
                </div>
                <Button label="Simpan" onClick={saveSalary} />
            </Dialog>
        </div>
    );
};

export default SlipGajiKaryawan;
