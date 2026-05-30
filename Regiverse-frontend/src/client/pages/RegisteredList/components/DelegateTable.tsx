import { useState } from "react";
import QRCode from "react-qr-code";

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

const DelegateTable = ({
  data,
}: Props) => {
  const [selected, setSelected] =
    useState<Participant | null>(
      null
    );

  const handlePrint = (
    participant: Participant
  ) => {
    setSelected(participant);

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        setSelected(null);
      }, 500);

    }, 300);
  };

  return (
    <>
      <style>
        {`
          @media print {

            body * {
              visibility: hidden;
            }

            .print-section,
            .print-section * {
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
              z-index: 99999;
            }

            .hide-print {
              display: none;
            }
          }
        `}
      </style>

      {/* QR PRINT */}
      {selected && (
        <div className="print-section">

          <QRCode
            value={
              selected.regId ||
              selected._id
            }
            size={200}
          />

          <h1 className="text-4xl font-bold mt-6">
            {selected.name}
          </h1>

        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto hide-print">

        <table className="w-full text-sm min-w-[1200px]">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">
                QR Print
              </th>

              <th className="p-3">
                Edit
              </th>

              <th className="p-3">
                Name
              </th>

              <th className="p-3">
                Email
              </th>

              <th className="p-3">
                Mobile
              </th>

              <th className="p-3">
                Reg ID
              </th>

              <th className="p-3">
                Category
              </th>

              <th className="p-3">
                State
              </th>

              <th className="p-3">
                Reference
              </th>

              <th className="p-3">
                Medical Council Number
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((p) => (
              <tr
                key={p._id}
                className="border-t"
              >
                <td className="p-3">
                  <button
                    onClick={() =>
                      handlePrint(p)
                    }
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Print
                  </button>
                </td>

                <td className="p-3">
                  <button
                    className="px-3 py-1 bg-orange-500 text-white rounded"
                  >
                    Edit
                  </button>
                </td>

                <td className="p-3">
                  {p.name || "-"}
                </td>

                <td className="p-3">
                  {p.email || "-"}
                </td>

                <td className="p-3">
                  {p.phone || "-"}
                </td>

                <td className="p-3">
                  {p.regId ||
                    p._id}
                </td>

                <td className="p-3">
                  {p.category || "-"}
                </td>

                <td className="p-3">
                  {p.state || "-"}
                </td>

                <td className="p-3">
                  {p.reference || "-"}
                </td>

                <td className="p-3">
                  {p.medicalCouncilNumber ||
                    "-"}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </>
  );
};

export default DelegateTable;