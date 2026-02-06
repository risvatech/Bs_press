"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "../service/api";
import { useApiMutation } from "../hooks/useApiMutation.jsx";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    // -------------------
    // State
    // -------------------
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);

    const [userPermission, setUserPermission] = useState({});
    const [allowedModules, setAllowedModules] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);

    const modules = [
        "leads",
        "extractor",
        "followups",
        "qualification",
        "customers",
        "deals",
        "quotes",
        "catalog",
        "invoices",
        "payments",
        "reports",
        "aiInsights",
        "aiAssistant",
        "users",
        "settings",
    ];

    // -------------------
    // Forms
    // -------------------
    const authForm = useForm({
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            roleId: 0,
            status: "",
            createdBy: 0,
        },
    });

    const changePwdForm = useForm({
        mode: "all",
        defaultValues: {
            currentPassword: "",
            newPassword: "",
        },
    });

    // -------------------
    // Fetch current user
    // -------------------
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        api
            .get("/auth/user") // cookie sent automatically
            .then((res) => {
                if (isMounted) setUser(res.data);
            })
            .catch(() => {
                if (isMounted) setUser(null);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // -------------------
    // Mutations
    // -------------------
    const loginMutation = useApiMutation({
        url: "/auth/login",
        method: "post",
        successMsg: "Login successful!",
        onSuccessExtra: (data) => {
            setCurrentUser(data);
            window.location.reload();
        },
        onErrorExtra: (error) => {
            toast.error(error.response?.data?.message || "Login failed");
        },
    });

    const registerMutation = useApiMutation({
        url: "/register",
        method: "post",
        successMsg: "Registration successful!",
        onErrorExtra: (error) => {
            toast.error(error.response?.data?.message || "Register failed");
        },
    });

    const logoutMutation = useApiMutation({
        url: "/logout",
        method: "post",
        successMsg: "Logout successful!",
        onSuccessExtra: () => {
            window.location.href = "/";
        },
        onErrorExtra: () => {
            toast.error("Logout failed");
        },
    });

    const changePwdMutation = useApiMutation({
        url: "/change-password",
        method: "post",
        successMsg: "Password changed successfully!",
        onSuccessExtra: () => {
            logoutMutation.mutate();
        },
        onErrorExtra: (error) => {
            toast.error(error.response?.data?.message || "Password change failed");
        },
    });

    const getAllUsersMutation = useApiMutation({
        url: "/auth/users",
        method: "get",
        onSuccessExtra: (data) => setUsers(data),
        onErrorExtra: (error) => {
            toast.error(error.response?.data?.message || "Fetch failed");
        },
    });

    useEffect(() => {
        getAllUsersMutation.mutate();
    }, []);

    const createUserMutation = useApiMutation({
        url: "/users/create",
        method: "post",
        successMsg: "Added user successfully",
        onSuccessExtra: () => {
            toast.success("Added user successfully");
            getAllUsersMutation.mutate();
            authForm.reset();
            setIsUserDialogOpen(false);
        },
        onErrorExtra: (error) => {
            toast.error(error.response?.data?.message || "Add failed");
        },
    });

    const updateUserMutation = useApiMutation({
        url: (userId) => `/users/update/${userId}`,
        method: "put",
        successMsg: "User updated successfully",
        onSuccessExtra: () => {
            toast.success("User updated successfully");
            setEditingUser(null);
            authForm.reset();
            setIsUserDialogOpen(false);
            getAllUsersMutation.mutate();
        },
        onErrorExtra: (error) => {
            toast.error(error.response?.data?.message || "Update failed");
        },
    });

    const updateUserPasswordMutation = useApiMutation({
        url: (userId) => `/users/password/${userId}`,
        method: "put",
        successMsg: "User password updated successfully",
        onSuccessExtra: () => {
            getAllUsersMutation.mutate();
            toast.success("Password updated successfully");
        },
        onErrorExtra: (error) => {
            toast.error(error.response?.data?.message || "Update failed");
        },
    });

    const updateUserRoleMutation = useApiMutation({
        url: (userId) => `/users/role/${userId}`,
        method: "put",
        successMsg: "User role updated successfully",
        onSuccessExtra: () => getAllUsersMutation.mutate(),
        onErrorExtra: (error) => {
            toast.error(error.response?.data?.message || "Update failed");
        },
    });

    const getUserPermissionMutation = useApiMutation({
        url: (userId) => `/users/permission/${userId}`,
        method: "get",
        onSuccessExtra: (data) => {
            const permsMap = {};
            const allowed = [];

            modules.forEach((mod) => {
                const found = data.permissions.find(
                    (p) => p.module.toLowerCase() === mod.toLowerCase()
                );
                if (found?.enabled) allowed.push(mod);

                permsMap[mod] = found
                    ? {
                        enabled: found.enabled,
                        canRead: found.canRead,
                        canWrite: found.canWrite,
                        canDelete: found.canDelete,
                    }
                    : {
                        enabled: false,
                        canRead: false,
                        canWrite: false,
                        canDelete: false,
                    };
            });

            setUserPermission(permsMap);
            setAllowedModules(allowed);
        },
        onErrorExtra: (error) => {
            toast.error(error.response?.data?.message || "Fetch failed");
        },
    });

    useEffect(() => {
        if (user?.id) {
            getUserPermissionMutation.mutate({ id: user.id });
        }
    }, [user]);

    const updateUserPermissionMutation = useApiMutation({
        url: (userId) => `/users/permission/${userId}`,
        method: "put",
        successMsg: "User permission updated successfully",
        onSuccessExtra: () => {
            setShowPermissionsModal(false);
            getAllUsersMutation.mutate();
        },
        onErrorExtra: (error) => {
            toast.error(error.response?.data?.message || "Update failed");
        },
    });

    // -------------------
    // Provider
    // -------------------
    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loginMutation,
                registerMutation,
                logoutMutation,
                loading,
                authForm,
                users,
                setUsers,
                getAllUsersMutation,
                createUserMutation,
                updateUserMutation,
                updateUserPasswordMutation,
                updateUserRoleMutation,
                getUserPermissionMutation,
                userPermission,
                setUserPermission,
                modules,
                updateUserPermissionMutation,
                currentUser,
                setCurrentUser,
                isUserDialogOpen,
                setIsUserDialogOpen,
                editingUser,
                setEditingUser,
                showPermissionsModal,
                setShowPermissionsModal,
                changePwdMutation,
                changePwdForm,
                allowedModules,
                setAllowedModules,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
