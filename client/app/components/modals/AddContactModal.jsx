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
import { Textarea } from "../ui/textarea";
import { X } from "lucide-react";

export default function AddContactModal({ isOpen, onClose, companies = [] }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        jobTitle: "",
        contactType: "lead",
        companyId: "",
        notes: "",
    });

    const router = useRouter();

    const createMutation = useMutation({
        mutationFn: async (contactData) => {
            const response = await apiRequest("POST", "/api/contacts", contactData);
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
            toast.success("Contact added successfully");
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
            toast.error("Failed to add contact");
        },
    });

    const handleClose = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            jobTitle: "",
            contactType: "lead",
            companyId: "",
            notes: "",
        });
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.email.trim()
        ) {
            toast.error("First name, last name, and email are required");
            return;
        }

        const submitData = {
            ...formData,
            companyId: formData.companyId || null,
        };

        createMutation.mutate(submitData);
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                placeholder="Enter first name"
                                data-testid="input-first-name"
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
                                data-testid="input-last-name"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="Enter email address"
                                data-testid="input-email"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder="Enter phone number"
                                data-testid="input-phone"
                            />
                        </div>

                        <div>
                            <Label htmlFor="company">Company</Label>
                            <Select
                                value={formData.companyId}
                                onValueChange={(value) => handleInputChange("companyId", value)}
                            >
                                <SelectTrigger data-testid="select-company">
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No company</SelectItem>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="contactType">Contact Type</Label>
                            <Select
                                value={formData.contactType}
                                onValueChange={(value) =>
                                    handleInputChange("contactType", value)
                                }
                            >
                                <SelectTrigger data-testid="select-contact-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="partner">Partner</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                type="text"
                                value={formData.jobTitle}
                                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                                placeholder="Enter job title"
                                data-testid="input-job-title"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                placeholder="Add any additional notes..."
                                data-testid="textarea-notes"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            data-testid="button-cancel"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            data-testid="button-save-contact"
                        >
                            {createMutation.isPending ? "Adding..." : "Add Contact"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}