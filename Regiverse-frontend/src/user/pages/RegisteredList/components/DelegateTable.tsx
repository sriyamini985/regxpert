import { useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate, useParams } from "react-router-dom";

interface Participant {
  _id: string;
  regId?: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  state?: string;
  reference?: string;
  medicalCouncilNumber?: string;
}

type UserTableProps = {
  data: Participant[];
};

const UserDelegateTable = ({ data }: UserTableProps) => {
  const navigate = useNavigate();
  const { conferenceId, conferenceSlug } = useParams();
  const currentConferenceId = conferenceId || conferenceSlug;

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showQR, setShowQR] = useState(true);

  // 1. ROUTE USER TO PUBLIC PARTICIPANT EDITOR MODULE (With state payload)
  const handleUserEdit = (participant: Participant) => {
    navigate(`/user/conference/${currentConferenceId}/add-delegate`, {
      state: { person: participant },
    });
  };

  // 2. TRIGGER FULLSCREEN OVERLAY MODAL CANVAS
  const handlePrintPreview = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowQR(true); 
  };

  // 3. LAUNCH OS PRINT HARDWARE INTERFACES
  const executeHardwarePrint = () => {
    window.print();
  };

  return (
    <>
      {/* STYLE OVERRIDES SHIELDING HARDWARE THERMAL PRINTER RENDER TARGETS */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            .print-section, .print-section * {
              visibility: visible !important;
            }
            .print-section {
              position: fixed !important;
              inset: 0 !important;
              background: white !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
              text-align: center !important;
              z-index: 9999999 !important;
            }
            .hide-print, .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* =========================================================================
          PRINT PREVIEW INTERFACE OVERLAY
         ========================================================================= */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-[99999] bg-slate-50 flex flex-col">
          
          {/* CONTROL OVERLAY MENU BAR */}
          <div className="no-print bg-white border-b shadow-sm p-4 flex flex-wrap gap-6 items-center justify-between select-none">
            <div className="flex items-center gap-6">
              
              {/* Checkbox Input Alignment Logic */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showQR} 
                  onChange={(e) => setShowQR(e.target.checked)}
                  className="w-5 h-5 cursor-pointer accent-blue-600 rounded"
                />
                <span className="font-bold text-slate-800 text-base">Print name with QR</span>
              </label>
            </div>

            {/* View Control Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedParticipant(null)} 
                className="px-6 py-2 rounded-lg font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={executeHardwarePrint} 
                className="px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow flex items-center gap-2 transition-all"
              >
                🖨️ Print Badge
              </button>
            </div>
          </div>

          {/* DYNAMIC DESIGN PREVIEW CANVAS BOX */}
          <div className="print-section flex-1 w-full bg-white flex flex-col items-center justify-center text-center px-4">
            
            {showQR && (
              <div className="mb-8 p-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                <QRCode 
                  value={selectedParticipant.regId || selectedParticipant._id} 
                  size={240} 
                />
              </div>
            )}
            
            <h1 className="text-5xl font-black text-black tracking-tight max-w-2xl uppercase leading-none">
              {selectedParticipant.name}
            </h1>
          </div>
        </div>
      )}

      {/* =========================================================================
          STANDARD INTERACTIVE GRID TABLE DATA PRESENTATION LAYOUT
         ========================================================================= */}
      <div className={`bg-white rounded-xl shadow overflow-x-auto hide-print ${selectedParticipant ? 'hidden' : ''}`}>
        <table className="w-full text-sm min-w-[1200px] border-collapse">
          <thead className="bg-gray-100 text-slate-700 text-left font-semibold">
            <tr className="border-b border-gray-200">
              <th className="p-4 w-28">QR Print</th>
              <th className="p-4 w-24">Edit</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Mobile</th>
              <th className="p-4">Reg ID</th>
              <th className="p-4">Category</th>
              <th className="p-4">State</th>
              <th className="p-4">Reference</th>
              <th className="p-4">Medical Council Number</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 divide-y divide-gray-100">
            {data.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4">
                  <button
                    onClick={() => handlePrintPreview(p)}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all text-xs"
                  >
                    Print
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleUserEdit(p)}
                    className="px-4 py-1.5 bg-orange-500 text-white rounded font-bold shadow-sm hover:bg-orange-600 active:scale-95 transition-all text-xs"
                  >
                    Edit
                  </button>
                </td>
                <td className="p-4 font-semibold text-gray-900">{p.name || "-"}</td>
                <td className="p-4 text-slate-600">{p.email || "-"}</td>
                <td className="p-4 text-slate-600">{p.phone || "-"}</td>
                <td className="p-4 font-mono text-slate-500 text-xs">{p.regId || p._id}</td>
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">
                    {p.category || "-"}
                  </span>
                </td>
                <td className="p-4 text-slate-600 uppercase text-xs font-medium tracking-wider">{p.state || "-"}</td>
                <td className="p-4 text-slate-600">{p.reference || "-"}</td>
                <td className="p-4 font-mono text-slate-500 text-xs">{p.medicalCouncilNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserDelegateTable;