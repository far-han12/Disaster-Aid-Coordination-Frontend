'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from 'react-hot-toast';

export default function RequesterDashboard() {
  const [myRequests, setMyRequests] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Form state for new request
  const [aidType, setAidType] = useState('');
  const [urgency, setUrgency] = useState('low');
  const [quantity, setQuantity] = useState(1);

  // State for editing a request
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editData, setEditData] = useState({
    aid_type: '',
    urgency: '',
    quantity: 1
  });

  const { token } = useAuth();

  const fetchMyRequests = () => {
    if (!token) return;
    api.getMyRequests(token)
      .then((res) => setMyRequests(res?.data || []))
      .catch(() => toast.error("Failed to load your requests."));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        () => setLocationError('Could not get your location. Please enable it to create requests.')
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
    fetchMyRequests();
  }, [token]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!userLocation) {
      toast.error(locationError || "Cannot create a request without your location.");
      return;
    }
    try {
      const requestData = {
        aid_type: aidType,
        urgency,
        quantity: Number.isFinite(quantity) ? Number(quantity) : 1,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };
      await api.createAidRequest(requestData, token);
      toast.success('Aid request submitted successfully!');
      setAidType('');
      setUrgency('low');
      setQuantity(1);
      fetchMyRequests();
    } catch (error) {
      toast.error(error?.message || 'Failed to submit request.');
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;
    try {
      const payload = {
        aid_type: editData.aid_type,
        urgency: editData.urgency || 'low',
        quantity:
          typeof editData.quantity === 'string'
            ? Number(editData.quantity || 1)
            : Number(editData.quantity || 1),
      };
      await api.updateAidRequest(selectedRequest.id, payload, token);
      toast.success("Request updated successfully!");
      setSelectedRequest(null);
      fetchMyRequests();
    } catch (error) {
      toast.error(error?.message || "Failed to update request.");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      // fixed method name
      await api.deleteAidRequestss(requestId, token);
      toast.success("Request deleted successfully!");
      fetchMyRequests();
    } catch (error) {
      toast.error(error?.message || "Failed to delete request.");
    }
  };

  const onOpenEdit = (req) => {
    setSelectedRequest(req);
    setEditData({
      aid_type: req.aid_type || '',
      urgency: req.urgency || 'low',
      quantity: typeof req.quantity === 'number' ? req.quantity : Number(req.quantity) || 1
    });
  };

  const safeSetQuantity = (val) => {
    if (val === '') {
      setEditData({ ...editData, quantity: '' });
      return;
    }
    const num = Number(val);
    setEditData({ ...editData, quantity: Number.isFinite(num) ? num : '' });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Requester Dashboard</h1>
        <p className="text-muted-foreground">Manage your aid requests and view their status.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit a New Aid Request</CardTitle>
            <CardDescription>Your current location will be used for the request.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRequest} className="grid gap-4">
              {locationError && <p className="text-sm text-red-500">{locationError}</p>}
              <div className="grid gap-2">
                <Label htmlFor="aidType">Aid Type (e.g., Clean Water, Blankets)</Label>
                <Input id="aidType" value={aidType} onChange={(e) => setAidType(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity Needed</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  min={1}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={urgency} onValueChange={(v) => setUrgency(v)}>
                  <SelectTrigger><SelectValue placeholder="Select urgency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={!userLocation}>Submit Request</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Aid Requests</CardTitle>
            <CardDescription>Here is a list of all your submitted requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.aid_type}</TableCell>
                    <TableCell>{req.quantity}</TableCell>
                    <TableCell>{req.status}</TableCell>
                    <TableCell className="capitalize">{req.urgency}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog key={req.id}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={req.status !== 'pending'}
                            onClick={() => onOpenEdit(req)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Aid Request</DialogTitle>
                            <DialogDescription>Update fields and save changes.</DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label>Aid Type</Label>
                              <Input
                                value={editData.aid_type}
                                onChange={(e) => setEditData({ ...editData, aid_type: e.target.value })}
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min={1}
                                value={editData.quantity === '' ? '' : String(editData.quantity)}
                                onChange={(e) => safeSetQuantity(e.target.value)}
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label>Urgency</Label>
                              <Select
                                value={editData.urgency || 'low'}
                                onValueChange={(value) =>
                                  setEditData({ ...editData, urgency: value })
                                }
                              >
                                <SelectTrigger><SelectValue placeholder="Select urgency" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button onClick={handleUpdateRequest} disabled={!selectedRequest}>
                                Save Changes
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={req.status !== 'pending'}>
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
      </div>
    </div>
  );
}
