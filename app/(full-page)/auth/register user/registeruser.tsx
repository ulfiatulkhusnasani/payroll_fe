'use client';

import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import Link from 'next/link';
import Swal from 'sweetalert2'; // Untuk alert notifikasi

const RegisterUser = () => {
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const handleRegister = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.fire({
                icon: "error",
                title: "Email Tidak Valid",
                text: "Silakan masukkan alamat email yang benar."
            });
            return;
        }

        if (!password.trim()) {
            Swal.fire({
                icon: "error",
                title: "Password Diperlukan",
                text: "Silakan masukkan kata sandi."
            });
            return;
        }

        if (!checked) {
            Swal.fire({
                icon: "error",
                title: "Ketentuan Belum Disetujui",
                text: "Silakan setujui syarat dan ketentuan terlebih dahulu."
            });
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama,
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Pendaftaran gagal:', errorData);
                Swal.fire({
                    icon: "error",
                    title: "Gagal Mendaftar",
                    text: errorData?.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
                });
                return;
            }

            const data = await response.json();
            console.log('Pendaftaran berhasil', data);

            Swal.fire({
                icon: "success",
                title: "Berhasil Mendaftar",
                text: "Silakan login untuk melanjutkan.",
            }).then(() => {
                router.push('/auth/login');
            });
        } catch (error) {
            console.error('Error saat registrasi:', error);
            Swal.fire({
                icon: "error",
                title: "Gagal Mendaftar",
                text: "Terjadi kesalahan pada server. Silakan coba lagi.",
            });
        }
    };

    return (
        <div className={containerClassName} style={{ backgroundColor: '#F2F3F7', padding: '2rem' }}>
            <div className="flex flex-row bg-white rounded-2xl shadow-md max-w-4xl overflow-hidden w-full">
                {/* Kiri - Formulir */}
                <div className="flex-1 p-10 flex flex-col justify-center">
                    <h3 className="text-center text-3xl font-semibold mb-6">Daftar Akun Pengguna</h3>

                    <div className="mb-4">
                        <label htmlFor="nama" className="block text-xl font-medium mb-2">Nama</label>
                        <InputText
                            id="nama"
                            type="text"
                            placeholder="Nama lengkap"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            className="w-full p-3"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-xl font-medium mb-2">Email</label>
                        <InputText
                            id="email"
                            type="email"
                            placeholder="Alamat email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3"
                        />
                    </div>

                    <div className="mb-4" style={{ position: 'relative' }}>
                        <label htmlFor="password" className="block text-xl font-medium mb-2">Password</label>
                        <InputText
                            id="password"
                            type={passwordVisible ? 'text' : 'password'}
                            placeholder="Kata sandi"
                            className="w-full p-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <i
                            className={`fas ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`}
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                fontSize: '18px',
                                color: '#888',
                            }}
                        ></i>
                    </div>

                    <div className="flex align-items-center justify-content-start mb-5">
                        <Checkbox
                            inputId="agreeTerms"
                            checked={checked}
                            onChange={(e) => setChecked(e.checked ?? false)}
                            className="mr-2"
                        />
                        <label htmlFor="agreeTerms">
                            Saya setuju dengan <a href="#" className="font-medium text-primary">Syarat dan Ketentuan</a>
                        </label>
                    </div>

                    <Button
                        label="Daftar"
                        className="w-full p-3 text-xl"
                        style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                        onClick={handleRegister}
                    />

                    <div className="text-center mt-5">
                        <span>Sudah punya akun?</span>
                        <Link href="/auth/login" className="font-medium text-primary ml-2">
                            Login sekarang
                        </Link>
                    </div>
                </div>

                {/* Kanan - Gambar */}
                <div className="flex-1 bg-blue-500 text-white flex flex-col items-center justify-center p-10">
                    <img
                        src="/layout/images/payrollmetrics1.png"
                        alt="Welcome"
                        style={{ maxWidth: '100%', height: 'auto', width: '80%' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default RegisterUser;