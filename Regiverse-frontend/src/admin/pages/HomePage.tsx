import React from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './home/components/HeroBanner';
import FeaturedEventsGrid from './home/components/FeaturedEventsGrid';
import CategoryFilters from './home/components/CategoryFilters';
import FeaturedSidebar from './home/components/FeaturedSidebar';


const HomePage: React.FC = () => {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <HeroBanner />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <CategoryFilters />
          </div>
          <div className="lg:col-span-6">
            <FeaturedEventsGrid />
          </div>
          <div className="lg:col-span-3">
            <FeaturedSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
