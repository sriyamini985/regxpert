import React from "react";
import { Participant } from "../types";

interface Props {
  data: Participant[];
  onIssue: (user: Participant) => void;
}

// 🎯 Dynamic certificate text
const getCertificateDetails = (user: Participant) => {
  if (!user.certificate?.issued) return null;

  switch (user.category.toLowerCase()) {
    case "student":
      return {
        title: "Quiz Topper",
        desc: "Awarded for securing highest marks in Quiz",
      };

    case "faculty":
      return {
        title: "Certificate of Appreciation",
        desc: "For valuable contribution as Faculty",
      };

    case "delegate":
      return {
        title: "Participation Certificate",
        desc: "For participating in the event",
      };

    case "accompanying":
      return {
        title: "Accompanying Certificate",
        desc: "For attending as accompanying person",
      };

    default:
      return {
        title: "Certificate",
        desc: "Participation acknowledged",
      };
  }
};

const ResultTable: React.FC<Props> = ({ data, onIssue }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Action</th>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Reg ID</th>
            <th className="p-2">Category</th>
            <th className="p-2">Certificate</th>
          </tr>
        </thead>

        <tbody>
          {data.map((user) => {
            const cert = getCertificateDetails(user);

            return (
              <tr key={user.id} className="border-t text-center">

                {/* ACTION */}
                <td className="p-2">
                  {user.certificate?.issued ? (
                    <span className="text-green-600 text-xs font-semibold">
                      Delivered
                    </span>
                  ) : (
                    <button
                      onClick={() => onIssue(user)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                    >
                      Deliver
                    </button>
                  )}
                </td>

                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.regId}</td>
                <td className="p-2">{user.category || "-"}</td>
                <td className="p-2">{user.certificate?.issued ? "Certificate Issued" : "Not Issued"}</td>

                {/* CERTIFICATE COLUMN */}
                <td className="p-2">
                  {cert ? (
                    <div className="text-xs text-left">
                      <div className="font-semibold">
                        {cert.title}
                      </div>
                      <div className="text-gray-500">
                        {cert.desc}
                      </div>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
};

export default ResultTable;