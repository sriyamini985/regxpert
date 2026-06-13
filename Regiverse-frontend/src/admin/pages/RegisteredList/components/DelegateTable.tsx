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
  isCheckedIn?: boolean;
  printed?: boolean;
  kitbagCollected?: boolean;
  certificateGiven?: boolean;
  foodLogs?: Record<string, boolean>;
  workshopScans?: string[];
}

type Props = {
  data: Participant[];
};

const DelegateTable = ({ data }: Props) => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();

  // 1. EDIT HANDLER
  const handleEdit = (participant: Participant) => {
    navigate(`/admin/conference/${conferenceId}/add-delegate`, {
      state: { person: participant },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto hide-print">
      <table className="w-full text-sm min-w-[1300px]">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Edit</th>
            <th className="p-3">Name</th>
            <th className="p-3">Operational Progress</th>
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
          {data.map((p) => {
            const foodScanCount = p.foodLogs ? Object.values(p.foodLogs).filter(Boolean).length : 0;
            const workshopScanCount = p.workshopScans ? p.workshopScans.length : 0;

            return (
              <tr key={p._id} className="border-t hover:bg-slate-50">
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-4 py-1.5 bg-orange-500 text-white rounded font-bold shadow-sm hover:bg-orange-600 active:scale-95 transition-all text-xs"
                  >
                    Edit
                  </button>
                </td>
                <td className="p-3 font-semibold text-slate-800">{p.name || "-"}</td>
                
                {/* Progress Indicators Column with Solid Vibrant Colors */}
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {/* Check In */}
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                      p.isCheckedIn 
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-sm shadow-emerald-600/10" 
                        : "bg-slate-100 text-slate-400 border-slate-200/50"
                    }`}>
                      Entry
                    </span>

                    {/* Badge Printed */}
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                      p.printed 
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-600/10" 
                        : "bg-slate-100 text-slate-400 border-slate-200/50"
                    }`}>
                      Badge
                    </span>

                    {/* Kit bag */}
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                      p.kitbagCollected 
                        ? "bg-blue-600 text-white border-blue-700 shadow-sm shadow-blue-600/10" 
                        : "bg-slate-100 text-slate-400 border-slate-200/50"
                    }`}>
                      Kitbag
                    </span>

                    {/* Food Scan */}
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                      foodScanCount > 0 
                        ? "bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/10" 
                        : "bg-slate-100 text-slate-400 border-slate-200/50"
                    }`}>
                      Food {foodScanCount > 0 ? `(${foodScanCount})` : ""}
                    </span>

                    {/* Workshop Scan */}
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                      workshopScanCount > 0 
                        ? "bg-purple-600 text-white border-purple-700 shadow-sm shadow-purple-600/10" 
                        : "bg-slate-100 text-slate-400 border-slate-200/50"
                    }`}>
                      Workshop {workshopScanCount > 0 ? `(${workshopScanCount})` : ""}
                    </span>

                    {/* Certificate Issued */}
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                      p.certificateGiven 
                        ? "bg-teal-600 text-white border-teal-700 shadow-sm shadow-teal-600/10" 
                        : "bg-slate-100 text-slate-400 border-slate-200/50"
                    }`}>
                      Cert
                    </span>
                  </div>
                </td>

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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DelegateTable;