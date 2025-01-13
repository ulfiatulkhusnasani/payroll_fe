"use client";

import React, { useEffect, useState } from "react";

import { Panel } from "primereact/panel";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog } from "primereact/confirmdialog";
import axios from "axios";
import Swal from 'sweetalert2';

const DataKaryawan: React.FC = () => {
  const [karyawanList, setKaryawanList] = useState<any[]>([]);
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [karyawanBaru, setKaryawanBaru] = useState<any>({
    nama_karyawan: "",
    nip: "",
    nik: "",
    email: "",
    no_handphone: "",
    alamat: "",
    password: "",
    jabatan_id: "",
    device_code: "",  // Added device_code  
  });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [id, setId] = useState<number | null>(null); // ID karyawan  

  // API base URLs for karyawan and jabatan  
  const karyawanApiBaseUrl = "http://127.0.0.1:8000/api/karyawan";
  const jabatanApiBaseUrl = "http://127.0.0.1:8000/api/jabatan";

  useEffect(() => {
    fetchKaryawan();
    fetchJabatan();
  }, []);

  // Assuming the token is stored in localStorage or sessionStorage after login  
  const token = localStorage.getItem("authToken");
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Tidak Dapat Mengakses',
      text: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
    });
    return;
  }

  
 

  // Create axios instance for karyawan with authorization header  
  const karyawanAxiosInstance = axios.create({
    baseURL: karyawanApiBaseUrl,
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  // Create axios instance for jabatan with authorization header  
  const jabatanAxiosInstance = axios.create({
    baseURL: jabatanApiBaseUrl,
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const fetchKaryawan = async () => {
    try {
      const response = await karyawanAxiosInstance.get("");
      setKaryawanList(response.data);
    } catch (error) {
      console.error("Gagal memuat data karyawan:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat',
        text: 'Tidak dapat memuat data karyawan. Coba lagi nanti.',
      });
    }
  };

  const fetchJabatan = async () => {
    try {
      const response = await jabatanAxiosInstance.get("/");
      setJabatanList(response.data);
    } catch (error) {
      console.error("Gagal memuat data jabatan:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat',
        text: 'Tidak dapat memuat data jabatan. Coba lagi nanti.',
      });
    }
  };

  // Show dialog for adding or editing karyawan  
  const tampilkanDialog = (karyawan: any = null) => {
    if (karyawan) {
      setEditMode(true);
      setKaryawanBaru(karyawan);
      setId(karyawan.id); // Set id karyawan untuk mode edit  
    } else {
      setEditMode(false);
      setKaryawanBaru({
        nama_karyawan: "",
        nip: "",
        nik: "",
        email: "",
        no_handphone: "",
        alamat: "",
        password: "",
        jabatan_id: "",
        device_code: "",  // Reset device_code  
      });
      setId(null); // Reset id saat tambah karyawan baru  
    }
    setDialogVisible(true);
  };

  // Hide dialog  
  const sembunyikanDialog = () => {
    setDialogVisible(false);
  };

  const simpanKaryawan = async () => {
    try {
      // Validate required fields
      if (!karyawanBaru.nama_karyawan || !karyawanBaru.jabatan_id || !karyawanBaru.nip || !karyawanBaru.nik) {
        Swal.fire({
          icon: 'error',
          title: 'Validasi Gagal',
          text: 'Nama, NIP, NIK, dan Jabatan harus diisi!',
        });
        return;
      }

      if (editMode && id) {
        // Update karyawan
        const response = await karyawanAxiosInstance.put(`/${id}`, karyawanBaru);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data karyawan berhasil diperbarui!',
        });
      } else {
        // Tambah karyawan
        const response = await karyawanAxiosInstance.post("/created", karyawanBaru);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data karyawan berhasil ditambahkan!',
        });
      }

      // Fetch data setelah penyimpanan
      fetchKaryawan();

      // Tutup dialog
      sembunyikanDialog();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data karyawan!';
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: `Error: ${errorMessage}`,
      });
      console.log(error.response?.data);
    }
  };

  const hapusKaryawan = (id: number) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Data karyawan akan dihapus dan tidak bisa dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Hapus karyawan  
          await karyawanAxiosInstance.delete(`/${id}`);
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data karyawan berhasil dihapus!',
          });

          // Refresh data  
          fetchKaryawan();
        } catch (error) {
          console.error("Gagal menghapus data karyawan:", error);
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Terjadi kesalahan saat menghapus data karyawan!',
          });
        }
      }
    });
  };


  return (
    <Panel header="Data Karyawan">
      <ConfirmDialog />
      <Button
        label="Tambah Karyawan"
        icon="pi pi-plus"
        className="mb-3"
        onClick={() => tampilkanDialog()}
      />
      <DataTable
        value={karyawanList}
        responsiveLayout="scroll"
        paginator
        rows={10} // Number of rows per page  
        rowsPerPageOptions={[5, 10, 25]} // Options for rows per page  
      >
        <Column field="nama_karyawan" header="Nama"></Column>
        <Column field="nip" header="NIP"></Column>
        <Column field="nik" header="NIK"></Column>
        <Column field="email" header="Email"></Column>
        <Column field="no_handphone" header="No HP"></Column>
        <Column field="alamat" header="Alamat"></Column>
        <Column field="jabatan.jabatan" header="Jabatan"></Column>
        <Column field="device_code" header="Kode Device"></Column>
        <Column 
  header="Aksi"
  body={(rowData) => (
    <div className="p-buttonset">
      <Button
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => tampilkanDialog(rowData)} // Aksi Edit
      />
      <Button
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => hapusKaryawan(rowData.id)} // Aksi Hapus
      />
    </div>
  )}
