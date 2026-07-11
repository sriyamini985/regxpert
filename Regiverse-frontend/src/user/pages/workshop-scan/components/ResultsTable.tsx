import React from 'react';
import { Participant } from '../WorkshopScan';

interface Props {
  data: Participant[];
  onCheckIn: (id: string) => void;
}

const ResultsTable: React.FC<Props> = ({ data, onCheckIn }) => {
  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 sticky left-0 bg-gray-100">Action</th>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Company</th>
            <th className="p-3">Reg ID</th>
          </tr>
        </thead>

        <tbody>
          {data.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3 sticky left-0 bg-white">
                <button
                  onClick={() => onCheckIn(p.id)}
                  disabled={p.status === 'attended'}
                  className={`px-3 py-1 text-xs rounded ${
                    p.status === 'attended'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {p.status === 'attended' ? 'Checked' : 'Check-In'}
                </button>
              </td>

              <td className="p-3">{p.name}</td>
              <td className="p-3">{p.email}</td>
              <td className="p-3">{p.company}</td>
              <td className="p-3">{p.id.substring(0, 8).toUpperCase()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;

