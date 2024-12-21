'use client'; // Penting untuk Next.js agar menjalankan komponen ini di sisi klien

/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types'; // Pastikan tipe data sudah benar di sini

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext); // Mengambil konfigurasi layout dari context

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard Admin', icon: 'pi pi-fw pi-home', to: '/' }] // Dashboard mengarah ke halaman utama '/'
        },
        {
            label: 'KELOLA',
            items: [
                { label: 'Karyawan', icon: 'pi pi-fw pi-check-square', to: '/pages/DataKaryawan' },
                { label: 'Data Jabatan', icon: 'pi pi-fw pi-briefcase', to: '/pages/Datajabatan' },      
                {
                    label: 'Absensi',
                    icon: 'pi pi-fw pi-list',
                    items: [
                        { label: 'Hadir', icon: 'pi pi-fw pi-info-circle', to: '/pages/Hadir' },
                        { label: 'Cuti', icon: 'pi pi-fw pi-info-circle', to: '/pages/Cuti' },
                        { label: 'Lembur', icon: 'pi pi-fw pi-info-circle', to: '/pages/Lembur' },
                        { label: 'Dinas luar kota', icon: 'pi pi-fw pi-info-circle', to: '/pages/Dinas' }
                    ]
                },
                { label: 'Data Gaji', icon: 'pi pi-fw pi-money-bill', to: '/pages/Gaji' },
                { label: 'Slip Gaji', icon: 'pi pi-fw pi-envelope', to: '/pages/Slip' },
                { label: 'Laporan', icon: 'pi pi-fw pi-file', to: '/pages/Laporan' }
            ]
        },
        {
            label: 'Pintasan',
            items: [
                {
                    label: 'Keluar Akun',
                    icon: 'pi pi-fw pi-sign-out',
                    target: '_blank'
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => (
                    <AppMenuitem item={item} root={true} index={i} key={item.label} />
                ))}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
