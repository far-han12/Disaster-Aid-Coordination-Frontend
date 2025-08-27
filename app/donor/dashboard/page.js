'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const [requests, setRequests] = useState([]);
  const { token } = useAuth();

  // Form state for new resource
  const [resourceType, setResourceType] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const params = { latitude: 23.8, longitude: 90.4, radius: 50 };
    api.getAidRequests(params).then(res => setRequests(res.data)).catch(console.error);
  }, []);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      const resourceData = { resource_type: resourceType, quantity, latitude: 23.8, longitude: 90.4 };
      await api.createResource(resourceData, token);
      toast.success('Resource registered successfully!');
      setResourceType('');
      setQuantity(1);
    } catch (error) {
      toast.error(error.message || 'Failed to register resource.');
    }
  };
// 
// 
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Donor Dashboard</h1>
        <p className="text-gray-500">View nearby aid requests and register your resources.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Register a New Resource</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateResource} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="resourceType">Resource Type</Label>
                <Input id="resourceType" value={resourceType} onChange={(e) => setResourceType(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="1" />
              </div>
              <Button type="submit">Register Resource</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nearby Aid Requests</CardTitle>
            <CardDescription>Aid requests within a 50km radius.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* ... display nearby requests ... */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
