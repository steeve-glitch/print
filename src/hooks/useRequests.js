import { useState, useEffect } from 'react'
import { useStorage } from './useStorage'

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const AUTH_TOKEN = import.meta.env.VITE_WORKER_AUTH_TOKEN;

export function useRequests(user, role, department) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { sendEmail } = useStorage()

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${WORKER_URL}/api/requests`, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'X-User-Role': role,
          'X-User-Dept': department,
        },
      });
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) {
      setRequests([])
      setLoading(false)
      return
    }

    fetchRequests();

    // Set up a simple poll for real-time-ish updates (every 30 seconds)
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [user?.uid])

  const createRequest = async (data, user, userName) => {
    const response = await fetch(`${WORKER_URL}/api/requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        requesterId: user.uid,
        requesterName: userName || user.displayName || '',
        requesterEmail: user.email || '',
      }),
    });

    const newReq = await response.json();
    fetchRequests(); // Refresh local data

    // Notify HODs via Worker API (HOD lookup can be moved to worker for efficiency later)
    // For now, we'll keep the client-side notification trigger style but use the new D1 data
    try {
      // Find HODs in the department (simple filter from current users or a new endpoint)
      // For simplicity in this first pass, we'll rely on the worker to eventually handle this better.
      // But we still trigger the email to the specific department HODs if we had their emails.
      // Optimization: We could add a /api/notify-hods endpoint to the worker.
    } catch (e) {
      console.error('Failed to notify HODs', e);
    }

    return newReq;
  }

  const updateRequest = async (id, updates, reqData) => {
    await fetch(`${WORKER_URL}/api/requests/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    fetchRequests(); // Refresh local data

    // Notify Teacher of status change
    if (updates.status && reqData?.requesterEmail) {
      const statusLabels = {
        approved: 'Approved',
        rejected: 'Rejected',
        printing: 'Printing',
        ready: 'Ready for Pickup',
        completed: 'Completed'
      }
      
      try {
        sendEmail(
          reqData.requesterEmail,
          `Print Request Update: ${statusLabels[updates.status] || updates.status}`,
          `<p>Your print request <b>${reqData.documentName}</b> has been updated to: <b>${statusLabels[updates.status] || updates.status}</b>.</p>
           ${updates.hodComment ? `<p><b>HOD Comment:</b> ${updates.hodComment}</p>` : ''}
           <p>Thank you for using Print Manager.</p>`
        )
      } catch (e) {
        console.error('Failed to send teacher notification', e)
      }
    }
  }

  const bulkUpdate = async (ids, updates) => {
    const promises = ids.map(id => updateRequest(id, updates));
    await Promise.all(promises);
  }

  const deleteRequest = async (id) => {
    await fetch(`${WORKER_URL}/api/requests/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });
    fetchRequests();
  }

  return { requests, loading, createRequest, updateRequest, bulkUpdate, deleteRequest, refresh: fetchRequests }
}
