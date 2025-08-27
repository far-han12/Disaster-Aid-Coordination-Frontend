'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VolunteerDashboard() {
  const [assignedRequests, setAssignedRequests] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      api.getMyAssignments(token).then(res => setAssignedRequests(res.data)).catch(console.error);
    }
  }, [token]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
        <p className="text-gray-500">View aid requests that have been assigned to you.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Assigned Tasks</CardTitle>
          <CardDescription>These are the aid requests you have been assigned to help with.</CardDescription>
        </CardHeader>
        <CardContent>
          {assignedRequests.length > 0 ? (
            <ul className="space-y-4">
              {assignedRequests.map(task => (
                <li key={task.assignment_id} className="p-4 border rounded-lg">
                  <p className="font-bold text-lg">{task.aid_type}</p>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Status: <span className="font-semibold text-green-600">{task.status}</span></span>
                    <span className="text-gray-600">Urgency: <span className="font-semibold text-red-600">{task.urgency}</span></span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no assigned tasks at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
