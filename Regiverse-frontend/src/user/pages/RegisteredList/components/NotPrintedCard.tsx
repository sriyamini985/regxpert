const NotPrintedCard = ({ value }: { value: number }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
      <div className="bg-orange-100 p-3 rounded-lg text-xl">⏱️</div>
      <div>
        <p className="text-sm text-gray-500">Not printed</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
    </div>
  );
};

export default NotPrintedCard;