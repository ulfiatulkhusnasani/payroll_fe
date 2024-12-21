"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";  // Import Dropdown
import axios, { AxiosError } from "axios";
import { Toast } from "primereact/toast";  // Import Toast
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { Calendar } from "primereact/calendar";




interface LeaveRequest {
    id: number;
    id_karyawan: string;
    tgl_mulai: string;
    tgl_selesai: string;
    alasan: string;
    keterangan: string;
    status: string;
}

interface Karyawan {
    id: string;
    nama_karyawan: string;
}

interface ErrorResponse {
    message: string;
}

const Cuti = () => {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [newRequest, setNewRequest] = useState<LeaveRequest>({
        id: 0,
        id_karyawan: "",
        tgl_mulai: "",
        tgl_selesai: "",
        alasan: "",
        keterangan: "",
        status: "pending",  // Status default
    });
    const [isEdit, setIsEdit] = useState(false); // Untuk menandai apakah sedang edit atau tambah
    let toast: any = null;  // Inisialisasi Toast

    const statusOptions = [
        { label: 'Pending', value: 'pending' },
        { label: 'Disetujui', value: 'disetujui' },
        { label: 'Ditolak', value: 'ditolak' },
    ];

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get("http://192.168.200.37:8001/api/izin", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
        } catch (error) {
            handleAxiosError(error, "permohonan cuti");
        } finally {
            setLoading(false);
        }
    };
    
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
    

    const handleAxiosError = (error: unknown, context: string) => {
        if (axios.isAxiosError(error)) {
            const err = error as AxiosError<ErrorResponse>;
            const errorMessage = err.response?.data.message || err.message;
            showToast('error', `Terjadi kesalahan saat ${context}`, errorMessage);  // Menampilkan alert error
        } else {
            console.error("Terjadi kesalahan:", error);
            showToast('error', 'Terjadi kesalahan', 'Tidak diketahui');
        }
    };

    const showToast = (severity: string, summary: string, detail: string) => {
        toast?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        fetchRequests();
        fetchKaryawanList();
    }, []);

    const handleOpenDialog = () => {
        if (karyawanList.length === 0) {
            showToast('warn', 'Data Belum Siap', 'Mohon tunggu data karyawan selesai dimuat');
            return;
        }
        resetNewRequest(); // Reset form
        setDialogVisible(true); // Tampilkan dialog
    };
    

    const handleSubmit = async () => {
        const token = localStorage.getItem("authToken");
        try {
            const dataToSend = {
                ...newRequest,
                alasan: newRequest.alasan ? newRequest.alasan : undefined,
            };
            const response = isEdit
                ? await axios.put(
                    `http://192.168.200.37:8001/api/izin/${newRequest.id}`,
                    dataToSend,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                : await axios.post(
                    "http://192.168.200.37:8001/api/izin",
                    dataToSend,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
    
            // Memuat ulang data
            await fetchRequests();
    
            setDialogVisible(false);
            resetNewRequest();
    
            // SweetAlert2
            Swal.fire({
                title: "Berhasil!",
                text: isEdit
                    ? "Permohonan cuti berhasil diperbarui."
                    : "Permohonan cuti berhasil ditambahkan.",
                icon: "success",
            });
        } catch (error) {
            handleAxiosError(error, "permohonan izin");
        }
    };
    
    
    const resetNewRequest = () => {
        setNewRequest({
            id: 0,
            id_karyawan: karyawanList.length > 0 ? karyawanList[0].id : "",
            tgl_mulai: "",
            tgl_selesai: "",
            alasan: "",
            keterangan: "",
            status: "pending",
        });
        setIsEdit(false);
    };
    
    

    const handleStatusChange = async (e: any, rowData: LeaveRequest) => {
        const updatedRequest = { ...rowData, status: e.value };
        const token = localStorage.getItem("authToken");
    
        try {
            await axios.put(
                `http://192.168.200.37:8001/api/izin${updatedRequest.id}`,
                updatedRequest,
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            setRequests(
                requests.map((request) =>
                    request.id === updatedRequest.id ? updatedRequest : request
                )
            );
    
            Swal.fire({
                title: "Berhasil!",
                text: "Status permohonan cuti berhasil diperbarui.",
                icon: "success",
            });
        } catch (error) {
            handleAxiosError(error, "update status permohonan cuti");
        }
    };
    

    const handleDelete = async (id: number) => {
        const token = localStorage.getItem("authToken");
    
        try {
            const confirmDelete = await Swal.fire({
                title: "Anda yakin?",
                text: "Data ini akan dihapus secara permanen!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Ya, hapus!",
                cancelButtonText: "Batal",
            });
    
            if (confirmDelete.isConfirmed) {
                await axios.delete(`http://192.168.200.37:8001/api/izin/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                // Memuat ulang data
                await fetchRequests();
    
                Swal.fire("Dihapus!", "Data permohonan cuti berhasil dihapus.", "success");
            }
        } catch (error) {
            handleAxiosError(error, "menghapus permohonan cuti");
        }
    };
    
    

    const getNamaKaryawan = (id_karyawan: string) => {
        const karyawan = karyawanList.find(karyawan => karyawan.id === id_karyawan);
        return karyawan ? karyawan.nama_karyawan : `Tidak Diketahui`;
    };

    const handleEdit = (rowData: LeaveRequest) => {
        if (!karyawanList.length) {
            showToast('warn', 'Data Karyawan Belum Siap', 'Tunggu data karyawan selesai dimuat');
            return;
        }
        setNewRequest(rowData); // Isi data form dengan data dari tabel
        setIsEdit(true);        // Tandai mode edit
        setDialogVisible(true); // Tampilkan dialog
    };
    
    

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Data Permohonan Cuti</h5>
                    <Button
    label="Tambah"
    icon="pi pi-plus"
    className="p-button-primary mr-2"
    onClick={handleOpenDialog}
/>


                    <DataTable value={requests} responsiveLayout="scroll">
                        {/* Kolom No Urut */}
                        <Column
                            header="No"
                            body={(rowData, { rowIndex }) => rowIndex + 1}
                            style={{ width: '5%' }}
                        />
                        {/* Kolom Nama Karyawan */}
                        <Column
                            header="Nama Karyawan"
                            body={(rowData) => getNamaKaryawan(rowData.id_karyawan)}
                        />
                        <Column field="tgl_mulai" header="Tanggal Mulai" />
                        <Column field="tgl_selesai" header="Tanggal Selesai" />
                        <Column field="alasan" header="Alasan" />
                        <Column field="keterangan" header="Keterangan" />
                        {/* Kolom Status dengan Dropdown */}
                        <Column
                            field="status"
                            header="Status"
                            body={(rowData) => (
                                <Dropdown
                                    value={rowData.status}
                                    options={statusOptions}
                                    onChange={(e) => handleStatusChange(e, rowData)}
                                />
                            )}
                        />
                        {/* Kolom Edit dan Delete */}
                        <Column
    header="Aksi"
    body={(rowData) => (
        <div>
            <Button
                icon="pi pi-pencil"
                className="p-button-success p-mr-2" // Gunakan p-button-success untuk warna hijau
                onClick={() => handleEdit(rowData)}
            />
            <Button
                icon="pi pi-trash"
                className="p-button-danger" // Gunakan p-button-danger untuk warna merah
                onClick={() => handleDelete(rowData.id)}
            />
        </div>
    )}
/>
                    </DataTable>
                    <Dialog
    header={isEdit ? "Edit Permohonan Izin" : "Tambah Permohonan Izin"}
    visible={dialogVisible}
    style={{ width: "40vw" }}
    onHide={() => setDialogVisible(false)}
>
    <div className="container">
        <div className="row">
            {/* Karyawan Field */}
            <div className="col-12 mb-3">
                <label htmlFor="id_karyawan" className="form-label">Karyawan</label>
                {isEdit ? (
                    <InputText
                        id="id_karyawan"
                        value={getNamaKaryawan(newRequest.id_karyawan)}
                        disabled
                        className="form-control"
                    />
                ) : (
                    <select
                        id="id_karyawan"
                        value={newRequest.id_karyawan}
                        onChange={(e) => setNewRequest({ ...newRequest, id_karyawan: e.target.value })}
                        className="form-select"
                    >
                        <option value="">Pilih Karyawan</option>
                        {karyawanList.map((karyawan) => (
                            <option key={karyawan.id} value={karyawan.id}>
                                {karyawan.nama_karyawan}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Tanggal Mulai */}
            <div className="col-md-6 mb-3">
                <label htmlFor="tgl_mulai" className="form-label">Tanggal Mulai</label>
                <Calendar
                    id="tgl_mulai"
                    value={newRequest.tgl_mulai ? new Date(newRequest.tgl_mulai) : null}
                    onChange={(e) =>
                        setNewRequest({ ...newRequest, tgl_mulai: e.value ? e.value.toISOString().split("T")[0] : "" })
                    }
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="form-control"
                />
            </div>

            {/* Tanggal Selesai */}
            <div className="col-md-6 mb-3">
                <label htmlFor="tgl_selesai" className="form-label">Tanggal Selesai</label>
                <Calendar
                    id="tgl_selesai"
                    value={newRequest.tgl_selesai ? new Date(newRequest.tgl_selesai) : null}
                    onChange={(e) =>
                        setNewRequest({ ...newRequest, tgl_selesai: e.value ? e.value.toISOString().split("T")[0] : "" })
                    }
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="form-control"
                />
            </div>

            {/* Alasan */}
            <div className="col-12 mb-3">
                <label htmlFor="alasan" className="form-label">Alasan</label>
                <Dropdown
                    id="alasan"
                    value={newRequest.alasan}
                    options={[
                        { label: "Cuti", value: "cuti" },
                        { label: "Izin", value: "izin" },
                    ]}
                    onChange={(e) => setNewRequest({ ...newRequest, alasan: e.value })}
                    placeholder="Pilih Alasan"
                    className="form-control"
                />
            </div>

            {/* Keterangan */}
            <div className="col-12 mb-3">
                <label htmlFor="keterangan" className="form-label">Keterangan</label>
                <InputText
                    id="keterangan"
                    value={newRequest.keterangan}
                    onChange={(e) => setNewRequest({ ...newRequest, keterangan: e.target.value })}
                    className="form-control"
                />
            </div>

            {/* Tombol Simpan */}
            <div className="col-12 d-flex justify-content-end">
                <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} className="p-button-primary" />
            </div>
        </div>
    </div>
</Dialog>

                </div>
            </div>
        </div>
    );
};

export default Cuti;
