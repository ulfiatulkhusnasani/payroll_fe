"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Gunakan next/navigation di App Directory

const LogoutPage = () => {
    const router = useRouter();

    useEffect(() => {
        // Simulasi logout
        const handleLogout = async () => {
            try {
                // Hapus token dari localStorage atau cookies
                localStorage.removeItem("authToken");

                // Redirect ke halaman utama
                router.push("/");
            } catch (error) {
                console.error("Logout gagal:", error);
            }
        };

        handleLogout();
    }, [router]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Logging out...</h2>
        </div>
    );
};

export default LogoutPage;
