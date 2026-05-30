interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options?: string[]; // SAFE
}

const FormSelect = ({ label, value, onChange, options = [] }: Props) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
      >
        <option value="">Select {label}</option>

        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormSelect;