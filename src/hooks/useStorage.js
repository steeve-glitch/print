const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const AUTH_TOKEN = import.meta.env.VITE_WORKER_AUTH_TOKEN;

export const useStorage = () => {
  const uploadFile = async (file) => {
    if (!WORKER_URL) throw new Error('VITE_WORKER_URL is not defined');
    
    const response = await fetch(`${WORKER_URL}/upload/${encodeURIComponent(file.name)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${await response.text()}`);
    }

    return response.text();
  };

  const getDownloadUrl = (filename) => {
    // Note: Since the worker requires a Bearer token, we can't just use a simple link
    // unless we implement signed URLs or a temporary access token.
    // For now, we'll fetch the blob.
    return `${WORKER_URL}/download/${encodeURIComponent(filename)}`;
  };

  const downloadFile = async (filename) => {
    const response = await fetch(getDownloadUrl(filename), {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${await response.text()}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const viewFile = async (url, filename) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      // Note: We can't easily revoke the URL immediately as the new tab needs it.
      // In a production app, you might want to manage these object URLs more carefully.
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Could not open file. It might have been deleted or you may not have permission.');
    }
  };

  const listFiles = async () => {
    const response = await fetch(`${WORKER_URL}/list`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Listing failed: ${await response.text()}`);
    }

    return response.json();
  };

  const deleteFile = async (filename) => {
    const response = await fetch(`${WORKER_URL}/delete/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${await response.text()}`);
    }

    return response.text();
  };

  const sendEmail = async (to, subject, html) => {
    const response = await fetch(`${WORKER_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      console.error('Email failed:', await response.text());
    }
  };

  const getAuthenticatedUrl = async (url) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      });
      if (!response.ok) return null;
      const blob = await response.blob();
      return {
        blobUrl: window.URL.createObjectURL(blob),
        type: blob.type,
        size: blob.size
      };
    } catch (e) {
      return null;
    }
  };

  return { uploadFile, downloadFile, viewFile, getAuthenticatedUrl, listFiles, deleteFile, sendEmail };
};
