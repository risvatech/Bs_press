"use client";
import { useAuth } from "../context/AuthContext";
import AuthPage from "../pages/admin/AuthPage";
import Layout from "../components/sub_pages/Layout";
import AdminContact from "@/app/pages/admin/Contact";

export default function CMSHome() {
    const { user } = useAuth();
    return user ? (
        <Layout>
            <AdminContact/>
        </Layout>
    ) : (
        <AuthPage />
    );
}