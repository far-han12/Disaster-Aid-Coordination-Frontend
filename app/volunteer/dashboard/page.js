'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Package, User, Phone, Home, Truck } from 'lucide-react';

export default function VolunteerDashboard() {
  const [assignments, setAssignments] = useState([]);
  const { token } = useAuth();

  const fetchAssignments = () => {
    if (token) {
      api.getMyAssignments(token)
        .then(res => setAssignments(res.data || []))
        .catch(() => toast.error("Failed to load assigned tasks."));
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [token]);

  const handleCompleteTask = async (assignmentId) => {
    try {
      await api.completeAssignment(assignmentId, token);
      toast.success("Task successfully marked as complete!");
      fetchAssignments(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to complete task.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
        <p className="text-muted-foreground">Here are your currently assigned tasks.</p>
      </div>
      
      {assignments.length > 0 ? (
        <div className="grid gap-6">
          {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <Card key={assignment.assignment_id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{assignment.aid_type} (Quantity: {assignment.quantity})</CardTitle>
                    <CardDescription>Status: <span className="font-semibold">{assignment.request_status}</span></CardDescription>
                  </div>
                  {assignment.request_status !== 'fulfilled' && (
                    <Button onClick={() => handleCompleteTask(assignment.assignment_id)}>Mark as Completed</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Pick Up From (Donor)</h3>
                    <p>{assignment.donor_first_name} {assignment.donor_last_name}</p>
                    <p className="text-sm text-muted-foreground">{assignment.donor_phone}</p>
                    <p className="text-sm text-muted-foreground">{assignment.donor_street}, {assignment.donor_city}</p>
                  </div>
                  <Separator orientation="vertical" className="hidden md:block" />
                  <div>
                    <h3 className="font-semibold mb-2">Deliver To (Requester)</h3>
                    <p>{assignment.requester_first_name} {assignment.requester_last_name}</p>
                    <p className="text-sm text-muted-foreground">{assignment.requester_phone}</p>
                    <p className="text-sm text-muted-foreground">{assignment.requester_street}, {assignment.requester_city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>You have no assigned tasks at the moment.</p>
        )}
        </div>
      ) : (
        <Card className="text-center p-10">
          <CardTitle>No Assigned Tasks</CardTitle>
          <CardDescription className="mt-2">You currently have no tasks assigned to you. Check back later!</CardDescription>
        </Card>
      )}
    </div>
  );
}

