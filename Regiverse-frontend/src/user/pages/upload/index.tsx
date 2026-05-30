import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const navigate = useNavigate();

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  /* GET CONFERENCE ID */
  const params =
    new URLSearchParams(window.location.search);

  const conferenceId =
    params.get("conferenceId");

  const handleUpload = async () => {
    if (!file) {
      alert("Upload excel file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "conferenceId",
        conferenceId || ""
      );

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conferences/import-excel`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      console.log(data);

      if (data.success) {
        alert(
          `${data.inserted} delegates imported successfully`
        );

        navigate(
          `/conference/${conferenceId}`
        );

      } else {
        alert("Import failed");
      }

    } catch (err) {
      console.log(err);

      alert("Server Error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="pt-24 px-4 max-w-3xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl p-10 border">

          {/* TITLE */}
          <h1 className="text-4xl font-bold mb-3">
            Upload Excel
          </h1>

          <p className="text-gray-500 mb-8">
            Conference:
            <span className="ml-2 font-semibold text-blue-600">
              {conferenceId}
            </span>
          </p>

          {/* FILE */}
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) =>
              setFile(
                e.target.files?.[0] || null
              )
            }
            className="w-full border rounded-2xl p-5 bg-gray-50"
          />

          {/* BUTTON */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-xl font-semibold"
          >
            {loading
              ? "Importing..."
              : "Import Excel"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default UploadPage;