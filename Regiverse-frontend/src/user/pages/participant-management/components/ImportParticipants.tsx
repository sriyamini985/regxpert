import { useState } from "react";
import * as XLSX from "xlsx";

const ImportParticipants = () => {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: any) => {
  console.log("🔥 HANDLE FILE TRIGGERED");

  const file = e.target.files?.[0];

  console.log("📁 FILE:", file);

  if (!file) return;

  setLoading(true);

  try {
      /* READ EXCEL */

      console.log("🚀 ABOUT TO CALL API");
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      console.log("📊 JSON:", json);

      

      /* FORMAT DATA */
     const formatted = json.map((item: any) => {
  const normalized: any = {};

  Object.keys(item).forEach((key) => {
    normalized[key.trim().toLowerCase()] = item[key];
  });

  return {
    name:
      normalized.name ||
      normalized["full name"] ||
      normalized["participant name"] ||
      "",

    email:
      normalized.email ||
      normalized["email address"] ||
      "",

    phone:
      normalized.phone ||
      normalized.mobile ||
      normalized["mobile number"] ||
      normalized["phone number"] ||
      "",

    state:
      normalized.state ||
      normalized.city ||
      "",

    category:
      normalized.category ||
      "",

    reference:
      normalized.reference ||
      "",

    printType:
      normalized["print type"] ||
      "name",

    qrCode:
      normalized["qr code"] ||
      normalized.qr ||
      "",
  };
});

console.log("FINAL FORMATTED:", formatted);


      /* CHUNK IMPORT */
      const chunkSize = 500;
      let totalInserted = 0;

      for (let i = 0; i < formatted.length; i += chunkSize) {
        const chunk = formatted.slice(i, i + chunkSize);

        const res = await fetch(
          "http://localhost:5000/api/participants/bulk",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(chunk),
          }
        );

        const result = await res.json();

        console.log(`🚀 Chunk ${i / chunkSize + 1}`, result);

        if (!res.ok || !result.success) {
          throw new Error(result.message || "Chunk upload failed");
        }

        totalInserted += result.inserted || 0;
      }

      /* ✅ SUCCESS ALERT */
      alert(
        `🎉 Import Successful!\n\nTotal Imported: ${totalInserted}`
      );
    } catch (err: any) {
      console.error("❌ Import Error:", err);
      alert(`❌ Import Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} />

      {loading && (
        <p className="mt-4">Importing participants...</p>
      )}
    </div>
  );
};

export default ImportParticipants;