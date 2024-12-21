'use client';
/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import Link from 'next/link';
import Swal from 'sweetalert2'; // Import SweetAlert2

const Register = () => {
    const [namaKaryawan, setNamaKaryawan] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false); // State untuk toggle visibility
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
                text: "Silakan masukkan alamat email yang valid."
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
                title: "Ketentuan Tidak Diterima",
                text: "Anda harus setuju dengan Syarat dan Ketentuan."
            });
            return;
        }

        try {
            const response = await fetch('http://192.168.200.37:8001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama_karyawan: namaKaryawan,
                    email,
                    password,
                }),
            });

            console.log('Response:', response);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Pendaftaran gagal:', errorData);
                throw new Error('Pendaftaran gagal');
            }

            const data = await response.json();
            console.log('Pendaftaran berhasil', data);

            Swal.fire({
                icon: "success",
                title: "Akun Dibuat",
                text: "Akun Anda telah berhasil dibuat!",
            }).then(() => {
                router.push('/auth/login');
            });

        } catch (error) {
            console.error('Kesalahan saat pendaftaran:', error);
            Swal.fire({
                icon: "error",
                title: "Pendaftaran Gagal",
                text: "Terjadi kesalahan saat pendaftaran. Silakan coba lagi."
            });
        }
    };

    return (
        <div
            className={containerClassName}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F2F3F7',
                padding: '2rem',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    background: '#fff',
                    borderRadius: '10px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    maxWidth: '900px',
                    overflow: 'hidden',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        flex: 1,
                        padding: '3rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    <h3 className="text-center text-900 text-3xl font-medium mb-5">Register</h3>

                    <div className="mb-3">
                        <label htmlFor="namaKaryawan" className="block text-900 text-xl font-medium mb-2">
                            Nama
                        </label>
                        <InputText
                            id="nama"
                            type="text"
                            placeholder="Nama"
                            value={namaKaryawan}
                            onChange={(e) => setNamaKaryawan(e.target.value)}
                            className="w-full p-3 md:w-30rem"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                            Email
                        </label>
                        <InputText
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 md:w-30rem"
                        />
                    </div>

                    {/* Custom Password Input */}
                    <div className="mb-3" style={{ position: 'relative' }}>
                        <label htmlFor="password" className="block text-900 text-xl font-medium mb-2">
                            Password
                        </label>
                        <InputText
                            id="password"
                            type={passwordVisible ? 'text' : 'password'}
                            placeholder="Password"
                            className="w-full p-3 md:w-30rem"
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

                    <div className="flex align-items-center justify-content-between mb-5 gap-5">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="agreeTerms"
                                checked={checked}
                                onChange={(e) => setChecked(e.checked ?? false)}
                                className="mr-2"
                            />
                            <label htmlFor="agreeTerms">
                                Saya setuju dengan <a href="#" className="font-medium" style={{ color: 'var(--primary-color)' }}>Syarat dan Ketentuan</a>
                            </label>
                        </div>
                    </div>

                    <Button
                        label="Daftar"
                        className="w-full p-3 text-xl"
                        style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                        onClick={handleRegister}
                    />

                    <div className="text-center mt-5">
                        <span className="text-600">Sudah memiliki akun?</span>
                        <Link href="/auth/login" className="font-medium" style={{ color: 'var(--primary-color)', marginLeft: '5px' }}>
                            Masuk sekarang
                        </Link>
                    </div>
                </div>

                <div
                    style={{
                        flex: 1,
                        background: 'linear-gradient(to bottom, #ffffff, #1E90FF)',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3rem',
                    }}
                >
                    <div className="text-center">
                        <img
                            src="/layout/images/payrollmetrics1.png"
                            alt="Gambar Selamat Datang"
                            style={{ maxWidth: '100%', height: 'auto', marginBottom: '1rem', width: '80%' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