></Column>
      </DataTable>

      <Dialog
        header={editMode ? "Edit Data Karyawan" : "Tambah Data Karyawan"}
        visible={dialogVisible}
        onHide={sembunyikanDialog}
        style={{ width: "600px" }}
      >
        <div className="p-fluid">
          {/* Nama Karyawan */}
          <div className="p-field">
            <label htmlFor="Nama">Nama</label>
            <InputText
              id="nama"
              value={karyawanBaru.nama_karyawan}
              onChange={(e) => setKaryawanBaru({ ...karyawanBaru, nama_karyawan: e.target.value })}
              placeholder="masukkan nama"
            />
          </div>

          {/* NIP */}
          <div className="p-field">
            <label htmlFor="NIP">NIP</label>
            <InputText
              id="NIP"
              value={karyawanBaru.nip}
              onChange={(e) => setKaryawanBaru({ ...karyawanBaru, nip: e.target.value })}
              placeholder="8 karakter"
            />
          </div>

          {/* NIK */}
          <div className="p-field">
            <label htmlFor="NIK">NIK</label>
            <InputText
              id="NIK"
              value={karyawanBaru.nik}
              onChange={(e) => setKaryawanBaru({ ...karyawanBaru, nik: e.target.value })}
              placeholder="16 karakter"
            />
          </div>

          {/* Email */}
          <div className="p-field">
            <label htmlFor="Email">Email</label>
            <InputText
              id="Email"
              value={karyawanBaru.email}
              onChange={(e) => setKaryawanBaru({ ...karyawanBaru, email: e.target.value })}
              placeholder="masukkan email"
            />
          </div>

          {/* No Handphone */}
          <div className="p-field">
            <label htmlFor="No Handphone">No Handphone</label>
            <InputText
              id="No_Handphone"
              value={karyawanBaru.no_handphone}
              onChange={(e) => setKaryawanBaru({ ...karyawanBaru, no_handphone: e.target.value })}
              placeholder="masukkan No Handphone"
            />
          </div>

          {/* Alamat */}
          <div className="p-field">
            <label htmlFor="Alamat">Alamat</label>
            <InputText
              id="Alamat"
              value={karyawanBaru.alamat}
              onChange={(e) => setKaryawanBaru({ ...karyawanBaru, alamat: e.target.value })}
              placeholder="masukkan alamat"
            />
          </div>

          {/* Password (hanya untuk mode tambah) */}
          {!editMode && (
            <div className="p-field">
              <label htmlFor="password">Password</label>
              <InputText
                id="password"
                type="password"
                value={karyawanBaru.password}
                onChange={(e) =>
                  setKaryawanBaru({ ...karyawanBaru, password: e.target.value })
                }
                placeholder="minimal 6 karakter"
              />
            </div>
          )}

          {/* Jabatan */}
          <div className="p-field">
            <label htmlFor="Jabatan">Jabatan</label>
            <select
              id="jabatan_id"
              value={karyawanBaru.jabatan_id}
              onChange={(e) => setKaryawanBaru({ ...karyawanBaru, jabatan_id: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
            >
              <option value="">Pilih Jabatan</option>
              {jabatanList.map((jabatan: any) => (
                <option key={jabatan.id} value={jabatan.id}>
                  {jabatan.jabatan}
                </option>
              ))}
            </select>
          </div>

          {/* Device Code */}
          <div className="p-field">
            <label htmlFor="device_code">Kode Device</label>
            <InputText
              id="device_code"
              value={karyawanBaru.device_code}
              onChange={(e) => setKaryawanBaru({ ...karyawanBaru, device_code: e.target.value })}
              placeholder="masukkan kode device"
            />
          </div>

          {/* Tombol Simpan */}
          <div className="p-field">
            <Button
              label="Simpan"
              onClick={simpanKaryawan}
              style={{ marginTop: '1rem' }}
            />
          </div>
        </div>
      </Dialog>
    </Panel>
  );
};

export default DataKaryawan;