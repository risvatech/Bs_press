"use client";

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Loader2, Database, User, Settings, Shield, Server } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../service/api';

const STEPS = [
    {
        id: 'welcome',
        title: 'Welcome',
        description: 'Begin installation',
        icon: Shield,
    },
    {
        id: 'basic',
        title: 'Application',
        description: 'App configuration',
        icon: Settings,
    },
    {
        id: 'admin',
        title: 'Admin',
        description: 'Create admin account',
        icon: User,
    },
    {
        id: 'database',
        title: 'Database',
        description: 'Database setup',
        icon: Database,
    },
    {
        id: 'complete',
        title: 'Complete',
        description: 'Installation finished',
        icon: CheckCircle,
    },
];

export default function Installer() {
    const [currentStep, setCurrentStep] = useState(0);
    const [stepData, setStepData] = useState({
        basic: {
            appName: 'future_indias',
            companyName: 'My Company',
            timezone: 'Asia/Kolkata',
        },
        admin: {
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            confirmPassword: 'admin123',
        },
        database: {
            host: 'localhost',
            port: '5432',
            db: 'future_indias',
            user: 'postgres',
            password: 'risva',
        },
    });
    const [validationStatus, setValidationStatus] = useState({});

    const testDatabaseConnection = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/testDatabaseDetails', {
                host: data.host,
                port: data.port,
                db: data.db,
                user: data.user,
                password: data.password,
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                setValidationStatus((prev) => ({ ...prev, database: true }));
                toast.success('Database connection successful');
            } else {
                setValidationStatus((prev) => ({ ...prev, database: false }));
                toast.error(data.error || 'Database connection failed');
            }
        },
        onError: () => {
            setValidationStatus((prev) => ({ ...prev, database: false }));
            toast.error('Database connection error');
        },
    });

    const completeInstallation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/install', {
                host: data.database.host,
                port: data.database.port,
                database: data.database.db,
                user: data.database.user,
                password: data.database.password,
                app: {
                    name: data.basic.appName,
                    company_name: data.basic.companyName,
                    timezone: data.basic.timezone,
                },
                admin: {
                    username: data.admin.username,
                    email: data.admin.email,
                    password: data.admin.password,
                },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                toast.success('Installation completed');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                toast.error(data.error || 'Installation failed');
            }
        },
        onError: () => {
            toast.error('Installation error occurred');
        },
    });

    const handleStepDataChange = (step, field, value) => {
        setStepData((prev) => ({
            ...prev,
            [step]: { ...prev[step], [field]: value },
        }));
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return true;
            case 1:
                return stepData.basic.appName.trim().length > 0;
            case 2:
                return (
                    stepData.admin.username &&
                    stepData.admin.email &&
                    stepData.admin.password &&
                    stepData.admin.password === stepData.admin.confirmPassword &&
                    stepData.admin.password.length >= 6
                );
            case 3:
                return validationStatus.database === true;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (!validateCurrentStep()) return;

        if (currentStep === 3) {
            completeInstallation.mutate(stepData);
            setCurrentStep(4);
            return;
        }

        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                            <Server className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Application Installer</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Welcome to the setup wizard
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p className="text-sm text-gray-700">
                                This installer will guide you through the initial setup of your application.
                                Please follow each step carefully.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                    <span className="text-sm font-medium text-blue-600">1</span>
                                </div>
                                <span className="text-sm text-gray-700">Application Settings</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                    <span className="text-sm font-medium text-blue-600">2</span>
                                </div>
                                <span className="text-sm text-gray-700">Admin Account Setup</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                    <span className="text-sm font-medium text-blue-600">3</span>
                                </div>
                                <span className="text-sm text-gray-700">Database Configuration</span>
                            </div>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-5">
                        <div>
                            <Label htmlFor="appName" className="mb-2 block text-sm font-medium">
                                Application Name
                            </Label>
                            <Input
                                id="appName"
                                value={stepData.basic.appName}
                                onChange={(e) => handleStepDataChange('basic', 'appName', e.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="companyName" className="mb-2 block text-sm font-medium">
                                Company/Organization Name
                            </Label>
                            <Input
                                id="companyName"
                                value={stepData.basic.companyName}
                                onChange={(e) => handleStepDataChange('basic', 'companyName', e.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="timezone" className="mb-2 block text-sm font-medium">
                                Timezone
                            </Label>
                            <select
                                id="timezone"
                                value={stepData.basic.timezone}
                                onChange={(e) => handleStepDataChange('basic', 'timezone', e.target.value)}
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                            >
                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">America/New_York (EST)</option>
                                <option value="Europe/London">Europe/London (GMT)</option>
                            </select>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-5">
                        <div>
                            <Label htmlFor="username" className="mb-2 block text-sm font-medium">
                                Admin Username
                            </Label>
                            <Input
                                id="username"
                                value={stepData.admin.username}
                                onChange={(e) => handleStepDataChange('admin', 'username', e.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="mb-2 block text-sm font-medium">
                                Admin Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={stepData.admin.email}
                                onChange={(e) => handleStepDataChange('admin', 'email', e.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="password" className="mb-2 block text-sm font-medium">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={stepData.admin.password}
                                    onChange={(e) => handleStepDataChange('admin', 'password', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={stepData.admin.confirmPassword}
                                    onChange={(e) =>
                                        handleStepDataChange('admin', 'confirmPassword', e.target.value)
                                    }
                                    className="h-10"
                                />
                            </div>
                        </div>
                        {stepData.admin.password && stepData.admin.confirmPassword && (
                            <div className="space-y-1.5 text-sm">
                                <div className={`flex items-center space-x-2 ${stepData.admin.password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${stepData.admin.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <span>Minimum 6 characters</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${stepData.admin.password === stepData.admin.confirmPassword ? 'text-green-600' : 'text-gray-500'}`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${stepData.admin.password === stepData.admin.confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <span>Passwords must match</span>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="host" className="mb-2 block text-sm font-medium">
                                    Host
                                </Label>
                                <Input
                                    id="host"
                                    value={stepData.database.host}
                                    onChange={(e) => handleStepDataChange('database', 'host', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div>
                                <Label htmlFor="port" className="mb-2 block text-sm font-medium">
                                    Port
                                </Label>
                                <Input
                                    id="port"
                                    value={stepData.database.port}
                                    onChange={(e) => handleStepDataChange('database', 'port', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="database" className="mb-2 block text-sm font-medium">
                                Database Name
                            </Label>
                            <Input
                                id="database"
                                value={stepData.database.db}
                                onChange={(e) => handleStepDataChange('database', 'db', e.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="user" className="mb-2 block text-sm font-medium">
                                    Username
                                </Label>
                                <Input
                                    id="user"
                                    value={stepData.database.user}
                                    onChange={(e) => handleStepDataChange('database', 'user', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dbPassword" className="mb-2 block text-sm font-medium">
                                    Password
                                </Label>
                                <Input
                                    id="dbPassword"
                                    type="password"
                                    value={stepData.database.password}
                                    onChange={(e) => handleStepDataChange('database', 'password', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={() => testDatabaseConnection.mutate(stepData.database)}
                            disabled={
                                !stepData.database.host ||
                                !stepData.database.port ||
                                !stepData.database.db ||
                                !stepData.database.user ||
                                testDatabaseConnection.isPending
                            }
                            variant="outline"
                            className="h-10 w-full mt-2 mb-2"
                        >
                            {testDatabaseConnection.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                'Test Connection'
                            )}
                        </Button>
                        {validationStatus.database === true && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700">
                                    Connection successful
                                </AlertDescription>
                            </Alert>
                        )}
                        {validationStatus.database === false && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Connection failed. Check your credentials.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 text-center">
                        {completeInstallation.isPending ? (
                            <>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Installing...</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Please wait while we set up your application
                                    </p>
                                </div>
                                <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500"></div>
                                </div>
                            </>
                        ) : completeInstallation.isSuccess ? (
                            <>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
                                    <CheckCircle className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Installation Complete</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Your application has been successfully installed
                                    </p>
                                </div>
                                <Alert className="border-green-200 bg-green-50">
                                    <AlertDescription className="text-green-700">
                                        Redirecting to login page...
                                    </AlertDescription>
                                </Alert>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                    <AlertCircle className="h-8 w-8 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Installation Failed</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Please check your configuration and try again
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setCurrentStep(0)}
                                    variant="outline"
                                    className="h-10"
                                >
                                    Start Over
                                </Button>
                            </>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    const CurrentIcon = STEPS[currentStep].icon;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-md">
                <Card className="border-gray-200 shadow-lg">
                    <CardHeader className="border-b border-gray-200 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                    <CurrentIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold">
                                        Application Setup
                                    </CardTitle>
                                    <p className="text-xs text-gray-500">
                                        Step {currentStep + 1} of {STEPS.length}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
                            </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="mb-1 flex justify-between text-xs">
                                <span className="font-medium text-gray-700">{STEPS[currentStep].title}</span>
                                <span className="text-gray-500">{STEPS[currentStep].description}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Step Dots */}
                        <div className="mt-4 flex justify-center space-x-2">
                            {STEPS.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 w-2 rounded-full ${
                                        index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <div className="min-h-[280px]">
                            {renderStepContent()}
                        </div>
                    </CardContent>

                    <div className="border-t border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrevious}
                                disabled={currentStep === 0 || completeInstallation.isPending}
                                className="h-9 px-4"
                            >
                                <ArrowLeft className="mr-2 h-3 w-3" />
                                Back
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={!validateCurrentStep() || completeInstallation.isPending}
                                className="h-9 px-6"
                            >
                                {currentStep === STEPS.length - 1 ? (
                                    completeInstallation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            Installing...
                                        </>
                                    ) : (
                                        'Finish'
                                    )
                                ) : (
                                    'Continue'
                                )}
                                {currentStep < STEPS.length - 1 && !completeInstallation.isPending && (
                                    <ArrowRight className="ml-2 h-3 w-3" />
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}