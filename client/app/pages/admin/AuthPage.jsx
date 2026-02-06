'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent } from "../../components/ui/tabs";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../service/api";
import toast from 'react-hot-toast';

export default function AuthPage() {
    const { loginMutation } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            toast.error('Please enter both username and password');
            return;
        }

        // Use the mutation from context if available
        if (loginMutation?.mutate) {
            loginMutation.mutate({
                username: formData.username,
                password: formData.password,
            });
        } else {
            // Fallback to direct API call
            await handleDirectLogin();
        }
    };

    const handleDirectLogin = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', {
                username: formData.username,
                password: formData.password,
            });

            if (response.data) {
                toast.success('Login successful!');
                // Wait a bit for auth state to update
                setTimeout(() => {
                    router.push('/cms');
                    router.refresh();
                }, 100);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const isPending = loginMutation?.isPending || isLoading;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center">
            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center">
                        {/* Add your logo/icon here */}
                    </div>
                    <div className="flex items-center justify-center mb-8">
                        <h1 className="text-3xl text-gray-900 ml-4">
                            Admin Panel
                        </h1>
                    </div>

                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Welcome</CardTitle>
                            <CardDescription>Log in to your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="login" className="w-full">
                                <TabsContent value="login" className="space-y-4">
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="login-username">Username</Label>
                                            <Input
                                                id="login-username"
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                                                required
                                                data-testid="input-login-username"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="login-password">Password</Label>
                                            <Input
                                                id="login-password"
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                                                required
                                                data-testid="input-login-password"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={isPending}
                                            data-testid="button-login"
                                        >
                                            {isPending ? "Logging In..." : "Log In"}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}