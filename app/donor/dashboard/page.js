'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const [requests, setRequests] = useState([]);
  const [myResources, setMyResources] = useState([]);
  const { token } = useAuth();

  // Form state for new resource
  const [resourceType, setResourceType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyResources = () => {
    if (token) {
      api.getMyResources(token)
        .then(res => {
          if (res && Array.isArray(res.data)) {
            setMyResources(res.data);
          }
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    // Fetch nearby aid requests when the component mounts
    const params = { latitude: 23.8, longitude: 90.4, radius: 50 };
    api.getAidRequests(params)
      .then(res => {
        if (res && Array.isArray(res.data)) {
          setRequests(res.data);
        }
      })
      .catch(console.error);
    
    fetchMyResources();
  }, [token]);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resourceData = { resource_type: resourceType, quantity, latitude: 23.8, longitude: 90.4 };
      await api.createResource(resourceData, token);
      toast.success('Resource registered successfully!');
      setResourceType('');
      setQuantity(1);
      fetchMyResources(); // Refresh the list of my resources
    } catch (error) {
      toast.error(error.message || 'Failed to register resource.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Register your available resources and view nearby aid requests.</p>
      </div>
      
      <Tabs defaultValue="register">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="register">Register Resources</TabsTrigger>
          <TabsTrigger value="my-resources">My Registered Resources</TabsTrigger>
          <TabsTrigger value="requests">View Aid Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Register a New Resource</CardTitle>
              <CardDescription>Let us know what resources you have available to help.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateResource} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="resourceType">Resource Type (e.g., Bottled Water, Blankets)</Label>
                  <Input id="resourceType" value={resourceType} onChange={(e) => setResourceType(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="1" disabled={isLoading} />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Register Resource'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-resources" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>My Registered Resources</CardTitle>
                    <CardDescription>A list of resources you have made available.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Resource Type</TableHead>
                                <TableHead>Quantity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {myResources.map(resource => (
                                <TableRow key={resource.id}>
                                    <TableCell className="font-medium">{resource.resource_type}</TableCell>
                                    <TableCell>{resource.quantity}</TableCell>
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
              <CardTitle>Nearby Aid Requests</CardTitle>
              <CardDescription>Aid requests within a 50km radius that you may be able to help with.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aid Type</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.aid_type}</TableCell>
                      <TableCell>{req.urgency}</TableCell>
                      <TableCell>{req.status}</TableCell>
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
