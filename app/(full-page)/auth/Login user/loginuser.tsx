'use client';
/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { LayoutContext } from '../../../../layout/context/layoutcontext';

const HalamanLoginUser = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const handleSignIn = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);

                Swal.fire({
                    title: 'Login Berhasil!',
                    text: 'Anda akan diarahkan ke halaman utama.',
                    icon: 'success',
                }).then(() => {
                    router.push('/'); // Ubah ke '/user/dashboard' jika perlu
                });
            } else {
                Swal.fire({
                    title: 'Login Gagal',
                    text: data.message || 'Email atau password salah.',
                    icon: 'error',
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Kesalahan',
                text: 'Tidak dapat terhubung ke server',
                icon: 'error',
            });
        }
    };

    return (
        <div className={containerClassName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F3F7', padding: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'row', background: '#fff', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', maxWidth: '900px', height: '80vh', overflow: 'hidden', width: '100%' }}>
                {/* Kiri - Form Login */}
                <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="text-center mb-4">
                        <div className="text-900 text-3xl font-medium mb-3">Masuk Sebagai Pengguna</div>
                    </div>
                    <div>
                        <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText
                            id="email1"
                            type="text"
                            placeholder="Email"
                            className="w-full md:w-30rem mb-5"
                            style={{ padding: '1rem' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">Password</label>
                        <div style={{ position: 'relative' }}>
                            <InputText
                                id="password1"
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

                        <div className="flex align-items-center justify-content-between mb-5">
                            <a className="font-medium no-underline text-right cursor-pointer" style={{ color: '#000' }}>
                                Lupa kata sandi Anda?
                            </a>
                        </div>

                        <Button
                            label="Masuk"
                            className="w-full p-3 text-xl"
                            style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                            onClick={handleSignIn}
                        />

                        <div className="text-center mt-5">
                            <span className="text-600">Belum punya akun? </span>
                            <Link href="/auth/register" className="font-medium no-underline" style={{ color: 'var(--primary-color)' }}>
                                Daftar sekarang
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Kanan - Gambar */}
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
                            alt="Gambar Sambutan"
                            style={{ maxWidth: '100%', height: 'auto', marginBottom: '1rem', width: '80%' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HalamanLoginUser;
