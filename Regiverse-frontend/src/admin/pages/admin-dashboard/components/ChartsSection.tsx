import BadgesBarChart from "./charts/BadgesBarChart";
import MealsPieChart from "./charts/MealsPieChart";
import KitBagChart from "./charts/KitBagChart";
import CertificatesChart from "./charts/CertificatesChart";
import HallScanChart from "./charts/HallScanChart";
import MonoScanChart from "./charts/MonoScanChart";
import WorkshopScanChart from "./charts/WorkshopScanChart";

const ChartsSection = ({ data }: { data: any }) => {
  // Graceful safety fallbacks preventing charting render crashes
  const badgesData = data?.badges || { printed: 0, issued: 0 };
  const mealsData = data?.meals || { breakfast: 0, lunch: 0, dinner: 0 };
  const kitbagsData = data?.kitbags || { given: 0, pending: 0 };
  const certificatesData = data?.certificates || { issued: 0, pending: 0 };
  const hallData = data?.hallScans || data?.hallScan || { entry: 0, exit: 0 };
  const monoData = data?.monoScans || data?.monoScan || { active: 0, total: 0 };
  const workshopData = data?.workshopScans || data?.workshopScan || { active: 0, total: 0 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <BadgesBarChart data={badgesData} />
      <MealsPieChart data={mealsData} />
      <KitBagChart data={kitbagsData} />
      <CertificatesChart data={certificatesData} />
      <HallScanChart data={hallData} />
      <MonoScanChart data={monoData} />
      <WorkshopScanChart data={workshopData} />
    </div>
  );
};

export default ChartsSection;