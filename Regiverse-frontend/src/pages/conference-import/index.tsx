import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ConferenceImport = () => {
  const navigate = useNavigate();

  const [conferenceName, setConferenceName] =
    useState("");

  const [excelFile, setExcelFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const handleImport = async () => {
    if (!conferenceName.trim()) {
      alert("Enter conference name");
      return;
    }

    if (!excelFile) {
      alert("Upload excel file");
      return;
    }

    try {
      setLoading(true);

      const year =
        new Date().getFullYear();

      const slug =
        conferenceName
          .toLowerCase()
          .replace(/\s+/g, "") + year;

      const formData = new FormData();

      formData.append(
        "title",
        conferenceName
      );

      formData.append(
        "slug",
        slug
      );

      formData.append(
        "file",
        excelFile
      );

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conferences/import`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      console.log(data);

      if (data.success) {
        navigate(`/conference/${slug}`);
      } else {
        alert("Import failed");
      }

    } catch (err) {
      console.error(err);

      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-28 px-4">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10">

        <h1 className="text-5xl font-bold mb-3">
          Import Conference
        </h1>

        <p className="text-gray-500 mb-10 text-lg">
          Upload conference delegates excel
        </p>

        {/* CONFERENCE */}
        <div className="mb-8">

          <label className="block mb-3 font-semibold text-lg">
            Conference Name
          </label>

          <input
            type="text"
            value={conferenceName}
            onChange={(e) =>
              setConferenceName(e.target.value)
            }
            placeholder="Enter conference name"
            className="w-full border rounded-2xl p-5 text-lg"
          />

        </div>

        {/* FILE */}
        <div className="mb-10">

          <label className="block mb-3 font-semibold text-lg">
            Upload Excel
          </label>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) =>
              setExcelFile(
                e.target.files?.[0] || null
              )
            }
            className="w-full border rounded-2xl p-5 bg-gray-50"
          />

        </div>

        {/* BUTTON */}
        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-xl font-semibold"
        >
          {loading
            ? "Importing..."
            : "Import Conference"}
        </button>

      </div>
    </div>
  );
};

export default ConferenceImport;