import BadgesBarChart from "./charts/BadgesBarChart";
import MealsPieChart from "./charts/MealsPieChart";
import KitBagChart from "./charts/KitBagChart";
import CertificatesChart from "./charts/CertificatesChart";

interface ChartsSectionProps {
  data: {
    badges: {
      printed: number;
      notPrinted: number;
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <BadgesBarChart data={data.badges} />
      <MealsPieChart data={data.meals} />
      <KitBagChart data={data.kitbags} />
      <CertificatesChart data={data.certificates} />
    </div>
  );
};

export default ChartsSection;
