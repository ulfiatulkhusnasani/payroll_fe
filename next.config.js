/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Atur fallback untuk modul yang tidak tersedia di klien
        config.resolve.fallback = { 
            fs: false, 
            path: false, 
            os: false 
        };

        // Menambahkan alias path untuk kemudahan import
        config.resolve.alias['@'] = path.resolve(__dirname);

        return config;
    },
    async rewrites() {
        return [
            {
                source: '/api/login',
                destination: 'http://192.168.0.103:8000/api/login', // URL backend API
            },
            {
                source: '/api/cuti',
                destination: 'http://192.168.0.103:8000/api/cuti', // Tambahkan endpoint lain sesuai kebutuhan
            },
            {
                source: '/api/karyawan',
                destination: 'http://192.168.0.103:8000/api/karyawan', // Endpoint untuk daftar karyawan
            },
            // Tambahkan lebih banyak rewrites jika perlu
            {
                source: '/api/absensi/:path*',
                destination: 'http://127.0.0.1:8000/api/absensi/:path*', // Endpoint untuk daftar karyawan
            },
        ];
    },
};

module.exports = nextConfig;
