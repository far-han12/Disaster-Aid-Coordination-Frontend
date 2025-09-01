'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues
const RequestsMap = dynamic(() => import('@/components/RequestsMap'), { 
    ssr: false 
});

export default function DonorDashboard() {
  const [myResources, setMyResources] = useState([]);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  // Form state for creating and editing resources
  const [resourceType, setResourceType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedResource, setSelectedResource] = useState(null);
  const [editData, setEditData] = useState({ resource_type: '', quantity: '' });

  const { token } = useAuth();

  const fetchMyResources = () => {
    if (token) {
      api.getMyResources(token)
        .then(res => setMyResources(res.data || []))
        .catch(() => toast.error("Failed to load your resources."));
    }
  };

  const fetchAllRequests = () => {
    setIsLoadingAll(true);
    api.getAidRequests({}) // Fetch without geo-params
      .then(res => setAllRequests(res.data || []))
      .catch(() => toast.error("Failed to load all aid requests."))
      .finally(() => setIsLoadingAll(false));
  };


  useEffect(() => {
    // Initial data fetches that don't depend on location
    fetchMyResources();
    fetchAllRequests();

    // Get user's location once on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setIsLoadingLocation(false);
        },
        () => {
          setLocationError('Unable to retrieve your location. Please enable location services in your browser.');
          setIsLoadingLocation(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
    }
  }, [token]);

  const handleFetchNearbyRequests = () => {
    if (!userLocation) {
      toast.error(locationError || "Cannot fetch requests without your location.");
      return;
    }
    setIsLoadingNearby(true);
    const params = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radius: 50 // 50km radius
    };
    api.getAidRequests(params)
      .then(res => setNearbyRequests(res.data || []))
      .catch(() => toast.error("Failed to load nearby aid requests."))
      .finally(() => setIsLoadingNearby(false));
  };


  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!userLocation) {
        toast.error("Cannot create resource without your location.");
        return;
    }
    try {
      const resourceData = { 
        resource_type: resourceType, 
        quantity, 
        latitude: userLocation.latitude, 
        longitude: userLocation.longitude 
      };
      await api.createResource(resourceData, token);
      toast.success('Resource registered successfully!');
      setResourceType('');
      setQuantity(1);
      fetchMyResources(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to register resource.');
    }
  };

  const handleUpdateResource = async () => {
    if (!selectedResource) return;
    try {
        await api.updateResource(selectedResource.id, editData, token);
        toast.success("Resource updated successfully!");
        fetchMyResources();
    } catch (error) {
        toast.error(error.message || "Failed to update resource.");
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
        await api.deleteResource(resourceId, token);
        toast.success("Resource deleted successfully!");
        fetchMyResources();
    } catch (error) {
        toast.error(error.message || "Failed to delete resource.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Donor Dashboard</h1>
        <p className="text-muted-foreground">Manage your resources and view nearby needs.</p>
      </div>
      
      <Tabs defaultValue="nearby-requests">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="nearby-requests">Nearby Aid Requests</TabsTrigger>
          <TabsTrigger value="all-requests">All Aid Requests</TabsTrigger>
          <TabsTrigger value="register">Register Resources</TabsTrigger>
          <TabsTrigger value="my-resources">My Registered Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="nearby-requests" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <CardTitle>Nearby Aid Requests</CardTitle>
                            <CardDescription>Find aid requests within a 50km radius of your location.</CardDescription>
                        </div>
                        <Button onClick={handleFetchNearbyRequests} disabled={isLoadingLocation || isLoadingNearby}>
                            {isLoadingNearby ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoadingNearby ? 'Searching...' : 'Find Nearby Requests'}
                        </Button>
                    </div>
                    {locationError && <p className="text-sm text-red-500 mt-2">{locationError}</p>}
                </CardHeader>
                <CardContent className="grid xl:grid-cols-2 gap-6">
                    <div className="h-[500px] xl:h-[600px] w-full bg-muted rounded-lg">
                        <RequestsMap requests={nearbyRequests} userLocation={userLocation} />
                    </div>
                    <div className="max-h-[500px] xl:max-h-[600px] overflow-y-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Urgency</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {isLoadingNearby ? (
                                    <TableRow><TableCell colSpan="3" className="text-center">Loading requests...</TableCell></TableRow>
                                ) : nearbyRequests.length > 0 ? nearbyRequests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell>{req.aid_type}</TableCell>
                                        <TableCell className="capitalize">{req.status}</TableCell>
                                        <TableCell className="capitalize">{req.urgency}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan="3" className="text-center">No requests found nearby. Click "Find" to begin.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="all-requests" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>All Open Aid Requests</CardTitle>
                    <CardDescription>A list of all aid requests across the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Urgency</TableHead><TableHead>Location</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {isLoadingAll ? (
                                <TableRow><TableCell colSpan="4" className="text-center">Loading requests...</TableCell></TableRow>
                            ) : allRequests.length > 0 ? allRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.aid_type}</TableCell>
                                    <TableCell className="capitalize">{req.status}</TableCell>
                                    <TableCell className="capitalize">{req.urgency}</TableCell>
                                    <TableCell>{req.city || 'N/A'}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan="4" className="text-center">No aid requests found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="register" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Register a New Resource</CardTitle>
                    <CardDescription>Add a resource you can provide. Your current location will be used.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateResource} className="grid gap-4 max-w-md">
                        <div className="grid gap-2">
                            <Label htmlFor="resourceType">Resource Type (e.g., Clean Water, Blankets)</Label>
                            <Input id="resourceType" value={resourceType} onChange={(e) => setResourceType(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="1" />
                        </div>
                        <Button type="submit" disabled={isLoadingLocation}>
                            {isLoadingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Register Resource
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="my-resources" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>My Registered Resources</CardTitle>
                    <CardDescription>Here is a list of resources you have registered.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Resource Type</TableHead><TableHead>Quantity</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {myResources.map(res => (
                                <TableRow key={res.id}>
                                    <TableCell>{res.resource_type}</TableCell>
                                    <TableCell>{res.quantity}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Dialog onOpenChange={(isOpen) => { if (isOpen) { setSelectedResource(res); setEditData({ resource_type: res.resource_type, quantity: res.quantity }); }}}>
                                            <DialogTrigger asChild><Button variant="outline" size="sm">Edit</Button></DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Edit Resource</DialogTitle></DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <Input value={editData.resource_type} onChange={e => setEditData({...editData, resource_type: e.target.value})} />
                                                    <Input type="number" value={editData.quantity} onChange={e => setEditData({...editData, quantity: e.target.value})} />
                                                </div>
                                                <DialogFooter><DialogClose asChild><Button onClick={handleUpdateResource}>Save</Button></DialogClose></DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete</Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteResource(res.id)}>Delete</AlertDialogAction></AlertDialogFooter>
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
      </Tabs>
    </div>
  );
}

