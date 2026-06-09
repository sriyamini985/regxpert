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

type Props = {
  data: any[];
  onPrint?: (participant: any) => void;
};

const DelegateTable = ({ data }: Props) => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();

  // --- STATES ---
  const [selected, setSelected] = useState<Participant | null>(null);
  const [showQR, setShowQR] = useState(true); // The single tick button setting

  // 1. EDIT HANDLER
  const handleEdit = (participant: Participant) => {
    navigate(`/admin/conference/${conferenceId}/add-delegate`, {
      state: { person: participant },
    });
  };

  // 2. OPEN PRINT PREVIEW
  const handlePrintClick = (participant: Participant) => {
    setSelected(participant);
    setShowQR(true); // Default to checked whenever a new badge is clicked
  };

  // 3. EXECUTE ACTUAL PRINT
  const executePrint = () => {
    window.print();
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-section, .print-section * {
              visibility: visible;
            }
            .print-section {
              position: fixed;
              inset: 0;
              background: white;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              z-index: 99999;
            }
            .hide-print, .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* =========================================
          PRINT PREVIEW & CUSTOMIZATION OVERLAY
      ========================================= */}
      {selected && (
        <div className="fixed inset-0 z-[99999] bg-slate-50 flex flex-col">
          
          {/* CONTROL PANEL */}
          <div className="no-print bg-white border-b shadow-sm p-4 flex flex-wrap gap-6 items-center justify-between">
            <div className="flex items-center gap-6">
              
              {/* The Single Tick Button Control */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showQR} 
                  onChange={(e) => setShowQR(e.target.checked)}
                  className="w-5 h-5 cursor-pointer accent-blue-600"
                />
                <span className="font-bold text-slate-800">Print name with QR</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={() => setSelected(null)} 
                className="px-6 py-2 rounded-lg font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={executePrint} 
                className="px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow flex items-center gap-2 transition-all"
              >
                🖨️ Print Badge
              </button>
            </div>
          </div>

          {/* CLEAN BADGE CANVAS (Permanently Center-Aligned, No ID display text) */}
          <div className="print-section flex-1 w-full bg-white flex flex-col items-center justify-center text-center px-4">
            
            {showQR && (
              <div className="mb-8">
                <QRCode 
                  value={selected.regId || selected._id} 
                  size={250} 
                />
              </div>
            )}
            
            <h1 className="text-4xl font-extrabold text-black tracking-tight max-w-xl">
              {selected.name}
            </h1>
            
            {selected.state && (
              <p className="text-2xl font-semibold mt-3 text-slate-800 uppercase tracking-wider">
                {selected.state}
              </p>
            )}

            {/* The old <p> tag displaying the registration ID text has been removed entirely from here */}
          </div>
        </div>
      )}

      {/* =========================================
          STANDARD TABLE VIEW
      ========================================= */}
      <div className={`bg-white rounded-xl shadow overflow-x-auto hide-print ${selected ? 'hidden' : ''}`}>
        <table className="w-full text-sm min-w-[1200px]">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">QR Print</th>
              <th className="p-3">Edit</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Reg ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">State</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Medical Council Number</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p._id} className="border-t hover:bg-slate-50">
                <td className="p-3">
                  <button
                    onClick={() => handlePrintClick(p)}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Print
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-4 py-1.5 bg-orange-500 text-white rounded font-bold shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
                  >
                    Edit
                  </button>
                </td>
                <td className="p-3 font-semibold">{p.name || "-"}</td>
                <td className="p-3 text-slate-600">{p.email || "-"}</td>
                <td className="p-3 text-slate-600">{p.phone || "-"}</td>
                <td className="p-3 font-mono text-slate-500">{p.regId || p._id}</td>
                <td className="p-3">
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-bold">
                    {p.category || "-"}
                  </span>
                </td>
                <td className="p-3 text-slate-600">{p.state || "-"}</td>
                <td className="p-3 text-slate-600">{p.reference || "-"}</td>
                <td className="p-3 font-mono text-slate-500">{p.medicalCouncilNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DelegateTable;