"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import axios, { AxiosError } from "axios";
import { Toast } from "primereact/toast";
import Swal from "sweetalert2";
import { Dropdown } from "primereact/dropdown";

interface Lembur {
    id: number;
    id_karyawan: string;
    tanggal_lembur: string;
    jam_mulai: string;
    jam_selesai: string;
    durasi_lembur?: number;
    alasan_lembur: string;
    status: string;
}

interface Karyawan {
    id: string;
    nama_karyawan: string;
}

interface ErrorResponse {
    message: string;
}

const Lembur = () => {
    const [lemburList, setLemburList] = useState<Lembur[]>([]);
    const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newLembur, setNewLembur] = useState<Lembur>({
        id: 0,
        id_karyawan: "",
        tanggal_lembur: "",
        jam_mulai: "",
        jam_selesai: "",
        durasi_lembur: 0,
        alasan_lembur: "",
        status: "",
    });
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef<Toast>(null);

    const fetchLemburList = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get("http://127.0.0.1:8000/api/lembur", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLemburList(response.data);
        } catch (error) {
            handleAxiosError(error, "memuat data lembur");
        } finally {
            setLoading(false);
        }
    };

    const fetchKaryawanList = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get("http://127.0.0.1:8000/api/karyawan", {
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
            toast.current?.show({
                severity: "error",
                summary: `Kesalahan saat ${context}`,
                detail: errorMessage,
                life: 3000,
            });
        } else {
            console.error("Error:", error);
        }
    };

    const handleOpenDialog = () => {
        if (karyawanList.length === 0) {
            toast.current?.show({
                severity: "warn",
                summary: "Data Belum Siap",
                detail: "Mohon tunggu data karyawan selesai dimuat",
                life: 3000,
            });
            return;
        }
        resetNewLembur();
        setDialogVisible(true);
    };

    const resetNewLembur = () => {
        setNewLembur({
            id: 0,
            id_karyawan: "",
            tanggal_lembur: "",
            jam_mulai: "",
            jam_selesai: "",
            durasi_lembur: 0,
            alasan_lembur: "",
            status: "",
        });
        setIsEdit(false);
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("authToken");
        try {
            const url = isEdit
                ? `http://127.0.0.1:8000/api/lembur/${newLembur.id}`
                : "http://127.0.0.1:8000/api/lembur";

            const method = isEdit ? axios.put : axios.post;

            await method(url, newLembur, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            await fetchLemburList();
            setDialogVisible(false);

            Swal.fire({
                title: "Berhasil!",
                text: isEdit
                    ? "Lembur berhasil diperbarui."
                    : "Lembur berhasil ditambahkan.",
                icon: "success",
            });
        } catch (error) {
            handleAxiosError(error, isEdit ? "mengubah data lembur" : "menambahkan data lembur");
        }
    };

    const handleEdit = (rowData: Lembur) => {
        setNewLembur(rowData);
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleDelete = async (id: number) => {
        const token = localStorage.getItem("authToken");

        try {
            const confirmDelete = await Swal.fire({
                title: "Anda yakin?",
                text: "Data ini akan dihapus secara permanen!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Ya, hapus!",
            });

            if (confirmDelete.isConfirmed) {
                await axios.delete(`http://127.0.0.1:8000/api/lembur/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await fetchLemburList();
                Swal.fire("Dihapus!", "Data lembur berhasil dihapus.", "success");
            }
        } catch (error) {
            handleAxiosError(error, "menghapus data lembur");
        }
    };

    useEffect(() => {
        fetchLemburList();
        fetchKaryawanList();
    }, []);

    const calculateDuration = (start: string, end: string): number => {
        const [startHour, startMinute] = start.split(":").map(Number);
        const [endHour, endMinute] = end.split(":").map(Number);

        const startTime = new Date(1970, 0, 1, startHour, startMinute).getTime();
        const endTime = new Date(1970, 0, 1, endHour, endMinute).getTime();

        const duration = (endTime - startTime) / (1000 * 60 * 60); // Convert ms to hours
        return duration > 0 ? duration : 0; // Jika hasil negatif, kembalikan 0
    };

    const statusOptions = [
        { label: "Pending", value: "pending" },
        { label: "Disetujui", value: "disetujui" },
        { label: "Ditolak", value: "ditolak" },
    ];    

    const handleStatusChange = async (e: any, rowData: Lembur) => {
        const updatedLembur = { ...rowData, status: e.value }; // Update the status
    
        const token = localStorage.getItem("authToken"); // Authentication token
    
        try {
            await axios.put(
                `http://127.0.0.1:8000/api/lembur/${updatedLembur.id}`,
                updatedLembur,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLemburList((prevLemburList) =>
                prevLemburList.map((lembur) =>
                    lembur.id === updatedLembur.id ? updatedLembur : lembur
                )
            );
            Swal.fire({
                title: "Berhasil!",
                text: `Status lembur berhasil diubah menjadi ${e.value}.`,
                icon: "success",
            });
        } catch (error) {
            console.error(error);
        }
    };    

    const getNamaKaryawan = (id: string) => {
        const karyawan = karyawanList.find((k) => k.id === id);
        return karyawan ? karyawan.nama_karyawan : "Tidak Diketahui";
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h5>Data Lembur</h5>
                    <div className="p-mb-3">
                        <Button label="Tambah" icon="pi pi-plus" onClick={handleOpenDialog} />
                    </div>
                    <DataTable
                        value={lemburList}
                        responsiveLayout="scroll"
                        dataKey="id"
                        className="p-datatable-sm"
                    >
                        <Column header="No" body={(rowData, { rowIndex }) => rowIndex + 1} />
                        <Column header="Nama Karyawan" body={(rowData) => getNamaKaryawan(rowData.id_karyawan)} />
                        <Column field="tanggal_lembur" header="Tanggal Lembur" />
                        <Column field="jam_mulai" header="Jam Mulai" />
                        <Column field="jam_selesai" header="Jam Selesai" />
                        <Column field="durasi_lembur" header="Durasi (jam)" />
                        <Column field="alasan_lembur" header="Alasan Lembur" />
                        <Column
    field="status"
    header="Status"
    body={(rowData) => (
        <Dropdown
            value={rowData.status}
            options={statusOptions}
            onChange={(e) => handleStatusChange(e, rowData)}
            optionLabel="label"
            className="p-dropdown"
        />
    )}
/>

                        <Column
                            body={(rowData) => (
                                <div className="p-buttonset">
                                    <Button
                                        icon="pi pi-pencil"
                                        className="p-button-success"
                                        onClick={() => handleEdit(rowData)}
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-danger"
                                        onClick={() => handleDelete(rowData.id)}
                                    />
                                </div>
                            )}
                            header="Aksi"
                        />
                    </DataTable>
    
                    <Dialog
                        header={isEdit ? "Edit Lembur" : "Tambah Lembur"}
                        visible={dialogVisible}
                        style={{ width: "50vw" }}
                        onHide={() => setDialogVisible(false)}
                    >
                        <div className="p-fluid">
                            <div className="field">
                                <label htmlFor="id_karyawan">Karyawan</label>
                                <select
                                    id="id_karyawan"
                                    value={newLembur.id_karyawan}
                                    onChange={(e) =>
                                        setNewLembur({ ...newLembur, id_karyawan: e.target.value })
                                    }
                                    className="p-inputtext"
                                >
                                    <option value="">Pilih Karyawan</option>
                                    {karyawanList.map((karyawan) => (
                                        <option key={karyawan.id} value={karyawan.id}>
                                            {karyawan.nama_karyawan}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label htmlFor="tanggal_lembur">Tanggal Lembur</label>
                                <Calendar
                                    id="tanggal_lembur"
                                    value={
                                        newLembur.tanggal_lembur
                                            ? new Date(newLembur.tanggal_lembur)
                                            : null
                                    }
                                    onChange={(e) =>
                                        setNewLembur({
                                            ...newLembur,
                                            tanggal_lembur: e.value
                                                ? e.value.toISOString().split("T")[0]
                                                : "",
                                        })
                                    }
                                    dateFormat="yy-mm-dd"
                                    showIcon
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="jam_mulai">Jam Mulai</label>
                                <Calendar
                                    id="jam_mulai"
                                    value={
                                        newLembur.jam_mulai
                                            ? new Date(`1970-01-01T${newLembur.jam_mulai}`)
                                            : null
                                    }
                                    onChange={(e) => {
                                        const jamMulai = e.value
                                            ? e.value.toTimeString().split(" ")[0]
                                            : "";
                                        const durasi =
                                            jamMulai && newLembur.jam_selesai
                                                ? calculateDuration(jamMulai, newLembur.jam_selesai)
                                                : 0;
                                        setNewLembur({
                                            ...newLembur,
                                            jam_mulai: jamMulai,
                                            durasi_lembur: durasi,
                                        });
                                    }}
                                    timeOnly
                                    hourFormat="24"
                                    showIcon
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="jam_selesai">Jam Selesai</label>
                                <Calendar
                                    id="jam_selesai"
                                    value={
                                        newLembur.jam_selesai
                                            ? new Date(`1970-01-01T${newLembur.jam_selesai}`)
                                            : null
                                    }
                                    onChange={(e) => {
                                        const jamSelesai = e.value
                                            ? e.value.toTimeString().split(" ")[0]
                                            : "";
                                        const durasi =
                                            newLembur.jam_mulai && jamSelesai
                                                ? calculateDuration(newLembur.jam_mulai, jamSelesai)
                                                : 0;
                                        setNewLembur({
                                            ...newLembur,
                                            jam_selesai: jamSelesai,
                                            durasi_lembur: durasi,
                                        });
                                    }}
                                    timeOnly
                                    hourFormat="24"
                                    showIcon
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="durasi_lembur">Durasi Lembur (jam)</label>
                                <InputText
                                    id="durasi_lembur"
                                    value={(newLembur.durasi_lembur || 0).toString()}
                                    readOnly
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="alasan_lembur">Alasan Lembur</label>
                                <InputText
                                    id="alasan_lembur"
                                    value={newLembur.alasan_lembur}
                                    onChange={(e) =>
                                        setNewLembur({ ...newLembur, alasan_lembur: e.target.value })
                                    }
                                />
                            </div>
                            <div className="field">
    <label htmlFor="status">Status</label>
    <Dropdown
        id="status"
        value={newLembur.status}
        options={statusOptions}
        onChange={(e) =>
            setNewLembur({ ...newLembur, status: e.value })
        }
        optionLabel="label"
    />
</div>
                            <div className="p-mt-3">
                                <Button
                                    label="Simpan"
                                    icon="pi pi-check"
                                    className="p-button-success"
                                    onClick={handleSubmit}
                                />
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );    
};

export default Lembur;
