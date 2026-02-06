'use client';

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { queryClient } from "../../lib/queryClient";
import { apiRequest } from "../../lib/queryClient";
import { isUnauthorizedError } from "../../lib/authUtils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

export default function AddUserModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        role: "user",
        status: "active",
    });

    const router = useRouter();

    const createMutation = useMutation({
        mutationFn: async (userData) => {
            const response = await apiRequest("POST", "/api/users", userData);
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            toast.success("User created successfully");
            handleClose();
        },
        onError: (error) => {
            if (isUnauthorizedError(error)) {
                toast.error("You are logged out. Logging in again...");
                setTimeout(() => {
                    router.push("/login"); // Use Next.js router instead of window.location
                }, 500);
                return;
            }
            toast.error("Failed to create user");
        },
    });

    const handleClose = () => {
        setFormData({
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
            role: "user",
            status: "active",
        });
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !formData.email.trim() ||
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.password.trim()
        ) {
            toast.error("All fields are required");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        // Remove confirmPassword from data sent to server
        const { confirmPassword, ...userData } = formData;
        createMutation.mutate(userData);
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
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
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
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
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            placeholder="Enter last name"
                            data-testid="input-user-last-name"
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
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
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                handleInputChange("confirmPassword", e.target.value)
                            }
                            placeholder="Confirm password"
                            data-testid="input-user-confirm-password"
                        />
                    </div>

                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => handleInputChange("role", value)}
                        >
                            <SelectTrigger data-testid="select-user-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleInputChange("status", value)}
                        >
                            <SelectTrigger data-testid="select-user-status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            data-testid="button-cancel-user"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            data-testid="button-save-user"
                        >
                            {createMutation.isPending ? "Creating..." : "Create User"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}