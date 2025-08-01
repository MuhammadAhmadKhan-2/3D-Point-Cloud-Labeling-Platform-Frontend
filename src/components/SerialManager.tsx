import React, { useState } from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';

interface FrameImages {
  front?: File;
  back?: File;
  front_left?: File;
  front_right?: File;
  left?: File;
  right?: File;
}

interface Serial {
  id: string;
  serialNumber: string;

  pcdFileA?: File;
  pcdFileB?: File;
  frames: FrameImages[]; // 30 frames
}

const COMPANY_A = 'Original Source Factory Corporation';
const COMPANY_B = 'Meta bread';

const SerialManager: React.FC = () => {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const emptyFrames = Array.from({ length: 30 }, () => ({} as FrameImages));
  const [newSerial, setNewSerial] = useState<Omit<Serial, 'id'>>({
    serialNumber: '',
    pcdFileA: undefined,
    pcdFileB: undefined,
    frames: emptyFrames,
  });

  const resetForm = () => {
    setNewSerial({
      serialNumber: '',
      pcdFileA: undefined,
      pcdFileB: undefined,
      frames: emptyFrames,
    });
  };

  const handleAddSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerial.serialNumber || !newSerial.pcdFileA || !newSerial.pcdFileB) {
      alert('Please provide Serial Number and both PCD files.');
      return;
    }
    const newEntry: Serial = {
      id: Date.now().toString(),
      ...newSerial,
      frames: [...newSerial.frames],
    };
    setSerials((prev) => [...prev, newEntry]);
    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setSerials((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        Point Cloud Management
        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm"
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
                      className="p-1.5 hover:bg-red-600/20 rounded text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={16} />
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
                      {['front', 'back', 'front_left', 'front_right', 'left', 'right'].map((view) => (
                        <div key={view}>
                          <label className="block text-xs text-gray-400 mb-1 capitalize">{view.replace('_', ' ')}</label>
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
                            className="file:bg-teal-600 file:hover:bg-teal-700 file:text-white file:rounded file:px-2 file:py-1 file:border-0 bg-gray-800 border border-gray-700 rounded-lg text-white w-full"
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
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all"
                >
                  Save Serial
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
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
