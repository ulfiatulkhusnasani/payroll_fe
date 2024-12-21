// 'use client';

// import React, { useState } from 'react';
// import { Button } from "primereact/button";
// import { Dialog } from "primereact/dialog";
// import { InputText } from "primereact/inputtext";
// import { Password } from 'primereact/password';
// import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';
// import { Paginator } from 'primereact/paginator'; // Tambahkan ini

// interface KaryawanData {
//     nama_karyawan: string;
//     nik: string;
//     email: string;
//     no_handphone: string;
//     alamat: string;
//     password: string;
// }

// interface KaryawanDialogProps {
//     open: boolean;
//     onClose: () => void;
//     onSave: (karyawan: KaryawanData) => void;
// }

// const Karyawan: React.FC<KaryawanDialogProps> = ({ open, onClose, onSave }) => {
//     const [karyawan, setKaryawan] = useState<KaryawanData>({
//         nama_karyawan: '',
//         nik: '',
//         email: '',
//         no_handphone: '',
//         alamat: '',
//         password: '',
//     });

//     const [first, setFirst] = useState(0); // State untuk halaman pertama pagination
//     const [rows, setRows] = useState(5);  // State untuk jumlah data per halaman

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setKaryawan({ ...karyawan, [name]: value });
//     };

//     const handleMaskChange = (e: InputMaskChangeEvent) => {
//         const { name, value } = e.target;
//         setKaryawan({ ...karyawan, [name]: value });
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         onSave(karyawan);  // Memanggil onSave dari parent komponen
//     };

//     const onPageChange = (event: any) => {
//         setFirst(event.first);
//         setRows(event.rows);
//     };

//     return (
//         <div>
//             <Dialog
//                 visible={open}
//                 header="Tambah Data Karyawan"
//                 modal
//                 style={{ width: "450px" }}
//                 footer={
//                     <>
//                         <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={()=> onClose()} />
//                         <Button label="Simpan" icon="pi pi-check" className="p-button-text" onClick={handleSubmit} />
//                     </>
//                 }
//                 onHide={()=> onClose()}
//             >
//                 <div className="p-field">
//                     <label htmlFor="nama_karyawan">Nama</label>
//                     <InputText
//                         id="nama_karyawan"
//                         name="nama_karyawan"
//                         value={karyawan.nama_karyawan}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>
//                 <div className="p-field">
//                     <label htmlFor="nik">NIK</label>
//                     <InputText
//                         id="nik"
//                         name="nik"
//                         value={karyawan.nik}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>
//                 <div className="p-field">
//                     <label htmlFor="email">Email</label>
//                     <InputText
//                         id="email"
//                         name="email"
//                         value={karyawan.email}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>
//                 <div className="p-field">
//                     <label htmlFor="no_handphone">No Handphone</label>
//                     <InputMask
//                         id="no_handphone"
//                         name="no_handphone"
//                         value={karyawan.no_handphone}
//                         onChange={handleMaskChange}
//                         mask="(999) 999-9999"
//                         required
//                     />
//                 </div>
//                 <div className="p-field">
//                     <label htmlFor="alamat">Alamat</label>
//                     <InputText
//                         id="alamat"
//                         name="alamat"
//                         value={karyawan.alamat}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>
//                 <div className="p-field">
//                     <label htmlFor="password">Password</label>
//                     <Password
//                         id="password"
//                         name="password"
//                         value={karyawan.password}
//                         onChange={handleChange}
//                         toggleMask
//                         required
//                         feedback={false}
//                     />
//                 </div>
//             </Dialog>

//             {/* Pagination */}
//             <Paginator
//                 first={first}
//                 rows={rows}
//                 totalRecords={50} // Jumlah total data karyawan
//                 rowsPerPageOptions={[5, 10, 20]} // Opsi jumlah data per halaman
//                 onPageChange={onPageChange}
//             />
//         </div>
//     );
// };

// export default Karyawan;

const Karyawan = ()=> {
    return ''
}

export default Karyawan