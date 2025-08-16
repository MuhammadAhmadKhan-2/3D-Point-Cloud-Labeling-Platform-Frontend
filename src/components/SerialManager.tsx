import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Eye } from 'lucide-react';

interface FrameImages {
  front?: File;
  back?: File;
  "front-left"?: File;
  "front-right"?: File;
  "back-left"?: File;
  "back-right"?: File;
}

interface Serial {
  id: string; // local key (maps to _id from backend)
  serialNumber: string;

  pcdFileA?: File;
  pcdFileB?: File;
  frames: FrameImages[]; // 30 frames
}

const COMPANY_A = 'Original Source Factory Corporation';
const COMPANY_B = 'Meta bread';

const SerialManager: React.FC = () => {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const emptyFrames = Array.from({ length: 30 }, () => ({} as FrameImages));
  const [newSerial, setNewSerial] = useState<Omit<Serial, 'id'>>({
    serialNumber: '',
    pcdFileA: undefined,
    pcdFileB: undefined,
    frames: emptyFrames,
  });

  // Fetch existing serials on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/serials`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const fetched: Serial[] = res.data.data.serials.map((s: any) => ({ ...s, id: s._id }));
        setSerials(fetched);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch serials');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const resetForm = () => {
    setNewSerial({
      serialNumber: '',
      pcdFileA: undefined,
      pcdFileB: undefined,
      frames: emptyFrames,
    });
  };

  const handleAddSerial = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (saving) return;
    setSaving(true);
    if (!newSerial.serialNumber || !newSerial.pcdFileA || !newSerial.pcdFileB) {
      setError('Please provide Serial Number and both PCD files.');
      setSaving(false);
      return;
    }
    
    // Build FormData for multipart upload
    try {
      const formData = new FormData();
      formData.append('serialNumber', newSerial.serialNumber);
      if (newSerial.pcdFileA) formData.append('pcdFileA', newSerial.pcdFileA);
      if (newSerial.pcdFileB) formData.append('pcdFileB', newSerial.pcdFileB);
      // Append frame images with corrected field names
      const imageTypes = ['front', 'back', 'front_left', 'front_right', 'back_left', 'back_right'] as const;
      newSerial.frames.forEach((frame, idx) => {
        imageTypes.forEach((type) => {
          const file = frame[type.replace('_', '-') as keyof FrameImages] as File | undefined;
          if (file) {
            formData.append(`frame_${idx}_${type}`, file);
          }
        });
      });

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      console.log('Starting upload for serial:', newSerial.serialNumber);
      console.log('Total files to upload:', Array.from(formData.entries()).length);

      const response = await axios.post(`${API_BASE_URL}/serials/unlimited`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout: 3600000, // 60 minutes timeout for very large uploads (200+ files)
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
            // You could add a progress bar here if needed
          }
        },
      });

      console.log('Upload completed successfully');
      const createdSerial = response.data.data;
      // Add to local list for instant UI
      // After add, re-fetch serials from backend to ensure only backend ids are present
      await fetchSerials();
      setShowAddModal(false);
      resetForm();
      setError(null); // Clear error on successful creation
    } catch (err: any) {
      console.error('Upload error:', err);
      
      // Provide more specific error messages
      if (err.code === 'ECONNABORTED') {
        setError('Upload timeout. Please try again with fewer files or check your connection.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check if the backend server is running and try again.');
      } else if (err.response?.status === 413) {
        setError('Files too large. Please reduce file sizes and try again.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid request. Please check your files and try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to create serial. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    if (!/^[a-f\d]{24}$/i.test(id)) {
      setError('Cannot delete serial: invalid backend id.');
      setDeletingId(null);
      return;
    }
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        setDeletingId(null);
        return;
      }
      console.log('Deleting serial with ID:', id);
      const response = await axios.delete(`${API_BASE_URL}/serials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSerials();
      // Don't show success message on main screen since we're only showing errors in modal
    } catch (err: any) {
      console.error('Delete error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const message = err.response?.data?.message || 'Failed to delete serial';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to fetch serials from backend
  const fetchSerials = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/serials`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const fetched: Serial[] = res.data.data.serials.map((s: any) => ({ ...s, id: s._id }));
      setSerials(fetched);
    } catch (err) {
      console.error(err);
      // Don't set global error here as it's not related to user actions in the modal
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchSerials();
  }, []);

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        Point Cloud Management
        <button
          onClick={() => {
            setShowAddModal(true);
            setError(null);
          }}
          disabled={saving || deletingId !== null}
          className="ml-auto inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Add Serial
        </button>
      </h2>

      {/* Serial List */}
      {serials.length === 0 ? (
        <p className="text-gray-400">No serials added yet.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-900 rounded-lg ring-1 ring-gray-700/50">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Serial #</th>

                <th className="px-4 py-3">Frames</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serials.map((serial) => (
                <tr
                  key={serial.id}
                  className="border-t border-gray-800 hover:bg-gray-800/60 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                    {serial.serialNumber}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">30</td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <button
                      onClick={() => handleDelete(serial.id)}
                      disabled={deletingId === serial.id}
                      className="p-1.5 hover:bg-red-600/20 rounded text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      {deletingId === serial.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Serial Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl bg-gray-900 rounded-2xl p-8 ring-1 ring-blue-500/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Plus size={20} /> Add New Serial
            </h3>
            <form onSubmit={handleAddSerial} className="space-y-4">
              {error && (
                <div className={`mb-4 p-3 rounded-lg ${error.includes('successfully') ? 'bg-green-900/50 border border-green-700 text-green-200' : 'bg-red-900/50 border border-red-700 text-red-200'}`}>
                  {error}
                </div>
              )}
              <div>
                <label className="block mb-1 text-gray-300">Serial Number</label>
                <input
                  type="text"
                  value={newSerial.serialNumber}
                  onChange={(e) => setNewSerial({ ...newSerial, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <p className="text-gray-400">Companies: {COMPANY_A} &amp; {COMPANY_B}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-300">PCD File ({COMPANY_A})</label>
                  <input
                    type="file"
                    accept=".pcd"
                    onChange={(e) =>
                      setNewSerial({ ...newSerial, pcdFileA: e.target.files?.[0] })
                    }
                    className="file:bg-blue-600 file:hover:bg-blue-700 file:text-white file:rounded file:px-3 file:py-1.5 file:border-0 bg-gray-800 border border-gray-700 rounded-lg text-white w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-300">PCD File ({COMPANY_B})</label>
                  <input
                    type="file"
                    accept=".pcd"
                    onChange={(e) =>
                      setNewSerial({ ...newSerial, pcdFileB: e.target.files?.[0] })
                    }
                    className="file:bg-blue-600 file:hover:bg-blue-700 file:text-white file:rounded file:px-3 file:py-1.5 file:border-0 bg-gray-800 border border-gray-700 rounded-lg text-white w-full"
                    required
                  />
                </div>
              </div>
              {/* Frame Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2 bg-gray-800/40 p-4 rounded-lg border border-gray-700">
                {newSerial.frames.map((_, idx) => (
                  <details key={idx} className="bg-gray-900/60 rounded-lg p-3">
                    <summary className="cursor-pointer text-gray-200 mb-2">Frame {idx + 1}</summary>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {['front', 'back', 'front-left', 'front-right', 'back-left', 'back-right'].map((view) => (
                        <div key={view}>
                          <label className="block text-xs text-gray-400 mb-1 capitalize flex items-center gap-1">
                            {view.replace('-', ' ')}
                            <span className={`text-xs ${newSerial.frames[idx][view as keyof FrameImages] ? 'text-green-400' : 'text-red-400'}`}>●</span>
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              setNewSerial((prev) => {
                                const framesCopy = [...prev.frames];
                                framesCopy[idx] = { ...framesCopy[idx], [view]: file } as FrameImages;
                                return { ...prev, frames: framesCopy };
                              });
                            }}
                            className={`cursor-pointer file:bg-teal-600 file:hover:bg-teal-700 file:text-white file:rounded file:px-2 file:py-1 file:border-0 bg-gray-800 border-2 ${newSerial.frames[idx][view as keyof FrameImages] ? 'border-green-500' : 'border-red-500'} rounded-lg text-white w-full`}
                          />
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 py-2 rounded-lg text-white transition-all ${saving ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700'}`}
                >
                  {saving ? 'Saving...' : 'Save Serial'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                    setError(null);
                  }}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SerialManager;
