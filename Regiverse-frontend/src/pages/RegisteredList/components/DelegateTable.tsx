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
};

const DelegateTable = ({ data }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto hide-print">
      <table className="w-full text-sm min-w-[1200px]">
        <thead className="bg-gray-100 text-left">
          <tr>
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
            <tr key={p._id} className="border-t">
              <td className="p-3">
                <button className="px-3 py-1 bg-orange-500 text-white rounded">
                  Edit
                </button>
              </td>
              <td className="p-3">{p.name || "-"}</td>
              <td className="p-3">{p.email || "-"}</td>
              <td className="p-3">{p.phone || "-"}</td>
              <td className="p-3">{p.regId || p._id}</td>
              <td className="p-3">{p.category || "-"}</td>
              <td className="p-3">{p.state || "-"}</td>
              <td className="p-3">{p.reference || "-"}</td>
              <td className="p-3">{p.medicalCouncilNumber || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DelegateTable;