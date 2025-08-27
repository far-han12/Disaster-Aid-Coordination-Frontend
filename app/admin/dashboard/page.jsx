'use client';
import { useEffect, useState } from 'react';
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

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const { user: adminUser, token } = useAuth();

  const volunteers = users.filter(user => user.role === 'volunteer');
  const userRoles = ['admin', 'aid_requester', 'donor', 'volunteer'];

  // --- REFACTORED DATA FETCHING ---

  // Effect for initial data load
  useEffect(() => {
    const fetchInitialData = async () => {
      if (token) {
        try {
          const [usersRes, requestsRes, summaryRes] = await Promise.all([
            api.getAllUsers(token),
            api.getAidRequests(),
            api.getAidTypeSummary(token)
          ]);
          setUsers(usersRes.data || []);
          setRequests(requestsRes.data || []);
          setSummary(summaryRes.data || []);
        } catch (error) {
          console.error("Failed to fetch initial data:", error);
          toast.error("Failed to load dashboard data.");
        }
      }
    };
    fetchInitialData();
  }, [token]); // This effect runs once when the token is available

  // Debounce effect for searching users
  useEffect(() => {
    const fetchUsers = async () => {
        if (token) {
            try {
                const usersRes = await api.getAllUsers(token, searchTerm);
                setUsers(usersRes.data || []);
            } catch (error) {
                console.error("Failed to search users:", error);
                toast.error("Failed to search for users.");
            }
        }
    };

    const delayDebounceFn = setTimeout(() => {
      // We only fetch users here, not all data, to make search fast
      if (searchTerm) {
        fetchUsers();
      } else {
        // If search is cleared, fetch all initial data again
        const fetchInitialData = async () => {
          if (token) {
            try {
              const [usersRes] = await Promise.all([
                api.getAllUsers(token),
              ]);
              setUsers(usersRes.data || []);
            } catch (error) {
              console.error("Failed to fetch initial data:", error);
            }
          }
        };
        fetchInitialData();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, token]);

  const refreshData = async () => {
    if (token) {
        try {
            const usersRes = await api.getAllUsers(token, searchTerm);
            const requestsRes = await api.getAidRequests();
            setUsers(usersRes.data || []);
            setRequests(requestsRes.data || []);
        } catch (error) {
            toast.error("Failed to refresh data.");
        }
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await api.deleteUser(userId, token);
      toast.success('User deleted successfully!');
      refreshData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete user.');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      await api.deleteAidRequest(requestId, token);
      toast.success('Aid request deleted successfully!');
      refreshData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete request.');
    }
  };
  
  const handleAssignVolunteer = async () => {
    if (!selectedRequest || !selectedVolunteer) {
        toast.error("Please select a volunteer.");
        return;
    }
    try {
        const assignmentData = { requestId: selectedRequest.id, volunteerId: selectedVolunteer };
        await api.assignVolunteer(assignmentData, token);
        toast.success(`Volunteer assigned to request #${selectedRequest.id}`);
        refreshData();
    } catch (error) {
        toast.error(error.message || "Failed to assign volunteer.");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) {
        toast.error("Please select a new role.");
        return;
    }
    try {
        await api.updateUserRole(selectedUser.id, newRole, token);
        toast.success(`Role for ${selectedUser.email} updated successfully!`);
        refreshData();
    } catch (error) {
        toast.error(error.message || "Failed to update role.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="requests">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">Aid Requests</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Aid Requests Management</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>{req.aid_type}</TableCell>
                      <TableCell>{req.status}</TableCell>
                      <TableCell>{req.urgency}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Dialog onOpenChange={(isOpen) => { if(isOpen) setSelectedRequest(req); }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Assign</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Volunteer to Request #{selectedRequest?.id}</DialogTitle>
                              <DialogDescription>{selectedRequest?.aid_type}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Label htmlFor="volunteer-select">Select Volunteer</Label>
                                <Select onValueChange={setSelectedVolunteer}>
                                    <SelectTrigger id="volunteer-select"><SelectValue placeholder="Select a volunteer..." /></SelectTrigger>
                                    <SelectContent>
                                        {volunteers.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.email}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" onClick={handleAssignVolunteer}>Confirm Assignment</Button>
                                </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete</Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription>This will permanently delete the aid request. This action cannot be undone.</AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRequest(req.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                <div className="relative pt-2 max-w-sm">
                    <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-2 top-2 h-7 w-7"
                            onClick={() => setSearchTerm('')}
                        >
                            X
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.first_name} {user.last_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="uppercase">{user.role.replace('_', ' ')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Dialog onOpenChange={(isOpen) => { if(isOpen) { setSelectedUser(user); setNewRole(user.role); } }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={user.id === adminUser?.id}>Edit Role</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Role for {selectedUser?.email}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Label htmlFor="role-select">New Role</Label>
                                <Select onValueChange={setNewRole} defaultValue={selectedUser?.role}>
                                    <SelectTrigger id="role-select"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {userRoles.map(role => (
                                            <SelectItem key={role} value={role}>
                                                {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" onClick={handleUpdateRole}>Save Changes</Button>
                                </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={user.id === adminUser?.id}>Delete</Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription>This will permanently delete the user and all their associated data.</AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete User</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Aid Request Summary</CardTitle>
                    <CardDescription>Counts of each requested aid type.</CardDescription>
                </CardHeader>
                <CardContent>
                    {summary.length > 0 ? (
                        <ul className="space-y-2">
                            {summary.map(item => (
                            <li key={item.aid_type} className="flex justify-between">
                                <span className="font-medium">{item.aid_type}</span>
                                <span className="text-gray-600">{item.request_count} requests</span>
                            </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No analytics data available.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
