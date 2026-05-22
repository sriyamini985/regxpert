import React from "react";
import { Participant } from "../types";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  suggestions: Participant[];
  onSelect: (user: Participant) => void;
}

const SearchBox: React.FC<Props> = ({
  value,
  onChange,
  onSearch,
  suggestions,
  onSelect,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4 relative">

      <input
        type="text"
        placeholder="Search by Name / Email / Reg ID"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-2 rounded mb-2"
      />

      {/* 🔍 Suggestions */}
      {value && suggestions.length > 0 && (
        <div className="absolute left-4 right-4 bg-white border rounded shadow max-h-40 overflow-y-auto z-10">
          {suggestions.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelect(user)}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {user.name} ({user.regId})
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onSearch}
        className="w-full bg-blue-600 text-white py-2 rounded mt-2"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBox;