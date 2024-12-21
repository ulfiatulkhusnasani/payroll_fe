"use client";

import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import axios, { AxiosError } from "axios";
import { Toast } from "primereact/toast";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { Calendar } from "primereact/calendar";
import { CSSTransition } from "react-transition-group";

interface DinasLuarKota {
    id: number;
    id_karyawan: string;
    tgl_berangkat: string;
    tgl_kembali: string;
    kota_tujuan: string;
    keperluan: string;
    biaya_transport: number;
    biaya_penginapan: number;
    uang_harian: number;
    total_biaya: number;
}

interface Karyawan {
    id: string;
    nama_karyawan: string;
}

interface ErrorResponse {
    message: string;
}

const DinasLuarKota = () => {
    const [requests, setRequests] = useState<DinasLuarKota[]>([]);
    const [loading, setLoading] = useState(true);

    const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [newRequest, setNewRequest] = useState<DinasLuarKota>({
        id: 0,
        id_karyawan: "",
        tgl_berangkat: "",
        tgl_kembali: "",
        kota_tujuan: "",
        keperluan: "",
        biaya_transport: 0,
        biaya_penginapan: 0,
        uang_harian: 0,
        total_biaya: 0,
    });
    const [isEdit, setIsEdit] = useState(false); // Untuk menandai apakah sedang edit atau tambah
    let toast: any = null;

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get("http://192.168.200.37:8001/api/dinas_luarkota", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
        } catch (error) {
            handleAxiosError(error, "dinas luar kota");
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
            showToast('error', `Terjadi kesalahan saat ${context}`, errorMessage); 
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
            // Format the dates before submitting
            const formattedTglBerangkat = formatDate(newRequest.tgl_berangkat);
            const formattedTglKembali = formatDate(newRequest.tgl_kembali);
    
            const dataToSend = {
                ...newRequest,
                tgl_berangkat: formattedTglBerangkat,
                tgl_kembali: formattedTglKembali,
            };
    
            const response = isEdit
                ? await axios.put(
                    `http://192.168.200.37:8001/api/dinas_luarkota/${newRequest.id}`,
                    dataToSend,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                : await axios.post(
                    "http://192.168.200.37:8001/api/dinas_luarkota",
                    dataToSend,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
        
            // Reload the data
            await fetchRequests();
        
            setDialogVisible(false);
            resetNewRequest();
        
            // SweetAlert2
            Swal.fire({
                title: "Berhasil!",
                text: isEdit
                    ? "Dinas luar kota berhasil diperbarui."
                    : "Dinas luar kota berhasil ditambahkan.",
                icon: "success",
            });
        } catch (error) {
            handleAxiosError(error, "dinas luar kota");
        }
    };
    

    const resetNewRequest = () => {
        setNewRequest({
            id: 0,
            id_karyawan: karyawanList.length > 0 ? karyawanList[0].id : "",
            tgl_berangkat: "",
            tgl_kembali: "",
            kota_tujuan: "",
            keperluan: "",
            biaya_transport: 0,
            biaya_penginapan: 0,
            uang_harian: 0,
            total_biaya: 0,
        });
        setIsEdit(false);
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
                await axios.delete(`http://192.168.200.37:8001/api/dinas_luarkota/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Memuat ulang data
                await fetchRequests();

                Swal.fire("Dihapus!", "Data dinas luar kota berhasil dihapus.", "success");
            }
        } catch (error) {
            handleAxiosError(error, "menghapus dinas luar kota");
        }
    };


    const formatDate = (date: string | Date): string => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };


    const getNamaKaryawan = (id_karyawan: string) => {
        const karyawan = karyawanList.find(karyawan => karyawan.id === id_karyawan);
        return karyawan ? karyawan.nama_karyawan : `Tidak Diketahui`;
    };

    const handleEdit = (rowData: DinasLuarKota) => {
        if (!karyawanList.length) {
            showToast('warn', 'Data Karyawan Belum Siap', 'Tunggu data karyawan selesai dimuat');
            return;
        }
        setNewRequest(rowData); 
        setIsEdit(true); 
        setDialogVisible(true); 
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Data Dinas Luar Kota</h5>
                    <Button
                        label="Tambah"
                        icon="pi pi-plus"
                        className="p-button-primary mr-2"
                        onClick={handleOpenDialog}
                    />
                    <DataTable value={requests} responsiveLayout="scroll">
                        <Column header="No" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '5%' }} />
                        <Column header="Nama Karyawan" body={(rowData) => getNamaKaryawan(rowData.id_karyawan)} />
                        <Column field="tgl_berangkat" header="Tanggal Berangkat" />
                        <Column field="tgl_kembali" header="Tanggal Kembali" />
                        <Column field="kota_tujuan" header="Kota Tujuan" />
                        <Column field="keperluan" header="Keperluan" />
                        <Column field="biaya_transport" header="Biaya Transport" />
                        <Column field="biaya_penginapan" header="Biaya Penginapan" />
                        <Column field="uang_harian" header="Uang Harian" />
                        <Column field="total_biaya" header="Total Biaya" />
                        <Column
                            header="Aksi"
                            body={(rowData) => (
                                <div>
                                    <Button
    icon="pi pi-pencil"
    className="p-mr-2"
    style={{ backgroundColor: "green", borderColor: "green", color: "white" }}
    onClick={() => handleEdit(rowData)}
/>

                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-danger"
                                        onClick={() => handleDelete(rowData.id)}
                                    />
                                </div>
                            )}
                        />
                    </DataTable>

                    <Dialog
    header="Form Dinas Luar Kota"
    visible={dialogVisible}
    onHide={() => setDialogVisible(false)}
    style={{ width: "30vw" }}
    footer={
        <div>
            <Button
                label="Batal"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setDialogVisible(false)}
            />
            <Button
                label={isEdit ? "Perbarui" : "Simpan"}
                icon="pi pi-check"
                className="p-button-primary"
                onClick={handleSubmit}
            />
        </div>
    }
>
    <form>
        {/* Karyawan */}
        <div className="mb-3">
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
                    onChange={(e) =>
                        setNewRequest({ ...newRequest, id_karyawan: e.target.value })
                    }
                    className="form-control"
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

        {/* Tanggal Berangkat */}
        <div className="mb-3">
            <label htmlFor="tgl_berangkat" className="form-label">Tanggal Berangkat</label>
            <Calendar
                id="tgl_berangkat"
                value={newRequest.tgl_berangkat ? new Date(newRequest.tgl_berangkat) : null}
                onChange={(e) =>
                    setNewRequest({
                        ...newRequest,
                        tgl_berangkat: e.value ? e.value.toISOString().split("T")[0] : "",
                    })
                }
                dateFormat="dd/mm/yy"
                showIcon
                className="form-control"
            />
        </div>

        {/* Tanggal Kembali */}
        <div className="mb-3">
            <label htmlFor="tgl_kembali" className="form-label">Tanggal Kembali</label>
            <Calendar
                id="tgl_kembali"
                value={newRequest.tgl_kembali ? new Date(newRequest.tgl_kembali) : null}
                onChange={(e) =>
                    setNewRequest({
                        ...newRequest,
                        tgl_kembali: e.value ? e.value.toISOString().split("T")[0] : "",
                    })
                }
                dateFormat="dd/mm/yy"
                showIcon
                className="form-control"
            />
        </div>

        {/* Kota Tujuan */}
        <div className="mb-3">
            <label htmlFor="kota_tujuan" className="form-label">Kota Tujuan</label>
            <InputText
                id="kota_tujuan"
                value={newRequest.kota_tujuan}
                onChange={(e) =>
                    setNewRequest({ ...newRequest, kota_tujuan: e.target.value })
                }
                className="form-control"
            />
        </div>

        {/* Keperluan */}
        <div className="mb-3">
            <label htmlFor="keperluan" className="form-label">Keperluan</label>
            <InputText
                id="keperluan"
                value={newRequest.keperluan}
                onChange={(e) =>
                    setNewRequest({ ...newRequest, keperluan: e.target.value })
                }
                className="form-control"
            />
        </div>

        {/* Biaya Transport, Penginapan, Uang Harian */}
        <div className="row g-2"> {/* g-2 reduces space between columns */}
            <div className="col-4 mb-3"> {/* Adjusted column width */}
                <label htmlFor="biaya_transport" className="form-label">Biaya Transport</label>
                <InputText
                    id="biaya_transport"
                    value={newRequest.biaya_transport.toString()}
                    onChange={(e) =>
                        setNewRequest({
                            ...newRequest,
                            biaya_transport: parseFloat(e.target.value || "0"),
                        })
                    }
                    className="form-control"
                />
            </div>
            <div className="col-4 mb-3"> {/* Adjusted column width */}
                <label htmlFor="biaya_penginapan" className="form-label">Biaya Penginapan</label>
                <InputText
                    id="biaya_penginapan"
                    value={newRequest.biaya_penginapan.toString()}
                    onChange={(e) =>
                        setNewRequest({
                            ...newRequest,
                            biaya_penginapan: parseInt(e.target.value || "0"),
                        })
                    }
                    className="form-control"
                />
            </div>
            <div className="col-4 mb-3"> {/* Adjusted column width */}
                <label htmlFor="uang_harian" className="form-label">Uang Harian</label>
                <InputText
                    id="uang_harian"
                    value={newRequest.uang_harian.toString()}
                    onChange={(e) =>
                        setNewRequest({
                            ...newRequest,
                            uang_harian: parseInt(e.target.value || "0"),
                        })
                    }
                    className="form-control"
                />
            </div>
        </div>
    </form>
</Dialog>
                </div>
            </div>
        </div>
    );
};

export default DinasLuarKota;
