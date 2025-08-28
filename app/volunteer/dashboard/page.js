'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';

export default function VolunteerDashboard() {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      api.getMyAssignments(token)
        .then(res => {
          if (res && Array.isArray(res.data)) {
            setAssignedTasks(res.data);
          }
        })
        .catch(console.error);
    }
  }, [token]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">View aid requests that have been assigned to you.</p>
      </div>

      <div className="space-y-6">
        {assignedTasks.length > 0 ? (
          assignedTasks.map(task => (
            <Card key={task.assignment_id}>
              <CardHeader>
                <CardTitle>Task: Deliver {task.aid_type}</CardTitle>
                <CardDescription>Status: <span className="font-semibold text-blue-500">{task.request_status}</span></CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                {/* Pickup Location */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">1. Pick Up From (Contributor)</h3>
                  <Separator />
                  <div className="mt-3 space-y-1 text-sm">
                    <p><strong>Name:</strong> {task.donor_first_name} {task.donor_last_name}</p>
                    <p><strong>Phone:</strong> {task.donor_phone}</p>
                    <p><strong>Address:</strong> {task.donor_street}, {task.donor_city}</p>
                  </div>
                </div>

                {/* Delivery Location */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">2. Deliver To (Requester)</h3>
                  <Separator />
                  <div className="mt-3 space-y-1 text-sm">
                    <p><strong>Name:</strong> {task.requester_first_name} {task.requester_last_name}</p>
                    <p><strong>Phone:</strong> {task.requester_phone}</p>
                    <p><strong>Address:</strong> {task.requester_street}, {task.requester_city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p>You have no assigned tasks at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
