'use client';

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
    Users,
    Settings,
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { useRoles } from "../../context/rolesContext";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";

export default function EditPermissionsModal({
                                                 isOpen,
                                                 onClose,
                                                 selectedUser,
                                             }) {
    const allModules = [
        "users",
        "settings",
    ];

    const [userRoleId, setUserRoleId] = useState(0);

    const {
        user,
        updateUserRoleMutation,
        getUserPermissionMutation,
        userPermission,
        setUserPermission,
        updateUserPermissionMutation,
    } = useAuth();

    const { roles } = useRoles();

    // ✅ Fixed useEffect - only runs when selectedUser ID changes
    useEffect(() => {
        if (selectedUser?.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUserRoleId(selectedUser.roleId);
            getUserPermissionMutation.mutate({ id: selectedUser.id });
        }
    }, [selectedUser?.id]); // Remove setUserRoleId and getUserPermissionMutation from dependencies

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const handleRoleChange = useCallback((roleId) => {
        setUserRoleId(roleId);

        const selectedRole = roles.find((r) => r.id === roleId);
        if (!selectedRole || !selectedUser) return;

        let updated = {};

        if (selectedRole.name === "admin") {
            // Admin → everything true
            for (const moduleKey of allModules) {
                updated[moduleKey] = {
                    enabled: true,
                    canRead: true,
                    canWrite: true,
                    canDelete: true,
                };
            }
        } else {
            // Non-admin → reset to that role's default permissions
            const roleDefaults = selectedRole.permissions || {};
            for (const moduleKey of allModules) {
                updated[moduleKey] = {
                    enabled: !!roleDefaults[moduleKey],
                    canRead: !!roleDefaults[moduleKey]?.read,
                    canWrite: !!roleDefaults[moduleKey]?.write,
                    canDelete: !!roleDefaults[moduleKey]?.delete,
                };
            }
        }

        // Update local state
        setUserPermission(updated);

        // Update role in DB
        updateUserRoleMutation.mutate({
            id: selectedUser.id,
            roleId,
            createdBy: user.id,
        });

        // Also update permissions in DB immediately
        const permissionsList = Object.entries(updated).map(([module, perms]) => ({
            module,
            enabled: perms.enabled,
            canRead: perms.canRead,
            canWrite: perms.canWrite,
            canDelete: perms.canDelete,
        }));

        updateUserPermissionMutation.mutate({
            id: selectedUser.id,
            createdBy: user.id,
            permissions: permissionsList,
        });
    }, [roles, selectedUser, user?.id, setUserPermission, updateUserRoleMutation, updateUserPermissionMutation]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        if (!selectedUser) return;

        const permissionsList = [];
        Object.entries(userPermission).forEach(([module, perms]) => {
            if (perms.enabled) {
                permissionsList.push({
                    module,
                    enabled: perms.enabled,
                    canRead: perms.canRead,
                    canWrite: perms.canWrite,
                    canDelete: perms.canDelete,
                });
            }
        });

        updateUserPermissionMutation.mutate({
            id: selectedUser.id,
            createdBy: user?.id,
            permissions: permissionsList,
        });
    }, [selectedUser, userPermission, user?.id, updateUserPermissionMutation]);

    if (!selectedUser) return null;

    const modules = [
        { key: "users", label: "Users", icon: Users, color: "text-red-600" },
        { key: "settings", label: "Settings", icon: Settings, color: "text-gray-600" },
    ];

    const actions = [
        { key: "Read", label: "Read" },
        { key: "Write", label: "Write" },
        { key: "Delete", label: "Delete" },
    ];

    const isAdmin = roles.find((r) => r.id === userRoleId)?.name === "admin";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit User Permissions</DialogTitle>
                </DialogHeader>

                <div className="mt-2">
                    {/* User Info */}
                    <div className="mb-4">
                        <div className="flex items-center space-x-4">
                            {selectedUser.profileImageUrl ? (
                                <img
                                    className="h-12 w-12 rounded-full object-cover"
                                    src={selectedUser.profileImageUrl}
                                    alt="User profile"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-primary-600 font-medium">
                                        {selectedUser.firstName?.[0] || ''}
                                        {selectedUser.lastName?.[0] || ''}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h4 className="text-lg font-medium text-gray-900">
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </h4>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* User Role */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">
                                User Role
                            </Label>
                            <div className="space-y-2">
                                {roles.map((role) => (
                                    <label key={role.id} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.id}
                                            checked={userRoleId === role.id}
                                            onChange={(e) => handleRoleChange(Number(e.target.value))}
                                            className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">
                                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)} -{" "}
                                            {role.name === "admin"
                                                ? "Full system access"
                                                : role.name === "manager"
                                                    ? "Module-based access"
                                                    : "Limited access"}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Permissions */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Permissions</h3>
                            <p className="text-sm text-gray-600">
                                Define what actions users with this role can perform.
                            </p>

                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-48">Module</TableHead>
                                            {actions.map((action) => (
                                                <TableHead key={action.key} className="text-center">
                                                    {action.label}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modules.map((module) => {
                                            const Icon = module.icon;

                                            return (
                                                <TableRow key={module.key}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <Icon className="w-4 h-4 text-gray-500" />
                                                            <span>{module.label}</span>
                                                        </div>
                                                    </TableCell>

                                                    {actions.map((action) => {
                                                        const key = `can${action.key}`;
                                                        const value =
                                                            userPermission?.[module.key]?.[key] || false;

                                                        return (
                                                            <TableCell
                                                                key={action.key}
                                                                className="text-center"
                                                            >
                                                                <Switch
                                                                    checked={isAdmin ? true : value}
                                                                    disabled={isAdmin}
                                                                    onCheckedChange={(checked) =>
                                                                        setUserPermission((prev) => ({
                                                                            ...prev,
                                                                            [module.key]: {
                                                                                ...prev[module.key],
                                                                                enabled: checked
                                                                                    ? true
                                                                                    : prev[module.key]?.enabled,
                                                                                [key]: checked,
                                                                            },
                                                                        }))
                                                                    }
                                                                />
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateUserPermissionMutation.isPending}
                            >
                                {updateUserPermissionMutation.isPending
                                    ? "Saving..."
                                    : "Save Permissions"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}