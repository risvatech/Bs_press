'use client';
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import {
    Users,
    UserPlus,
    Handshake,
    FileText,
    Package,
    Wrench,
    BarChart,
    Settings,
    Database,
    CreditCard,
    Brain,
    Bot,
    Plus,
    Shield,
    Key,
    Lock,
    MoreHorizontal,
    Edit,
    Trash,
} from "lucide-react";
import { useRoles } from "../../context/rolesContext";
import { useAuth } from "../../context/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

export function RoleManagement() {
    const {
        roles,
        getRolesMutation,
        createRolesMutation,
        rolesForm,
        deleteRolesMutation,
        updateRolesMutation,
        isRoleDialogOpen,
        setIsRoleDialogOpen,
        editingRole,
        setEditingRole,
    } = useRoles();

    const { user, users } = useAuth();

    const handleCreateRole = () => {
        setIsRoleDialogOpen(true);
    };

    const handleDeleteRole = (role_id, isSystem) => {
        if (isSystem) {
            toast.error("System roles cannot be deleted");
            return;
        }

        if (
            window.confirm(
                "Are you sure you want to delete this role? This action cannot be undone.",
            )
        ) {
            deleteRolesMutation.mutate({ id: role_id });
        }
    };

    const onCreateSubmit = () => {
        createRolesMutation.mutate({
            name: rolesForm.watch("name"),
            displayName: rolesForm.watch("displayName"),
            description: rolesForm.watch("description"),
            permissions: rolesForm.watch("permissions"),
            isSystem: false,
            createdBy: user.id,
        });
    };

    const onEditSubmit = () => {
        updateRolesMutation.mutate({
            id: editingRole.id,
            name: rolesForm.watch("name"),
            displayName: rolesForm.watch("displayName"),
            description: rolesForm.watch("description"),
            permissions: rolesForm.watch("permissions"),
            isSystem: false,
            createdBy: user.id,
        });
    };

    const totalRoles = roles?.length || 0;
    const customRoles = roles?.filter((r) => !r.isSystem).length || 0;
    const systemRoles = roles?.filter((r) => r.isSystem).length || 0;

    const modules = [
        { key: "users", label: "Users", icon: Users, color: "text-red-600" },
        { key: "settings", label: "Settings", icon: Settings, color: "text-gray-600" },
    ];

    const actions = [
        { key: "read", label: "Read" },
        { key: "write", label: "Write" },
        { key: "delete", label: "Delete" },
    ];

    // Build default permissions from modules
    const getDefaultPermissions = () => {
        return modules.reduce((acc, module) => {
            acc[module.key] = { read: false, write: false, delete: false };
            return acc;
        }, {});
    };

    const handleCloseModal = () => {
        rolesForm.reset({
            name: "",
            displayName: "",
            description: "",
            permissions: getDefaultPermissions(),
        });
        setEditingRole(null);
        setIsRoleDialogOpen(false);
    };

    const handleEdit = (role) => {
        setEditingRole(role);

        rolesForm.reset({
            name: role.name,
            displayName: role.displayName,
            description: role.description || "",
            // merge defaults with saved permissions (so no missing keys)
            permissions: {
                ...getDefaultPermissions(),
                ...(role.permissions || {}),
            },
        });

        setIsRoleDialogOpen(true);
    };

    const getNumberOfUsers = (roleId) => {
        return users?.filter((u) => u.role_id === roleId)?.length || 0;
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Role Management
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Create and manage custom user roles with specific permissions.
                        </p>
                    </div>
                    <Button onClick={handleCreateRole} data-testid="button-create-role">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Role
                    </Button>
                </div>
            </div>

            {/* Role Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                                <p
                                    className="text-3xl font-bold text-gray-900 mt-2"
                                    data-testid="text-total-roles"
                                >
                                    {totalRoles}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Shield className="text-blue-600 w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Custom Roles
                                </p>
                                <p
                                    className="text-3xl font-bold text-gray-900 mt-2"
                                    data-testid="text-custom-roles"
                                >
                                    {customRoles}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Key className="text-green-600 w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    System Roles
                                </p>
                                <p
                                    className="text-3xl font-bold text-gray-900 mt-2"
                                    data-testid="text-system-roles"
                                >
                                    {systemRoles}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Lock className="text-purple-600 w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getRolesMutation?.isPending ? (
                    <Card className="shadow-sm rounded-2xl">
                        <CardContent className="p-6 text-center text-gray-500">
                            Loading roles...
                        </CardContent>
                    </Card>
                ) : roles?.length > 0 ? (
                    roles.map((role) => (
                        <Card
                            key={role.id}
                            data-testid={`card-role-${role.id}`}
                            className="shadow-sm hover:shadow-md transition rounded-2xl"
                        >
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        {/* Role Name + System Name */}
                                        <div>
                                            <div className="text-lg font-semibold text-gray-900">
                                                {role.displayName}
                                            </div>
                                            <div className="text-sm text-gray-500">{role.name}</div>
                                        </div>

                                        {/* Role Type */}
                                        <Badge
                                            className={
                                                role.isSystem
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-green-100 text-green-800"
                                            }
                                        >
                                            {role.isSystem ? "System" : "Custom"}
                                        </Badge>

                                        {/* Description */}
                                        <div className="text-sm text-gray-600">
                                            {role.description || "No description"}
                                        </div>

                                        {/* User count */}
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <span>{getNumberOfUsers(role.id)} users</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
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
                                        <DropdownMenuContent align="end" className="w-32">
                                            <DropdownMenuItem onClick={() => handleEdit(role)}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            {!role.isSystem && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDeleteRole(role.id, role.isSystem)
                                                    }
                                                    className="text-red-600"
                                                >
                                                    <Trash className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="shadow-sm rounded-2xl">
                        <CardContent className="p-6 text-center text-gray-500">
                            No roles found
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Create/Edit Role Modal */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRole
                                ? `Edit Role: ${editingRole.displayName}`
                                : "Create New Role"}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={rolesForm.handleSubmit(
                            editingRole ? onEditSubmit : onCreateSubmit,
                        )}
                        className="space-y-6"
                    >
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Basic Information</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Role Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        value={rolesForm.watch("name")}
                                        onChange={(e) => rolesForm.setValue("name", e.target.value)}
                                        placeholder="e.g., sales_manager"
                                        data-testid="input-role-name"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Unique identifier (lowercase, underscores allowed)
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="displayName">Display Name *</Label>
                                    <Input
                                        id="displayName"
                                        type="text"
                                        required
                                        value={rolesForm.watch("displayName")}
                                        onChange={(e) =>
                                            rolesForm.setValue("displayName", e.target.value)
                                        }
                                        placeholder="e.g., Sales Manager"
                                        data-testid="input-role-display-name"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Human-readable name
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={rolesForm.watch("description")}
                                    onChange={(e) =>
                                        rolesForm.setValue("description", e.target.value)
                                    }
                                    placeholder="Brief description of this role's purpose and responsibilities"
                                    data-testid="textarea-role-description"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <Separator />

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
                                                        const fieldKey = `permissions.${module.key}.${action.key}`;
                                                        const value = rolesForm.watch(fieldKey) || false;

                                                        return (
                                                            <TableCell
                                                                key={action.key}
                                                                className="text-center"
                                                            >
                                                                <Switch
                                                                    checked={editingRole?.isSystem ? true : value}
                                                                    disabled={editingRole?.isSystem}
                                                                    onCheckedChange={(checked) =>
                                                                        !editingRole?.isSystem &&
                                                                        rolesForm.setValue(fieldKey, checked)
                                                                    }
                                                                    data-testid={`switch-${module.key}-${action.key}`}
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
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseModal}
                                data-testid="button-cancel-role"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    createRolesMutation?.isPending || updateRolesMutation?.isPending
                                }
                                data-testid="button-save-role"
                            >
                                {editingRole
                                    ? updateRolesMutation?.isPending
                                        ? "Updating..."
                                        : "Update Role"
                                    : createRolesMutation?.isPending
                                        ? "Creating..."
                                        : "Create Role"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}