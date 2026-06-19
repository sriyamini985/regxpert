import { useNavigate, useParams } from "react-router-dom";
import { Edit3, Printer, Users } from "lucide-react";

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
  printLogs?: { timestamp: string; staffMember: string }[];
  kitbagCollected?: boolean;
  certificateGiven?: boolean;
  foodLogs?: Record<string, boolean>;
  workshopScans?: string[];
  dynamicData?: Record<string, any>;
  avatar?: string;
  avatarUrl?: string;
  photo?: string;
  conferenceName?: string;
}

type UserTableProps = {
  data: Participant[];
};

const getParticipantPhoto = (p: any): string => {
  if (!p) return "";
  let rawPhoto = "";
  if (p.avatar) rawPhoto = p.avatar;
  else if (p.avatarUrl) rawPhoto = p.avatarUrl;
  else if (p.photo) rawPhoto = p.photo;
  else if (p.dynamicData) {
    if (p.dynamicData.Photo) rawPhoto = p.dynamicData.Photo;
    else if (p.dynamicData.Avatar) rawPhoto = p.dynamicData.Avatar;
    else if (p.dynamicData.avatarUrl) rawPhoto = p.dynamicData.avatarUrl;
  }
  
  if (rawPhoto && !rawPhoto.startsWith("data:") && !rawPhoto.startsWith("http")) {
    const apiURL = import.meta.env.VITE_API_URL || "";
    return `${apiURL}/uploads/${rawPhoto}`;
  }
  return rawPhoto;
};

const UserDelegateTable = ({ data }: UserTableProps) => {
  const navigate = useNavigate();
  const { conferenceSlug } = useParams();

  // 1. ROUTE USER TO PUBLIC PARTICIPANT EDITOR MODULE (With state payload)
  const handleUserEdit = (participant: Participant) => {
    navigate(`/u/${conferenceSlug}/participant-management`, {
      state: { person: participant },
    });
  };

  const handleQuickPrint = (p: Participant) => {
    const selectedCheckpoints = ["Check-In", "Food Counter", "Kitbag", "Certificate", "Workshop", "QR Code"];
    const editName = p.name || "";
    const editDestination = p.category || "";
    const editState = p.state || "";
    
    const qrContent = p.regId || p._id;

    const payload = {
      name: editName,
      destination: editDestination,
      state: editState,
      regId: p.regId || p._id,
      qrCode: qrContent,
      checkpoints: selectedCheckpoints,
      backUrl: window.location.pathname,
      conferenceName: p.conferenceName || "Conference",
      dynamicData: p.dynamicData || {},
      badgeSize: "standard",
      topSpacing: 3,
      photoFit: "cover",
      printPhoto: true,
      printName: true,
      printQR: true,
      printRegId: true,
      printCity: true,
      participantId: p._id,
      operatorEmail: "Staff Operator",
      avatar: p.avatar || "",
      avatarUrl: p.avatarUrl || "",
      photo: p.photo || ""
    };

    sessionStorage.setItem("print_badge_data", JSON.stringify(payload));
    window.open("/print-qr", "_self");
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table (Hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto hide-print">
        <table className="w-full text-sm min-w-[1300px] border-collapse">
          <thead className="bg-gray-100 text-slate-700 text-left font-semibold">
            <tr className="border-b border-gray-200">
              <th className="p-4 w-24">Edit</th>
              <th className="p-4">Name</th>
              <th className="p-4">Operational Progress</th>
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
            {data.map((p) => {
              const foodScanCount = p.foodLogs ? Object.values(p.foodLogs).filter(Boolean).length : 0;
              const workshopScanCount = p.workshopScans ? p.workshopScans.length : 0;

              return (
                <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <button
                      onClick={() => handleUserEdit(p)}
                      className="px-4 py-1.5 bg-orange-500 text-white rounded font-bold shadow-sm hover:bg-orange-600 active:scale-95 transition-all text-xs"
                    >
                      Edit
                    </button>
                  </td>
                  <td className="p-4 font-semibold text-gray-900">{p.name || "-"}</td>

                  {/* Progress Indicators Column */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        p.isCheckedIn 
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-sm" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Entry
                      </span>

                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        p.printed 
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Badge {p.printed ? `(${p.printLogs?.length || 1})` : ""}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        p.kitbagCollected 
                          ? "bg-blue-600 text-white border-blue-700 shadow-sm" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Kitbag
                      </span>

                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        foodScanCount > 0 
                          ? "bg-amber-500 text-white border-amber-600 shadow-sm" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Food {foodScanCount > 0 ? `(${foodScanCount})` : ""}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        workshopScanCount > 0 
                          ? "bg-purple-600 text-white border-purple-700 shadow-sm" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Workshop {workshopScanCount > 0 ? `(${workshopScanCount})` : ""}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        p.certificateGiven 
                          ? "bg-teal-600 text-white border-teal-700 shadow-sm" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Cert
                      </span>
                    </div>
                  </td>

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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (Visible on mobile only) */}
      <div className="block md:hidden space-y-4">
        {data.map((p) => {
          const foodScanCount = p.foodLogs ? Object.values(p.foodLogs).filter(Boolean).length : 0;
          const workshopScanCount = p.workshopScans ? p.workshopScans.length : 0;
          const photoUrl = getParticipantPhoto(p);

          return (
            <div key={p._id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-start gap-4">
                {/* Photo Frame */}
                <div className="w-14 h-16 bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden flex items-center justify-center flex-none">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Photo" className="w-full h-full object-cover object-top" />
                  ) : (
                    <Users className="w-6 h-6 text-slate-350" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-800 text-base leading-snug truncate">{p.name || "Unknown Name"}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                      {p.category || "Delegate"}
                    </span>
                    <span className="font-mono text-slate-450 text-[10px] font-bold">
                      Reg: {p.regId || p._id}
                    </span>
                  </div>
                  {(p.email || p.phone) && (
                    <div className="text-[11px] text-slate-500 mt-2 space-y-0.5 truncate">
                      {p.phone && <p>📞 {p.phone}</p>}
                      {p.email && <p className="truncate">✉️ {p.email}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Badges */}
              <div className="flex flex-wrap gap-1.5 py-1.5 border-t border-b border-slate-100">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                  p.isCheckedIn ? "bg-emerald-600 text-white border-emerald-700" : "bg-slate-50 text-slate-400 border-slate-200/50"
                }`}>
                  Entry
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                  p.printed ? "bg-indigo-600 text-white border-indigo-700" : "bg-slate-50 text-slate-400 border-slate-200/50"
                }`}>
                  Badge {p.printed ? `(${p.printLogs?.length || 1})` : ""}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                  p.kitbagCollected ? "bg-blue-600 text-white border-blue-700" : "bg-slate-50 text-slate-400 border-slate-200/50"
                }`}>
                  Kitbag
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                  foodScanCount > 0 ? "bg-amber-500 text-white border-amber-600" : "bg-slate-50 text-slate-400 border-slate-200/50"
                }`}>
                  Food {foodScanCount > 0 ? `(${foodScanCount})` : ""}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                  workshopScanCount > 0 ? "bg-purple-600 text-white border-purple-700" : "bg-slate-50 text-slate-400 border-slate-200/50"
                }`}>
                  Workshop {workshopScanCount > 0 ? `(${workshopScanCount})` : ""}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                  p.certificateGiven ? "bg-teal-600 text-white border-teal-700" : "bg-slate-50 text-slate-400 border-slate-200/50"
                }`}>
                  Cert
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  onClick={() => handleUserEdit(p)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl border border-slate-200/60 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => handleQuickPrint(p)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Badge</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDelegateTable;