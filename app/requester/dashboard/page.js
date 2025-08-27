'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from 'react-hot-toast';

export default function RequesterDashboard() {
  const [myRequests, setMyRequests] = useState([]);
  const { token } = useAuth();
  
  // Form state
  const [aidType, setAidType] = useState('');
  const [urgency, setUrgency] = useState('low');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      // Correctly handle the API response
      api.getMyRequests(token)
        .then(response => {
          if (response && Array.isArray(response.data)) {
            setMyRequests(response.data);
          }
        })
        .catch(console.error);
    }
  }, [token]);

  const handleNewRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Note: In a real app, you would get lat/lon from the browser's Geolocation API
      const newRequestData = { aid_type: aidType, urgency, latitude: 23.8, longitude: 90.4 };
      const newRequest = await api.createAidRequest(newRequestData, token);
      setMyRequests([newRequest, ...myRequests]);
      setAidType('');
      setUrgency('low');
      toast.success('Aid request submitted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Requester Dashboard</h1>
        <p className="text-gray-500">Submit new aid requests and track their status.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit a New Aid Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNewRequest} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="aidType">Aid Type (e.g., Clean Water, Food)</Label>
                <Input id="aidType" value={aidType} onChange={(e) => setAidType(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select onValueChange={setUrgency} defaultValue={urgency} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Request'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Request History</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {myRequests.map(req => (
                <li key={req.id} className="p-3 bg-gray-50 rounded-md border">
                  <p className="font-semibold">{req.aid_type}</p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Status: <span className="font-medium text-blue-600">{req.status}</span></span>
                    <span>Urgency: {req.urgency}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
