'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function RequesterDashboard() {
  const [myRequests, setMyRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user } = useAuth();

  // Form state for creating new requests
  const [aidType, setAidType] = useState('');
  const [urgency, setUrgency] = useState('low');
  
  // State for editing a request
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editData, setEditData] = useState({ aid_type: '', urgency: '' });

  const fetchMyRequests = () => {
    if (token) {
      setIsLoading(true);
      api.getMyRequests(token)
        .then(res => setMyRequests(res.data || []))
        .catch(() => toast.error("Failed to load your requests."))
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [token]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const requestData = { aid_type: aidType, urgency, latitude, longitude };
          await api.createAidRequest(requestData, token);
          toast.success('Aid request submitted successfully!');
          setAidType('');
          setUrgency('low');
          fetchMyRequests(); // Refresh the list
        } catch (error) {
          toast.error(error.message || 'Failed to submit request.');
        }
      },
      () => {
        toast.error("Unable to retrieve your location. Please enable location services.");
      }
    );
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;
    try {
        await api.updateAidRequest(selectedRequest.id, editData, token);
        toast.success("Request updated successfully!");
        fetchMyRequests();
    } catch (error) {
        toast.error(error.message || "Failed to update request.");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
        await api.deleteAidRequest(requestId, token);
        toast.success("Request deleted successfully!");
        fetchMyRequests();
    } catch (error) {
        toast.error(error.message || "Failed to delete request.");
    }
  };


  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Requester Dashboard</h1>
        <p className="text-muted-foreground">Submit and manage your aid requests.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Submit an Aid Request</CardTitle>
              <CardDescription>Your current location will be used for the request.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRequest} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="aidType">Type of Aid Needed</Label>
                  <Input id="aidType" placeholder="e.g., Clean Water, Blankets" value={aidType} onChange={(e) => setAidType(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select onValueChange={setUrgency} defaultValue={urgency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Submit Request</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Requests History</CardTitle>
              <CardDescription>Here is a list of all your submitted aid requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Urgency</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan="4" className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                  ) : myRequests.length > 0 ? myRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>{req.aid_type}</TableCell>
                      <TableCell className="capitalize">{req.status}</TableCell>
                      <TableCell className="capitalize">{req.urgency}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Dialog onOpenChange={(isOpen) => { if (isOpen) { setSelectedRequest(req); setEditData({ aid_type: req.aid_type, urgency: req.urgency }); }}}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" disabled={req.status !== 'pending'}>Edit</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Edit Aid Request</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="editAidType">Type of Aid</Label>
                                        <Input id="editAidType" value={editData.aid_type} onChange={e => setEditData({...editData, aid_type: e.target.value})} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="editUrgency">Urgency</Label>
                                        <Select onValueChange={val => setEditData({...editData, urgency: val})} defaultValue={editData.urgency}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter><DialogClose asChild><Button onClick={handleUpdateRequest}>Save Changes</Button></DialogClose></DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={req.status !== 'pending'}>Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                <AlertDialogDescription>This action cannot be undone. This will permanently delete your aid request.</AlertDialogDescription>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteRequest(req.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan="4" className="text-center">You have not submitted any aid requests yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
