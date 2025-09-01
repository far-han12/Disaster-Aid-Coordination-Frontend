'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, AlertCircle, Package, Link2, X } from 'lucide-react';

// Analytics Dashboard Component
const AnalyticsDashboard = ({ token }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (token) {
            api.getPlatformStats(token)
                .then(res => setStats(res.data))
                .catch(() => toast.error("Failed to load platform stats."));
        }
    }, [token]);

    if (!stats) return <div className="text-center p-10">Loading analytics...</div>;

    const categoryChartData = stats.top_requests || [];
    const statusChartData = stats.status_breakdown || [];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total_users}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Aid Requests</CardTitle><AlertCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total_requests}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Resources</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total_resources}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Matches</CardTitle><Link2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.pending_matches}</div></CardContent></Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                        <CardDescription>Top 5 most requested aid types.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={categoryChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="aid_type" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" name="Requests" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Requests vs. Resolved Cases</CardTitle>
                        <CardDescription>Overview of request statuses.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={statusChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#82ca9d" name="Count" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [matches, setMatches] = useState([]);
  
  const [userSearch, setUserSearch] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [newRole, setNewRole] = useState('');
  const [editResourceData, setEditResourceData] = useState({ resource_type: '', quantity: 1 });
  const [editRequestData, setEditRequestData] = useState({ aid_type: '' });

  const { user: adminUser, token } = useAuth();
  const volunteers = users.filter(user => user.role === 'volunteer');
  const userRoles = ['admin', 'aidrequester', 'donor', 'volunteer'];

  const fetchData = useCallback(async () => {
    if (token) {
      try {
        const [usersRes, requestsRes, matchesRes, resourcesRes] = await Promise.all([
          api.getAllUsers(token, userSearch),
          api.getAidRequests({ urgency: urgencyFilter === 'all' ? '' : urgencyFilter, search: requestSearch }),
          api.getPendingMatches(token),
          api.adminGetAllResources(token, resourceSearch)
        ]);
        setUsers(usersRes.data || []);
        setRequests(requestsRes.data || []);
        setMatches(matchesRes.data || []);
        setResources(resourcesRes.data || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Failed to load dashboard data.");
      }
    }
  }, [token, userSearch, requestSearch, resourceSearch, urgencyFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);
  
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    try {
        await api.updateUserRole(selectedUser.id, newRole, token);
        toast.success("User role updated successfully!");
        fetchData();
    } catch (error) {
        toast.error(error.message || "Failed to update role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
        await api.deleteUser(userId, token);
        toast.success("User deleted successfully!");
        fetchData();
    } catch (error) {
        toast.error(error.message || "Failed to delete user.");
    }
  };

  const handleAssignVolunteer = async () => {
    if (!selectedRequest || !selectedVolunteer) return;
    try {
        await api.assignVolunteer({ requestId: selectedRequest.id, volunteerId: selectedVolunteer }, token);
        toast.success("Volunteer assigned successfully!");
        fetchData();
    } catch (error) {
        toast.error(error.message || "Failed to assign volunteer.");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
        await api.deleteAidRequest(requestId, token);
        toast.success("Aid request deleted successfully!");
        fetchData();
    } catch (error) {
        toast.error(error.message || "Failed to delete request.");
    }
  };

  const handleUpdateResource = async () => {
    if (!selectedResource) return;
    try {
        await api.adminUpdateResource(selectedResource.id, editResourceData, token);
        toast.success("Resource updated successfully!");
        fetchData();
    } catch (error) {
        toast.error(error.message || "Failed to update resource.");
    }
  };
  const handleDeleteResource = async (resourceId) => {
    try {
        await api.adminDeleteResource(resourceId, token);
        toast.success("Resource deleted successfully!");
        fetchData();
    } catch (error) {
        toast.error(error.message || "Failed to delete resource.");
    }
  };
  
  const handleFindMatches = async () => {
    try {
        const res = await api.findNewMatches(token);
        toast.success(res.message);
        fetchData();
    } catch (error) {
        toast.error("Failed to find new matches.");
    }
  };

  const handleConfirmAndAssign = async () => {
    if (!selectedMatch || !selectedVolunteer) {
        toast.error("Please select a volunteer.");
        return;
    }
    try {
        await api.confirmMatch(selectedMatch.match_id, selectedVolunteer, token);
        toast.success("Match confirmed and volunteer assigned!");
        fetchData();
    } catch (error) {
        toast.error(error.message || "Failed to confirm match.");
    }
  };
  
  const handleUpdateAidRequest = async () => {
    if (!selectedRequest) return;
    try {
        await api.adminUpdateAidRequest(selectedRequest.id, { aid_type: editRequestData.aid_type }, token);
        toast.success("Aid request updated successfully!");
        fetchData();
    } catch (error) {
        toast.error(error.message || "Failed to update aid request.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="analytics">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          <TabsTrigger value="matches">Potential Matches</TabsTrigger>
          <TabsTrigger value="requests">Aid Requests</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4">
            <AnalyticsDashboard token={token} />
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Potential Matches</CardTitle>
                            <CardDescription>Auto-generated matches between requests and resources.</CardDescription>
                        </div>
                        <Button onClick={handleFindMatches}>Find New Matches</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Request Type</TableHead><TableHead>Requester</TableHead><TableHead>Donor</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {matches.map(match => (
                                <TableRow key={match.match_id}>
                                    <TableCell>{match.aid_type}</TableCell>
                                    <TableCell>{match.requester_email}</TableCell>
                                    <TableCell>{match.donor_email}</TableCell>
                                    <TableCell className="text-right">
                                        <Dialog onOpenChange={(isOpen) => { if(isOpen) setSelectedMatch(match); }}>
                                            <DialogTrigger asChild><Button size="sm">Confirm & Assign</Button></DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Assign Volunteer</DialogTitle></DialogHeader>
                                                <div className="py-4">
                                                    <Label>Select a volunteer to deliver the resource.</Label>
                                                    <Select onValueChange={setSelectedVolunteer}>
                                                        <SelectTrigger><SelectValue placeholder="Select volunteer..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {volunteers.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.email}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <DialogFooter><DialogClose asChild><Button onClick={handleConfirmAndAssign}>Confirm</Button></DialogClose></DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Aid Requests Management</CardTitle>
                    <div className="flex gap-4 pt-2">
                        <div className="relative max-w-sm"><Input placeholder="Search by requester..." value={requestSearch} onChange={e => setRequestSearch(e.target.value)} /><Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setRequestSearch('')}><X className="h-4 w-4" /></Button></div>
                        <Select onValueChange={setUrgencyFilter} defaultValue="all"><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Urgencies</SelectItem><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Requester</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Urgency</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {requests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.first_name} {req.last_name} ({req.email})</TableCell>
                                    <TableCell>{req.aid_type}</TableCell>
                                    <TableCell>{req.status}</TableCell>
                                    <TableCell>{req.urgency}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Dialog onOpenChange={(isOpen) => { if(isOpen) { setSelectedRequest(req); setEditRequestData({ aid_type: req.aid_type }); }}}>
                                            <DialogTrigger asChild><Button variant="outline" size="sm">Edit</Button></DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Edit Aid Request</DialogTitle></DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <Label htmlFor="edit-aid-type">Aid Type</Label>
                                                    <Input id="edit-aid-type" value={editRequestData.aid_type} onChange={e => setEditRequestData({ aid_type: e.target.value })} />
                                                </div>
                                                <DialogFooter><DialogClose asChild><Button onClick={handleUpdateAidRequest}>Save Changes</Button></DialogClose></DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteRequest(req.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Resource Management</CardTitle>
                    <div className="relative max-w-sm mt-2"><Input placeholder="Search by donor or resource type..." value={resourceSearch} onChange={e => setResourceSearch(e.target.value)} /><Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setResourceSearch('')}><X className="h-4 w-4" /></Button></div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Contributor</TableHead><TableHead>Resource Type</TableHead><TableHead>Quantity</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {resources.map(res => (
                                <TableRow key={res.id}>
                                    <TableCell>{res.first_name} {res.last_name} ({res.email})</TableCell>
                                    <TableCell>{res.resource_type}</TableCell>
                                    <TableCell>{res.quantity}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Dialog onOpenChange={(isOpen) => { if(isOpen) { setSelectedResource(res); setEditResourceData({ resource_type: res.resource_type, quantity: res.quantity }); }}}>
                                            <DialogTrigger asChild><Button variant="outline" size="sm">Edit</Button></DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Edit Resource</DialogTitle></DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <Input value={editResourceData.resource_type} onChange={e => setEditResourceData({...editResourceData, resource_type: e.target.value})} />
                                                    <Input type="number" value={editResourceData.quantity} onChange={e => setEditResourceData({...editResourceData, quantity: e.target.value})} />
                                                </div>
                                                <DialogFooter><DialogClose asChild><Button onClick={handleUpdateResource}>Save</Button></DialogClose></DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteResource(res.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <div className="relative max-w-sm mt-2"><Input placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} /><Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setUserSearch('')}><X className="h-4 w-4" /></Button></div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Dialog onOpenChange={(isOpen) => { if(isOpen) setSelectedUser(user)}}>
                                            <DialogTrigger asChild><Button variant="outline" size="sm" disabled={user.id === adminUser?.id}>Edit Role</Button></DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Edit Role</DialogTitle></DialogHeader>
                                                <Select onValueChange={setNewRole} defaultValue={user.role}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{userRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select>
                                                <DialogFooter><Button onClick={handleUpdateRole}>Save</Button></DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={user.id === adminUser?.id}>Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
