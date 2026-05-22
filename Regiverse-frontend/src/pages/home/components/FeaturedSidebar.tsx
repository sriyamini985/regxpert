import React from 'react';

const FeaturedSidebar: React.FC = () => {
  const trendingEvents = [
    'AI in Marketing Summit',
    'The Future of Web Design',
    'Startup Pitch Night',
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Trending Events</h3>
      <ul>
        {trendingEvents.map((event, index) => (
          <li key={index} className="mb-2 text-foreground hover:text-primary transition-colors duration-200 cursor-pointer">
            {event}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeaturedSidebar;
