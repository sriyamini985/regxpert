import BadgesBarChart from "../charts/BadgesBarChart";
// ... import your other charts here (Meals, Kitbags, etc.)
import CertificatesChart from "../charts/CertificatesChart";
import kitBagChart from "../charts/KitBagChart";
import MealsPieChart from "../charts/MealsPieChart";



interface ChartsSectionProps {
  data: {
    badges: {
      printed: number;
      notPrinted: number; // 👈 Verified match
    };
    meals: {
      breakfast: number;
      lunch: number;
      dinner: number;
    };
    kitbags: {
      given: number;
      pending: number;
    };
    certificates: {
      issued: number;
      pending: number;
    };
  };
}

const ChartsSection = ({ data }: ChartsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Line 34 will compile perfectly now since types align */}
      <BadgesBarChart data={data.badges} />
      
      {/* ... your other chart components here ... */}
    </div>
  );
};

export default ChartsSection;

