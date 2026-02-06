import {useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {apiRequest} from '../../lib/queryClient';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '../ui/dialog';
import {Button} from '../ui/button';
import {Input} from '../ui/input';
import {Label} from '../ui/label';
import {Eye, EyeOff, Lock} from 'lucide-react';
import {useAuth} from '../../context/AuthContext.jsx';

export default function ChangePasswordModal({open, onClose, user}) {
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const {
        changePwdMutation,
        changePwdForm,
    } = useAuth();


    const mapChangePwdValues = (changePwd, userId, extra = {}) => ({
        // common fields
        currentPassword: changePwd.currentPassword || "",
        newPassword: changePwd.newPassword || "",

        // allow overrides (for id in edit, etc.)
        ...extra,
    });

    const onSubmit = (data) => {

        changePwdMutation.mutate(mapChangePwdValues(data, user.id));

    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !passwords.currentPassword ||
            !passwords.newPassword ||
            !passwords.confirmPassword
        ) {
            toast({
                title: 'Error',
                description: 'Please fill in all password fields',
                variant: 'destructive',
            });
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast({
                title: 'Error',
                description: 'New passwords do not match',
                variant: 'destructive',
            });
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast({
                title: 'Error',
                description: 'Password must be at least 6 characters long',
                variant: 'destructive',
            });
            return;
        }

        changePwdMutation.mutate({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Lock className="w-5 h-5 mr-2"/>
                        Change Password
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={changePwdForm.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showPasswords.current ? 'text' : 'password'}
                                {...changePwdForm.register("currentPassword", {
                                    required: "Current password is required",
                                })}
                                placeholder="Enter current password"
                                className="pr-10"
                                data-testid="input-current-password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => togglePasswordVisibility('current')}
                            >
                                {showPasswords.current ? (
                                    <EyeOff className="h-4 w-4 text-gray-400"/>
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400"/>
                                )}
                            </button>
                        </div>
                        {changePwdForm.formState.errors.currentPassword && (
                            <p className="text-sm text-red-500 mt-1">
                                {changePwdForm.formState.errors.currentPassword.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showPasswords.new ? 'text' : 'password'}
                                {...changePwdForm.register("newPassword", {
                                    required: "New password is required",
                                })}
                                placeholder="Enter new password"
                                className="pr-10"
                                data-testid="input-new-password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => togglePasswordVisibility('new')}
                            >
                                {showPasswords.new ? (
                                    <EyeOff className="h-4 w-4 text-gray-400"/>
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400"/>
                                )}
                            </button>
                        </div>
                        {changePwdForm.formState.errors.newPassword && (
                            <p className="text-sm text-red-500 mt-1">
                                {changePwdForm.formState.errors.newPassword.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showPasswords.confirm ? 'text' : 'password'}
                                {...changePwdForm.register("confirmPassword", {
                                    required: "Confirm password is required",
                                    validate: (value) =>
                                        value === changePwdForm.getValues("newPassword") || "Passwords do not match",
                                })}
                                placeholder="Confirm new password"
                                className="pr-10"
                                data-testid="input-confirm-password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => togglePasswordVisibility('confirm')}
                            >
                                {showPasswords.confirm ? (
                                    <EyeOff className="h-4 w-4 text-gray-400"/>
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400"/>
                                )}
                            </button>
                        </div>
                        {changePwdForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-500 mt-1">
                                {changePwdForm.formState.errors.confirmPassword.message}
                            </p>
                        )}
                    </div>


                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            data-testid="button-cancel-password"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={changePwdMutation.isPending}
                            data-testid="button-change-password"
                        >
                            {changePwdMutation.isPending
                                ? 'Changing...'
                                : 'Change Password'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
