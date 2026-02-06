'use client';

import React, { useEffect, useState, useCallback } from "react";
import {
    Trash2,
    RefreshCw,
    Mail,
    User,
    Phone,
    Calendar,
    MessageSquare,
    Search,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    CheckCircle,
    Clock,
    Archive,
    AlertCircle,
    Download,
    FileText,
} from "lucide-react";
import api from "../../service/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    Card,
    CardContent,
} from "../../components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "../../hooks/use-toast";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    status: "unread" | "read" | "replied" | "archived" | "spam";
    createdAt: string;
    updatedAt: string;
}

interface Stats {
    total: number;
    unread: number;
    read: number;
    replied: number;
    archived: number;
    spam: number;
}

const statusColors: Record<string, string> = {
    unread: "bg-blue-100 text-blue-800",
    read: "bg-gray-100 text-gray-800",
    replied: "bg-green-100 text-green-800",
    archived: "bg-purple-100 text-purple-800",
    spam: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, React.ReactNode> = {
    unread: <Clock className="w-3 h-3" />,
    read: <Eye className="w-3 h-3" />,
    replied: <CheckCircle className="w-3 h-3" />,
    archived: <Archive className="w-3 h-3" />,
    spam: <AlertCircle className="w-3 h-3" />,
};

const AdminContact = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        unread: 0,
        read: 0,
        replied: 0,
        archived: 0,
        spam: 0,
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    const { toast } = useToast();

    // ✅ Fetch all contact messages
    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/contact");

            // Handle different response structures
            let data: ContactMessage[] = [];

            if (res && typeof res === 'object') {
                if (Array.isArray(res)) {
                    data = res;
                } else if (Array.isArray(res.data)) {
                    data = res.data;
                } else if (res.data && Array.isArray(res.data.data)) {
                    data = res.data.data;
                } else if (res.data && typeof res.data === 'object') {
                    if (res.data.data && Array.isArray(res.data.data)) {
                        data = res.data.data;
                    }
                }
            }

            // Ensure data is an array
            if (!Array.isArray(data)) {
                console.warn("API response is not an array:", res);
                data = [];
            }

            setMessages(data);
            calculateStats(data);

        } catch (err) {
            console.error("Error fetching contact messages:", err);
            toast({
                title: "Error",
                description: "Failed to load contact messages",
                variant: "destructive",
            });
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Calculate statistics
    const calculateStats = (data: ContactMessage[]) => {
        const stats: Stats = {
            total: data?.length || 0,
            unread: data?.filter(item => item.status === "unread").length || 0,
            read: data?.filter(item => item.status === "read").length || 0,
            replied: data?.filter(item => item.status === "replied").length || 0,
            archived: data?.filter(item => item.status === "archived").length || 0,
            spam: data?.filter(item => item.status === "spam").length || 0,
        };
        setStats(stats);
    };

    // Apply filters
    useEffect(() => {
        const safeMessages = Array.isArray(messages) ? messages : [];

        let filtered = [...safeMessages];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                item =>
                    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        setFilteredMessages(filtered);
        setCurrentPage(1);
    }, [messages, searchTerm, statusFilter]);

    // Pagination
    const totalPages = Math.ceil((filteredMessages?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredMessages?.slice(startIndex, endIndex) || [];

    // ✅ Delete message by ID
    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this message?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/contact/${id}`);

            toast({
                title: "Success",
                description: "Message deleted successfully",
            });

            fetchMessages();
        } catch (err) {
            console.error("Error deleting message:", err);
            toast({
                title: "Error",
                description: "Failed to delete message",
                variant: "destructive",
            });
        }
    };

    // Update message status
    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/contact/${id}/status`, { status });

            toast({
                title: "Success",
                description: "Status updated successfully",
            });

            fetchMessages();
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive",
            });
        }
    };

    // View message details
    const viewMessage = (message: ContactMessage) => {
        setSelectedMessage(message);
        setViewModalOpen(true);
    };

    // Export data
    const exportData = () => {
        const dataToExport = Array.isArray(filteredMessages) ? filteredMessages : [];

        if (dataToExport.length === 0) {
            toast({
                title: "No Data",
                description: "There is no data to export",
                variant: "destructive",
            });
            return;
        }

        const csvData = dataToExport.map(item => ({
            ID: item.id,
            Name: item.name || "",
            Email: item.email || "",
            Phone: item.phone || "",
            Message: item.message || "",
            Status: item.status || "",
            "Created At": item.createdAt ? format(new Date(item.createdAt), "yyyy-MM-dd HH:mm") : "",
        }));

        const csvContent = [
            Object.keys(csvData[0]).join(","),
            ...csvData.map(row => Object.values(row).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contact-messages-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();

        toast({
            title: "Exported",
            description: `Exported ${dataToExport.length} records`,
        });
    };

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Format date
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy HH:mm");
        } catch (error) {
            return "Invalid date";
        }
    };

    // Get safe value
    const getSafeValue = (value: any, defaultValue: string = "") => {
        return value || defaultValue;
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Contact Messages</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage and respond to contact form submissions
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={exportData}
                        className="flex items-center gap-2"
                        disabled={filteredMessages.length === 0}
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={fetchMessages}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total</p>
                                <p className="text-2xl font-semibold mt-1">{stats.total}</p>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Unread</p>
                                <p className="text-2xl font-semibold mt-1">{stats.unread}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Read</p>
                                <p className="text-2xl font-semibold mt-1">{stats.read}</p>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Eye className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Replied</p>
                                <p className="text-2xl font-semibold mt-1">{stats.replied}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Archived</p>
                                <p className="text-2xl font-semibold mt-1">{stats.archived}</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Archive className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Spam</p>
                                <p className="text-2xl font-semibold mt-1">{stats.spam}</p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name, email, or message..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="unread">Unread</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="replied">Replied</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                    <SelectItem value="spam">Spam</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">ID</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : currentItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            {messages.length === 0 ? "No messages found" : "No matching messages"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentItems.map((message) => (
                                        <TableRow key={message.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">#{message.id}</TableCell>

                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium flex items-center gap-2">
                                                        <User className="w-3 h-3" />
                                                        {getSafeValue(message.name, "N/A")}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                                        <Mail className="w-3 h-3" />
                                                        {getSafeValue(message.email, "N/A")}
                                                    </div>
                                                    {message.phone && (
                                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                                            <Phone className="w-3 h-3" />
                                                            {getSafeValue(message.phone)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {getSafeValue(message.message, "No message")}
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        className={`${statusColors[message.status] || "bg-gray-100 text-gray-800"} flex items-center gap-1`}
                                                    >
                                                        {statusIcons[message.status] || <Clock className="w-3 h-3" />}
                                                        {message.status ?
                                                            message.status.charAt(0).toUpperCase() + message.status.slice(1)
                                                            : "Unknown"
                                                        }
                                                    </Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(message.createdAt)}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => viewMessage(message)}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => updateStatus(message.id, "read")}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Mark as Read
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => updateStatus(message.id, "replied")}>
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Mark as Replied
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => updateStatus(message.id, "archived")}>
                                                            <Archive className="w-4 h-4 mr-2" />
                                                            Archive
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(message.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredMessages.length)} of{" "}
                        {filteredMessages.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewModalOpen && selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">
                                    Message #{selectedMessage.id}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Contact Info */}
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Contact Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{getSafeValue(selectedMessage.name)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">{getSafeValue(selectedMessage.email)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {selectedMessage.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm">{getSafeValue(selectedMessage.phone)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Message</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm whitespace-pre-wrap">{getSafeValue(selectedMessage.message, "No message provided")}</p>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="pt-4 border-t">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Status</p>
                                            <Badge className={`${statusColors[selectedMessage.status] || "bg-gray-100 text-gray-800"} mt-1`}>
                                                {selectedMessage.status ?
                                                    selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)
                                                    : "Unknown"
                                                }
                                            </Badge>
                                        </div>

                                        <div>
                                            <p className="text-gray-500">Submitted</p>
                                            <p className="font-medium">{formatDate(selectedMessage.createdAt)}</p>
                                        </div>

                                        {selectedMessage.updatedAt && (
                                            <div>
                                                <p className="text-gray-500">Last Updated</p>
                                                <p className="font-medium">{formatDate(selectedMessage.updatedAt)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setViewModalOpen(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (selectedMessage.email) {
                                            window.location.href = `mailto:${selectedMessage.email}`;
                                        }
                                    }}
                                    disabled={!selectedMessage.email}
                                    className="flex items-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    Reply via Email
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContact;