"use client";

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    Clock,
    XCircle,
    Send,
    FileText,
    User,
    Building,
    Phone,
    Calendar,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Plus
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from '../../hooks/use-toast';
import { format } from 'date-fns';
import Layout from "@/app/components/sub_pages/Layout";
import api from "../../service/api"; // Import the API service

interface Quote {
    id: number;
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    projectType: string;
    productType?: string;
    quantity?: string;
    deliveryDate?: string;
    budget: string;
    additionalRequirements?: string;
    status: 'pending' | 'contacted' | 'quoted' | 'closed';
    quoteReference?: string;
    source: string;
    createdAt: string;
    updatedAt: string;
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-800', icon: Send },
    quoted: { label: 'Quoted', color: 'bg-purple-100 text-purple-800', icon: FileText },
    closed: { label: 'Closed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

export default function AdminQuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [projectTypeFilter, setProjectTypeFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: '',
        end: '',
    });
    console.log(quotes)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [editForm, setEditForm] = useState<Partial<Quote>>({});

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        contacted: 0,
        quoted: 0,
        closed: 0,
    });

    // Fetch quotes
    const fetchQuotes = async () => {
        try {
            setLoading(true);
            // Using API service instead of direct fetch
            const response = await api.get('/quotes');

            if (response.data.success) {
                setQuotes(response.data.data || []);
                setFilteredQuotes(response.data.data || []);
                calculateStats(response.data.data || []);
                setTotalPages(Math.ceil((response.data.data?.length || 0) / itemsPerPage));
            }
        } catch (error: any) {
            console.error('Error fetching quotes:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to load quotes',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await api.get('/quotes/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error: any) {
            console.error('Error fetching stats:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to load statistics',
                variant: 'destructive',
            });
        }
    };

    const calculateStats = (quotesList: Quote[]) => {
        const stats = {
            total: quotesList.length,
            pending: quotesList.filter(q => q.status === 'pending').length,
            contacted: quotesList.filter(q => q.status === 'contacted').length,
            quoted: quotesList.filter(q => q.status === 'quoted').length,
            closed: quotesList.filter(q => q.status === 'closed').length,
        };
        setStats(stats);
    };

    useEffect(() => {
        fetchQuotes();
        fetchStats();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...quotes];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                quote =>
                    quote.name.toLowerCase().includes(term) ||
                    quote.company.toLowerCase().includes(term) ||
                    quote.email.toLowerCase().includes(term) ||
                    quote.phone.includes(term) ||
                    (quote.quoteReference && quote.quoteReference.toLowerCase().includes(term))
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(quote => quote.status === statusFilter);
        }

        // Project type filter
        if (projectTypeFilter !== 'all') {
            filtered = filtered.filter(quote => quote.projectType === projectTypeFilter);
        }

        // Date range filter
        if (dateRange.start && dateRange.end) {
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);

            filtered = filtered.filter(quote => {
                const quoteDate = new Date(quote.createdAt);
                return quoteDate >= start && quoteDate <= end;
            });
        }

        setFilteredQuotes(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1);
    }, [quotes, searchTerm, statusFilter, projectTypeFilter, dateRange]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredQuotes.slice(indexOfFirstItem, indexOfLastItem);

    // Action handlers
    const handleViewQuote = (quote: Quote) => {
        setSelectedQuote(quote);
        setViewModalOpen(true);
    };

    const handleEditQuote = (quote: Quote) => {
        setSelectedQuote(quote);
        setEditForm({ ...quote });
        setEditModalOpen(true);
    };

    const handleUpdateQuote = async () => {
        if (!selectedQuote) return;

        try {
            const response = await api.put(`/quotes/${selectedQuote.id}`, editForm);

            if (response.data.success) {
                const updatedQuote = response.data.data;
                setQuotes(prev =>
                    prev.map(q => (q.id === selectedQuote.id ? updatedQuote : q))
                );
                setEditModalOpen(false);
                toast({
                    title: 'Success',
                    description: 'Quote updated successfully',
                });
            }
        } catch (error: any) {
            console.error('Error updating quote:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to update quote',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteQuote = async () => {
        if (!selectedQuote) return;

        try {
            const response = await api.delete(`/quotes/${selectedQuote.id}`);

            if (response.data.success) {
                setQuotes(prev => prev.filter(q => q.id !== selectedQuote.id));
                setDeleteModalOpen(false);
                toast({
                    title: 'Success',
                    description: 'Quote deleted successfully',
                });
            }
        } catch (error: any) {
            console.error('Error deleting quote:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to delete quote',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateStatus = async (quoteId: number, newStatus: Quote['status']) => {
        try {
            const response = await api.patch(`/quotes/${quoteId}/status`, { status: newStatus });

            if (response.data.success) {
                const updatedQuote = response.data.data;
                setQuotes(prev =>
                    prev.map(q => (q.id === quoteId ? updatedQuote : q))
                );
                toast({
                    title: 'Success',
                    description: `Status updated to ${newStatus}`,
                });
            }
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to update status',
                variant: 'destructive',
            });
        }
    };

    const exportToCSV = () => {
        const headers = [
            'ID',
            'Name',
            'Company',
            'Email',
            'Phone',
            'Country',
            'State',
            'City',
            'Project Type',
            'Product Type',
            'Quantity',
            'Delivery Date',
            'Budget',
            'Status',
            'Quote Reference',
            'Source',
            'Created At',
        ];

        const csvContent = [
            headers.join(','),
            ...filteredQuotes.map(quote => [
                quote.id,
                `"${quote.name}"`,
                `"${quote.company}"`,
                `"${quote.email}"`,
                `"${quote.phone}"`,
                `"${quote.country}"`,
                `"${quote.state}"`,
                `"${quote.city}"`,
                `"${quote.projectType}"`,
                `"${quote.productType || ''}"`,
                `"${quote.quantity || ''}"`,
                `"${quote.deliveryDate || ''}"`,
                `"${quote.budget}"`,
                `"${quote.status}"`,
                `"${quote.quoteReference || ''}"`,
                `"${quote.source}"`,
                `"${format(new Date(quote.createdAt), 'yyyy-MM-dd HH:mm:ss')}"`,
            ].join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quotes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Project type options (extracted from quotes)
    const projectTypes = Array.from(new Set(quotes.map(q => q.projectType))).filter(Boolean);

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Quote Management</h1>
                        <p className="text-muted-foreground">Manage and track all quote requests</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={exportToCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button onClick={fetchQuotes} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Contacted</p>
                                    <p className="text-2xl font-bold">{stats.contacted}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Send className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Quoted</p>
                                    <p className="text-2xl font-bold">{stats.quoted}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Closed</p>
                                    <p className="text-2xl font-bold">{stats.closed}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search quotes..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="quoted">Quoted</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Project Type Filter */}
                            <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by project type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Project Types</SelectItem>
                                    {projectTypes.map(type => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Date Range */}
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    placeholder="Start Date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                />
                                <Input
                                    type="date"
                                    placeholder="End Date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quotes Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quotes ({filteredQuotes.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredQuotes.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold">No quotes found</h3>
                                <p className="text-muted-foreground">
                                    {searchTerm || statusFilter !== 'all' || projectTypeFilter !== 'all' || dateRange.start
                                        ? 'Try changing your filters'
                                        : 'No quotes have been submitted yet'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Project</TableHead>
                                                <TableHead>Budget</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentItems.map((quote) => (
                                                <TableRow key={quote.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <FileText className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">#{quote.id}</div>
                                                                {quote.quoteReference && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {quote.quoteReference}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{quote.name}</div>
                                                            <div className="text-sm text-muted-foreground">{quote.company}</div>
                                                            <div className="text-xs text-muted-foreground">{quote.email}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{quote.projectType}</div>
                                                        {quote.productType && (
                                                            <div className="text-sm text-muted-foreground">{quote.productType}</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{quote.budget}</span>
                                                        </div>
                                                        {quote.quantity && (
                                                            <div className="text-sm text-muted-foreground">Qty: {quote.quantity}</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={statusConfig[quote.status].color}>
                                                            {statusConfig[quote.status].label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {format(new Date(quote.createdAt), 'MMM d, yyyy')}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {format(new Date(quote.createdAt), 'hh:mm a')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => handleViewQuote(quote)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                                {Object.entries(statusConfig).map(([status, config]) => (
                                                                    <DropdownMenuItem
                                                                        key={status}
                                                                        onClick={() => handleUpdateStatus(quote.id, status as Quote['status'])}
                                                                        disabled={quote.status === status}
                                                                    >
                                                                        <config.icon className="h-4 w-4 mr-2" />
                                                                        Mark as {config.label}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => {
                                                                        setSelectedQuote(quote);
                                                                        setDeleteModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete Quote
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-2 py-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {indexOfFirstItem + 1} to{' '}
                                            {Math.min(indexOfLastItem, filteredQuotes.length)} of{' '}
                                            {filteredQuotes.length} quotes
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm font-medium">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* View Quote Modal */}
                <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        {selectedQuote && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Quote Details</DialogTitle>
                                    <DialogDescription>
                                        Quote #{selectedQuote.id} - {selectedQuote.quoteReference}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{selectedQuote.name}</h3>
                                            <p className="text-muted-foreground">{selectedQuote.company}</p>
                                        </div>
                                        <Badge className={statusConfig[selectedQuote.status].color}>
                                            {statusConfig[selectedQuote.status].label}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Contact Info */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    Contact Information
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                                    <p>{selectedQuote.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                                    <p>{selectedQuote.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                                                    <p>{selectedQuote.city}, {selectedQuote.state}, {selectedQuote.country}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Project Details */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    Project Details
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Project Type</p>
                                                    <p>{selectedQuote.projectType}</p>
                                                </div>
                                                {selectedQuote.productType && (
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Product Type</p>
                                                        <p>{selectedQuote.productType}</p>
                                                    </div>
                                                )}
                                                {selectedQuote.quantity && (
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                                                        <p>{selectedQuote.quantity}</p>
                                                    </div>
                                                )}
                                                {selectedQuote.deliveryDate && (
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Delivery Date</p>
                                                        <p>{selectedQuote.deliveryDate}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Budget</p>
                                                    <p className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        {selectedQuote.budget}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Additional Requirements */}
                                        {selectedQuote.additionalRequirements && (
                                            <div className="md:col-span-2">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Additional Requirements</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="whitespace-pre-line">{selectedQuote.additionalRequirements}</p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}

                                        {/* Timeline */}
                                        <div className="md:col-span-2">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Calendar className="h-5 w-5" />
                                                        Timeline
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm font-medium">Created</span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {format(new Date(selectedQuote.createdAt), 'PPP pp')}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm font-medium">Last Updated</span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {format(new Date(selectedQuote.updatedAt), 'PPP pp')}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm font-medium">Source</span>
                                                            <Badge variant="outline">{selectedQuote.source}</Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                                        Close
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Quote Modal */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Quote</DialogTitle>
                            <DialogDescription>
                                Update quote details for #{selectedQuote?.id}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedQuote && editForm && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <Input
                                            value={editForm.name || ''}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Company</label>
                                        <Input
                                            value={editForm.company || ''}
                                            onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <Input
                                            value={editForm.email || ''}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Phone</label>
                                        <Input
                                            value={editForm.phone || ''}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <Select
                                            value={editForm.status}
                                            onValueChange={(value) => setEditForm({ ...editForm, status: value as Quote['status'] })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="contacted">Contacted</SelectItem>
                                                <SelectItem value="quoted">Quoted</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Budget</label>
                                        <Input
                                            value={editForm.budget || ''}
                                            onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Project Type</label>
                                    <Input
                                        value={editForm.projectType || ''}
                                        onChange={(e) => setEditForm({ ...editForm, projectType: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Additional Requirements</label>
                                    <Textarea
                                        value={editForm.additionalRequirements || ''}
                                        onChange={(e) => setEditForm({ ...editForm, additionalRequirements: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateQuote}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the quote
                                from #{selectedQuote?.id} by {selectedQuote?.name}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteQuote}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    );
}