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

  // Pre-fill the name fields when the user data is loaded
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      
      toast.success('Profile completed successfully!');
      
      // Redirect to the correct dashboard
      const rolePath = user.role === 'aid_requester' ? 'requester' : user.role;
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
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Please provide your contact information to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled />
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
                {isLoading ? 'Saving...' : 'Save and Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
