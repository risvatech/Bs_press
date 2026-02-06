'use client';
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { isUnauthorizedError } from "../../lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
    Users,
    Building2,
    Handshake,
    CheckSquare,
    BarChart,
    Settings,
    FileText,
    Package,
    Wrench,
    Database,
    CreditCard,
    Brain,
    Bot,
    BookOpen,
    Edit,
    Shield
} from "lucide-react";
import EditPermissionsModal from "../../components/modals/EditPermissionsModal";
import { useAuth } from "../../context/AuthContext.jsx";
import { useRoles } from "../../context/rolesContext.jsx";
import Image from "next/image";

const moduleIcons = {
    users: Users,
    settings: Settings,
};

const moduleColors = {
    users: "text-red-600",
    settings: "text-gray-600",
};

export default function Permissions() {
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { users, getAllUsersMutation } = useAuth();
    const { roles } = useRoles();

    const getRoleName = (role_id) => {
        return roles?.find((r) => r.id === role_id)?.name || `Role #${role_id}`;
    };

    const handleEditPermissions = (user) => {
        setSelectedUser(user);
        setShowPermissionsModal(true);
    };

    const getRoleColor = (role) => {
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

    const modules = [
        "users",
        "settings",
    ];

    // Fix for role name lookup in stats section
    const adminUsersCount = users?.filter((u) => getRoleName(u.role_id) === "admin").length || 0;
    const managerUsersCount = users?.filter((u) => getRoleName(u.role_id) === "manager").length || 0;
    const regularUsersCount = users?.filter((u) => getRoleName(u.role_id) === "user").length || 0;

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Permissions Management
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage user access rights and module permissions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Permission Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Module Overview */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Module Access Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {modules.map((module) => {
                                const Icon = moduleIcons[module];
                                const usersWithAccess =
                                    users?.filter((user) => {
                                        const role = roles.find((r) => r.id === user.role_id);
                                        if (!role) return false;

                                        // Admin / system roles get full access
                                        if (role.isSystem) return true;

                                        // Check if role has any permission for this module
                                        return (
                                            role.permissions?.[module] &&
                                            Object.values(role.permissions[module]).some(Boolean)
                                        );
                                    }).length || 0;

                                return (
                                    <div
                                        key={module}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`w-5 h-5 ${moduleColors[module]}`} />
                                            <div>
                                                <h4 className="font-medium text-gray-900 capitalize">
                                                    {module}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {usersWithAccess} users have access
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {Math.round(
                                                (usersWithAccess / (users?.length || 1)) * 100,
                                            )}
                                            % coverage
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Permission Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                    Admin Users
                                </span>
                                <Badge className="bg-red-100 text-red-800">
                                    {adminUsersCount}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                    Manager Users
                                </span>
                                <Badge className="bg-blue-100 text-blue-800">
                                    {managerUsersCount}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                    Regular Users
                                </span>
                                <Badge className="bg-gray-100 text-gray-800">
                                    {regularUsersCount}
                                </Badge>
                            </div>
                            <hr className="my-4" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                    Full Access
                                </span>
                                <span className="text-sm text-gray-900">
                                    {adminUsersCount} users
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                    Limited Access
                                </span>
                                <span className="text-sm text-gray-900">
                                    {users?.filter((u) => getRoleName(u.role_id) !== "admin").length || 0} users
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Permissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>User Permissions Matrix</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    {modules.map((module) => (
                                        <TableHead key={module} className="text-center">
                                            <div className="flex flex-col items-center space-y-1">
                                                {React.createElement(moduleIcons[module], {
                                                    className: `w-4 h-4 ${moduleColors[module]}`,
                                                })}
                                                <span className="text-xs capitalize">{module}</span>
                                            </div>
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {getAllUsersMutation?.isPending ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Skeleton className="h-8 w-8 rounded-full" />
                                                    <div className="space-y-1">
                                                        <Skeleton className="h-4 w-24" />
                                                        <Skeleton className="h-3 w-32" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-6 w-16 rounded-full" />
                                            </TableCell>
                                            {modules.map((_, idx) => (
                                                <TableCell key={idx} className="text-center">
                                                    <Skeleton className="h-4 w-4 mx-auto" />
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <Skeleton className="h-8 w-16" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : users?.length > 0 ? (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    {user.profileImageUrl ? (
                                                        <div className="relative h-8 w-8">
                                                            <Image
                                                                className="rounded-full object-cover"
                                                                src={user.profileImageUrl}
                                                                alt={`${user.firstName} ${user.lastName}`}
                                                                fill
                                                                sizes="32px"
                                                                onError={(e) => {
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                            <span className="text-primary-600 font-medium text-xs">
                                                                {user.firstName?.[0]}
                                                                {user.lastName?.[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getRoleColor(getRoleName(user.role_id))}
                                                >
                                                    {getRoleName(user.role_id)}
                                                </Badge>
                                            </TableCell>
                                            {modules.map((module) => {
                                                const hasAccess = (() => {
                                                    const role = roles.find((r) => r.id === user.role_id);
                                                    if (!role) return false;

                                                    // System roles (like admin) always have full access
                                                    if (role.isSystem) return true;

                                                    // Check module permissions for custom roles
                                                    return role.permissions?.[module]?.read === true;
                                                })();

                                                return (
                                                    <TableCell key={module} className="text-center">
                                                        <div
                                                            className={`inline-flex h-4 w-4 rounded-full ${
                                                                hasAccess ? "bg-green-500" : "bg-gray-300"
                                                            }`}
                                                        />
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditPermissions(user)}
                                                    data-testid="button-edit-user-permissions"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={modules.length + 3}
                                            className="text-center py-8"
                                        >
                                            <div className="flex flex-col items-center space-y-3">
                                                <Shield className="w-12 h-12 text-gray-300" />
                                                <p className="text-gray-500">No users found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Permissions Modal */}
            <EditPermissionsModal
                isOpen={showPermissionsModal}
                onClose={() => setShowPermissionsModal(false)}
                selectedUser={selectedUser}
            />
        </div>
    );
}