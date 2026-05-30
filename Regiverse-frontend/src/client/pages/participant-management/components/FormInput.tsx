interface Props {
  label: string;
  placeholder: string;
  prefix?: string;
}

const FormInput = ({ label, placeholder, prefix }: Props) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <div className="mt-1 flex">
        {prefix && (
          <span className="px-3 flex items-center bg-gray-100 border border-r-0 rounded-l-lg text-sm">
            {prefix}
          </span>
        )}

        <input
          placeholder={placeholder}
          className={`w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition ${
            prefix ? "rounded-l-none" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default FormInput;