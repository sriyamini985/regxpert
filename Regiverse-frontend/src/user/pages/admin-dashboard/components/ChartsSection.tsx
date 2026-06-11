import BadgesBarChart from "./charts/BadgesBarChart";
import MealsPieChart from "./charts/MealsPieChart";
import KitBagChart from "./charts/KitBagChart";
import CertificatesChart from "./charts/CertificatesChart";

// Look for your ChartsSectionProps interface at the top of ChartsSection.tsx
interface ChartsSectionProps {
  data: {
    badges: {
      printed: number;
      notPrinted: number; // 👈 CHANGE THIS FROM 'issued' TO 'notPrinted'
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

// Inside the component rendering section, ensure it passes data down cleanly:
const ChartsSection = ({ data }: ChartsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Ensure your BadgesBarChart receives the clean object */}
      <BadgesBarChart data={data.badges} />
      
      {/* ... other charts (meals, kitbags, etc.) ... */}
    </div>
  );
};

export default ChartsSection;

