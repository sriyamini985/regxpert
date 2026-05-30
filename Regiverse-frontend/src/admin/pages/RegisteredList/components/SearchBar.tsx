interface Props {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  onClear,
}: Props) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow space-y-4">
      <p className="font-medium">Search delegate</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 w-full"
          placeholder="Enter name, email, phone, ID..."
        />

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onSearch}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Search
          </button>

          <button
            onClick={onClear}
            className="flex-1 sm:flex-none px-4 py-2 border rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;