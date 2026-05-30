const CompletionRateCard = ({ value }: { value: number }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
      <div className="bg-red-100 p-3 rounded-lg text-xl">✅</div>
      <div>
        <p className="text-sm text-gray-500">Completion rate</p>
        <h2 className="text-2xl font-bold">{value}%</h2>
      </div>
    </div>
  );
};

export default CompletionRateCard;