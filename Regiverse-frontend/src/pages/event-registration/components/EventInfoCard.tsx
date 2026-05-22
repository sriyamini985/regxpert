import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { EventInfoCardProps } from '../types';
import ProgressBar from './ProgressBar';

const EventInfoCard: React.FC<EventInfoCardProps> = ({ event, isExpanded, onToggle }) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="lg:hidden w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors duration-150"
        aria-expanded={isExpanded}
      >
        <span className="font-semibold text-foreground">Event Details</span>
        <Icon
          name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
          size={20}
          className="text-muted-foreground"
        />
      </button>

      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="relative h-64 overflow-hidden">
          <Image
            src={event.image}
            alt={event.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {event.category}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{event.title}</h1>
            <p className="text-sm text-muted-foreground">Organized by {event.organizer}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Icon name="Calendar" size={20} className="text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{event.date}</p>
                <p className="text-sm text-muted-foreground">{event.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="MapPin" size={20} className="text-primary mt-0.5" />
              <p className="text-foreground">{event.location}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h2 className="font-semibold text-foreground mb-2">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>

          <div className="pt-4 border-t border-border">
            <ProgressBar
              current={event.registered}
              total={event.capacity}
              label="Registration Status"
            />
          </div>

          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <Icon name="Shield" size={20} className="text-primary" />
            <p className="text-sm text-muted-foreground">
              Your data is secure and will only be used for event management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventInfoCard;