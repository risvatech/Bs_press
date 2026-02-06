'use client';
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiRequest } from "../../lib/queryClient";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
    Users,
    UserCheck,
    Shield,
    Plus,
    Edit,
    Trash,
    Lock,
    Clock,
    MoreHorizontal,
} from "lucide-react";
import EditPermissionsModal from "../../components/modals/EditPermissionsModal";
import AdminPasswordModal from "../../components/modals/AdminPasswordModal";
import { useAuth } from "../../context/AuthContext";
import { useRoles } from "../../context/rolesContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import Image from "next/image";

interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role_id: number;
    status: "active" | "inactive" | "suspended";
    profileImageUrl?: string;
    updatedAt?: string;
    createdBy?: string;
}

interface Role {
    id: number;
    name: string;
    displayName?: string;
}

interface UserFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    role_id?: number;
    status: string;
    createdBy?: number;
}

interface CreateUserData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role_id?: number;
    status: string;
    createdBy: string;
}

interface UpdateUserData {
    id: string;
    username: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role_id?: number;
    status: string;
    createdBy: string;
}

interface UpdateRoleData {
    id: string;
    role_id: number;
    updatedBy: string;
}

interface AuthForm {
    watch: <K extends keyof UserFormData>(field: K) => UserFormData[K];
    reset: (data?: Partial<UserFormData>) => void;
    setValue: <K extends keyof UserFormData>(field: K, value: UserFormData[K]) => void;
    handleSubmit: (callback: (data: UserFormData) => void) => (e: React.FormEvent) => void;
}

interface AuthContext {
    user: User;
    authForm: AuthForm;
    users: User[];
    createUserMutation: {
        mutate: (data: CreateUserData) => void;
        isPending: boolean;
    };
    updateUserMutation: {
        mutate: (data: UpdateUserData) => void;
        isPending: boolean;
    };
    updateUserRoleMutation: {
        mutate: (data: UpdateRoleData) => void;
    };
    isUserDialogOpen: boolean;
    setIsUserDialogOpen: (open: boolean) => void;
    editingUser: User | null;
    setEditingUser: (user: User | null) => void;
    showPermissionsModal: boolean;
    setShowPermissionsModal: (open: boolean) => void;
}

