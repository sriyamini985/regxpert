import React from 'react';
import EventCard from './EventCard';

const FeaturedEventsGrid: React.FC = () => {
  const events = [
    { title: 'Tech Conference 2024', date: 'March 15, 2024', imageUrl: 'https://via.placeholder.com/300', participantCount: 1547 },
    { title: 'Product Launch Event', date: 'April 20, 2024', imageUrl: 'https://via.placeholder.com/300', participantCount: 300 },
    { title: 'Annual Summit 2024', date: 'May 10, 2024', imageUrl: 'https://via.placeholder.com/300', participantCount: 750 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event, index) => (
        <EventCard key={index} {...event} />
      ))}
    </div>
  );
};

export default FeaturedEventsGrid;
