'use client';

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Eye, EyeOff, Shield } from "lucide-react";

export default function AdminPasswordModal({ open, onClose, user }) {
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false,
    });
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (data) => {
            await apiRequest(
                `/api/admin/user/${user.id}/change-password`,
                "POST",
                data,
            );
        },
        onSuccess: () => {
            toast.success(`Password changed successfully for ${user.username}`);
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            setPasswords({ newPassword: "", confirmPassword: "" });
            onClose();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to change user password");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!passwords.newPassword || !passwords.confirmPassword) {
            toast.error("Please fill in all password fields");
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        changePasswordMutation.mutate({
            newPassword: passwords.newPassword,
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleClose = () => {
        setPasswords({ newPassword: "", confirmPassword: "" });
        setShowPasswords({ new: false, confirm: false });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Change Password for {user?.firstName} {user?.lastName}
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                        <strong>Admin Action:</strong> You are changing the password for
                        user "{user?.username}". The user will need to use this new password
                        to log in.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showPasswords.new ? "text" : "password"}
                                value={passwords.newPassword}
                                onChange={(e) =>
                                    setPasswords((prev) => ({
                                        ...prev,
                                        newPassword: e.target.value,
                                    }))
                                }
                                placeholder="Enter new password for user"
                                className="pr-10"
                                data-testid="input-admin-new-password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => togglePasswordVisibility("new")}
                            >
                                {showPasswords.new ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwords.confirmPassword}
                                onChange={(e) =>
                                    setPasswords((prev) => ({
                                        ...prev,
                                        confirmPassword: e.target.value,
                                    }))
                                }
                                placeholder="Confirm new password"
                                className="pr-10"
                                data-testid="input-admin-confirm-password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => togglePasswordVisibility("confirm")}
                            >
                                {showPasswords.confirm ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500">
                        <p>Password requirements:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>At least 6 characters long</li>
                            <li>Will replace the user's current password immediately</li>
                            <li>User must use this password for next login</li>
                        </ul>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            data-testid="button-cancel-admin-password"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={changePasswordMutation.isPending}
                            data-testid="button-admin-change-password"
                        >
                            {changePasswordMutation.isPending
                                ? "Changing..."
                                : "Change Password"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}