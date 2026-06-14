import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const UploadPage = () => {
  const navigate = useNavigate();
  
  // FIX: Extract conferenceId from React Router params, not window.location
  const { conferenceId } = useParams();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an excel file first.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conferenceId", conferenceId || "");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conferences/import-excel`, {
        method: "POST",
        body: formData,
      });

      // PATCH: Safely read the response as text first to prevent JSON parsing crashes on 500 errors
      const responseText = await res.text();
      let data: any = {};
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If the server sends an HTML error page, capture it safely
        data = { message: responseText || `HTTP Status Code: ${res.status}` };
      }

      // Check if the request was actually successful
      if (res.ok && (data.success || data.inserted)) {
        alert(`${data.inserted || 'All'} delegates imported successfully!`);
        // Navigate back to the dashboard so they can see the updated count
        navigate(`/admin/conference/${conferenceId}`); 
      } else {
        alert("Import failed: " + (data.message || data.error || "Unknown error"));
      }

    } catch (err: any) {
      console.error(err);
      alert("Server Connection Error during upload: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-4 sm:p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm p-5 sm:p-10 border border-slate-200">
          
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">Upload Roster</h1>
          <p className="text-slate-500 mb-6 sm:mb-8 font-medium">
            Workspace ID: 
            <span className="ml-2 font-mono text-[10px] sm:text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
              {conferenceId}
            </span>
          </p>
 
          <div className="border-2 border-dashed border-slate-300 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors mb-6 sm:mb-8">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-slate-600 file:mr-2 sm:file:mr-4 file:py-2.5 sm:file:py-3 file:px-4 sm:file:px-6 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer text-xs sm:text-sm"
            />
          </div>
 
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold transition-all shadow-md active:scale-[0.98]"
          >
            {loading ? "Processing Upload..." : "Import Database"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;