export default function UserManagement() {
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const {
        user,
        authForm,
        users,
        createUserMutation,
        updateUserMutation,
        updateUserRoleMutation,
        isUserDialogOpen,
        setIsUserDialogOpen,
        editingUser,
        setEditingUser,
        showPermissionsModal,
        setShowPermissionsModal,
    } = useAuth() as AuthContext;

    const currentUser = user;
    const { roles } = useRoles() as { roles: Role[] };

    const getRoleName = (role_id: number): string => {
        if (!role_id) return "Unassigned";
        const role = roles?.find((r) => r.id === role_id);
        return role?.name || `Role #${role_id}`;
    };

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => apiRequest("delete", `/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User deleted successfully");
        },
        onError: (err: Error) => {
            toast.error(err.message || "Failed to delete user");
        },
    });

    const filteredUsers = users?.filter((user) => {
        const userRoleId = user.role_id?.toString() ?? "";
        const matchesRole = roleFilter === "all" || userRoleId === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesRole && matchesStatus;
    }) || [];

    const handleEditPermissions = (user: User): void => {
        setSelectedUser(user);
        setShowPermissionsModal(true);
    };

    const handleChangePassword = (user: User): void => {
        setSelectedUser(user);
        setShowPasswordModal(true);
    };

    const handleEdit = (user: User): void => {
        setEditingUser(user);
        authForm.reset({
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role_id: user.role_id,
            status: user.status,
        });
        setIsUserDialogOpen(true);
    };

    const handleDelete = (userId: string): void => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            deleteMutation.mutate(userId);
        }
    };

    const onCreateSubmit = (data: UserFormData): void => {
        createUserMutation.mutate({
            username: data.username,
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            role_id: data.role_id,
            status: data.status,
            createdBy: user.id,
        });
    };

    const onEditSubmit = (data: UserFormData): void => {
        if (!editingUser) return;

        updateUserMutation.mutate({
            id: editingUser.id,
            username: data.username,
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            role_id: data.role_id,
            status: data.status,
            createdBy: user.id,
        });
    };

    const handleRoleChange = (userId: string, role_id: number): void => {
        updateUserRoleMutation.mutate({
            id: userId,
            role_id: role_id,
            updatedBy: user.id,
        });
    };

    const getRoleColor = (role: string): string => {
        switch (role) {
            case "admin":
                return "bg-red-100 text-red-800";
            case "manager":
                return "bg-blue-100 text-blue-800";
            case "user":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-green-100 text-green-800";
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "inactive":
                return "bg-yellow-100 text-yellow-800";
            case "suspended":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const totalUsers = users?.length || 0;
    const activeUsers = users?.filter((u) => u.status === "active").length || 0;
    const adminUsers = users?.filter((u) => getRoleName(u.role_id) === "admin").length || 0;

    if (!users || !roles) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading users and roles...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            User Management
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage system users and their permissions.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsUserDialogOpen(true)}
                        data-testid="button-add-user"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p
                                    className="text-3xl font-bold text-gray-900 mt-2"
                                    data-testid="text-total-users"
                                >
                                    {totalUsers}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="text-blue-600 w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Active Users
                                </p>
                                <p
                                    className="text-3xl font-bold text-gray-900 mt-2"
                                    data-testid="text-active-users"
                                >
                                    {activeUsers}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <UserCheck className="text-green-600 w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Admin Users</p>
                                <p
                                    className="text-3xl font-bold text-gray-900 mt-2"
                                    data-testid="text-admin-users"
                                >
                                    {adminUsers}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Shield className="text-purple-600 w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="w-48">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {roles?.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <Card
                            key={user.id}
                            className="shadow-sm hover:shadow-md transition rounded-2xl mb-6"
                        >
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        {/* User Info */}
                                        <div className="flex items-center space-x-3">
                                            {user.profileImageUrl ? (
                                                <div className="relative h-12 w-12">
                                                    <Image
                                                        className="rounded-full object-cover"
                                                        src={user.profileImageUrl}
                                                        alt={`${user.firstName} ${user.lastName}`}
                                                        fill
                                                        sizes="48px"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.onerror = null;
                                                            target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-primary-600 font-medium text-sm">
                                                        {user.firstName?.[0] || ''}
                                                        {user.lastName?.[0] || ''}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {getRoleName(user.role_id) === "admin"
                                                        ? "Admin"
                                                        : `${user.firstName} ${user.lastName}`}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Role & Status */}
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getRoleColor(getRoleName(user.role_id))}>
                                                {getRoleName(user.role_id)}
                                            </Badge>
                                            <Badge className={getStatusColor(user.status)}>
                                                {user.status}
                                            </Badge>
                                        </div>

                                        {/* Last Login */}
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Last Login:{" "}
                                            {user.updatedAt
                                                ? new Date(user.updatedAt).toLocaleDateString()
                                                : "Never"}
                                        </div>

                                        {/* Permissions */}
                                        <div className="flex flex-wrap gap-1 text-sm">
                                            {getRoleName(user.role_id) === "admin" ? (
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    All Modules
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800">
                                                    Limited
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full"
                                            >
                                                <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-50">
                                            <DropdownMenuItem
                                                onClick={() => handleChangePassword(user)}
                                            >
                                                <Lock className="w-4 h-4 mr-2" />
                                                Change Password
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleEditPermissions(user)}
                                            >
                                                <Shield className="w-4 h-4 mr-2" />
                                                Edit Permissions
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-600"
                                                disabled={user.id === currentUser?.id}
                                            >
                                                <Trash className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                        No users found matching your filters.
                    </div>
                )}
            </div>

            {/* Add/Edit User Modal */}
            <Dialog
                open={isUserDialogOpen}
                onOpenChange={(open) => {
                    setIsUserDialogOpen(open);
                    if (!open) {
                        setEditingUser(null);
                    }
                    if (open) {
                        authForm.reset({
                            username: "",
                            email: "",
                            password: "",
                            confirmPassword: "",
                            firstName: "",
                            lastName: "",
                            role_id: undefined,
                            status: "active",
                            createdBy: undefined,
                        });
                    }
                }}
            >
                <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto p-4 sm:p-5 rounded-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? "Edit User" : "Create New User"}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={authForm.handleSubmit(
                            editingUser ? onEditSubmit : onCreateSubmit,
                        )}
                        className="mt-6 space-y-4"
                    >
                        <div>
                            <Label htmlFor="username">Username *</Label>
                            <Input
                                id="username"
                                type="text"
                                required
                                value={authForm.watch("username")}
                                onChange={(e) => authForm.setValue("username", e.target.value)}
                                placeholder="Enter username"
                                data-testid="input-user-username"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={authForm.watch("email")}
                                onChange={(e) => authForm.setValue("email", e.target.value)}
                                placeholder="Enter email address"
                                data-testid="input-user-email"
                            />
                        </div>

                        <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                type="text"
                                required
                                value={authForm.watch("firstName")}
                                onChange={(e) => authForm.setValue("firstName", e.target.value)}
                                placeholder="Enter first name"
                                data-testid="input-user-first-name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                type="text"
                                required
                                value={authForm.watch("lastName")}
                                onChange={(e) => authForm.setValue("lastName", e.target.value)}
                                placeholder="Enter last name"
                                data-testid="input-user-last-name"
                            />
                        </div>

                        {!editingUser && (
                            <>
                                <div>
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={authForm.watch("password")}
                                        onChange={(e) =>
                                            authForm.setValue("password", e.target.value)
                                        }
                                        placeholder="Enter password (min 6 characters)"
                                        data-testid="input-user-password"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={authForm.watch("confirmPassword")}
                                        onChange={(e) =>
                                            authForm.setValue("confirmPassword", e.target.value)
                                        }
                                        placeholder="Confirm password"
                                        data-testid="input-user-confirm-password"
                                    />
                                </div>
                            </>
                        )}

                        {!editingUser && (
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={authForm.watch("role_id")?.toString()}
                                    onValueChange={(value) =>
                                        authForm.setValue(
                                            "role_id",
                                            value === "unassigned" ? undefined : Number(value),
                                        )
                                    }
                                >
                                    <SelectTrigger id="role" data-testid="select-assignee">
                                        <SelectValue placeholder="Select role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {roles?.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={authForm.watch("status") || "active"}
                                onValueChange={(value) => authForm.setValue("status", value)}
                            >
                                <SelectTrigger id="status" data-testid="select-user-status">
                                    <SelectValue placeholder="Select status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-end space-x-4 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsUserDialogOpen(false);
                                    setEditingUser(null);
                                }}
                                data-testid="button-cancel-user"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    createUserMutation.isPending || updateUserMutation.isPending
                                }
                                data-testid="button-save-user"
                            >
                                {editingUser
                                    ? updateUserMutation.isPending
                                        ? "Updating..."
                                        : "Update User"
                                    : createUserMutation.isPending
                                        ? "Creating..."
                                        : "Create User"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <EditPermissionsModal
                isOpen={showPermissionsModal}
                onClose={() => setShowPermissionsModal(false)}
                selectedUser={selectedUser}
            />

            <AdminPasswordModal
                open={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                user={selectedUser}
            />
        </div>
    );
}