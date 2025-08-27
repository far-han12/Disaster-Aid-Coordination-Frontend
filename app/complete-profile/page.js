'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function CompleteProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { token, user, refreshUser } = useAuth();
  const router = useRouter();

  // Fetch and pre-fill all existing contact info
  useEffect(() => {
    if (token) {
      api.getMyContactInfo(token)
        .then(res => {
          const contactInfo = res.data?.contactInfo || {};
          setFirstName(contactInfo.first_name || user?.first_name || '');
          setLastName(contactInfo.last_name || user?.last_name || '');
          setPhone(contactInfo.phone_no || '');
          setStreet(contactInfo.street || '');
          setCity(contactInfo.city || '');
          setState(contactInfo.state || '');
        })
        .catch(() => {
          toast.error("Could not load your profile data.");
        });
    }
  }, [token, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("You are not authenticated. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      const contactData = {
        first_name: firstName,
        last_name: lastName,
        phone_no: phone,
        street,
        city,
        state,
      };
      await api.createMyContactInfo(contactData, token);
      await refreshUser(); // Refresh the user data in the context
      
      toast.success('Profile updated successfully!');
      
      const rolePath = user.role === 'aidrequester' ? 'requester' : user.role;
      router.push(`/${rolePath}/dashboard`);

    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">My Profile</CardTitle>
          <CardDescription>Keep your contact information up to date.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="street">Street Address</Label>
              <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} required />
            </div>
             <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State / Division</Label>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
