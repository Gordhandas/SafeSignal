import React from 'react';
import { User } from '../types';
import { LocationMarkerIcon, BellIcon } from './icons';

interface FamilyMemberCardProps {
  member: User;
}

const timeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "m ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "just now";
};

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ member }) => {
  const isOnline = member.status === 'online';

  const cardClasses = `
    p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 shadow-md border
    transition-all duration-300
    ${member.isPinging
      ? 'border-blue-500 animate-pulse ring-2 ring-blue-500 ring-opacity-50'
      : 'border-slate-200 dark:border-slate-700'
    }
  `;
  
  return (
    <div className={cardClasses}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">{member.name}{member.isCurrentUser && " (You)"}</h3>
        <div className="flex items-center space-x-2">
          {member.isPinging && <BellIcon className="w-5 h-5 text-blue-500" />}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
            {member.status}
          </span>
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {member.lastLocation ? (
          <div className="flex items-start">
            <LocationMarkerIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p>Last seen {timeAgo(member.lastLocation.timestamp)}</p>
              <a 
                href={`https://www.google.com/maps?q=${member.lastLocation.lat},${member.lastLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-xs"
              >
                View on map ({member.lastLocation.lat.toFixed(2)}, {member.lastLocation.lng.toFixed(2)})
              </a>
            </div>
          </div>
        ) : (
          <p>Location not available.</p>
        )}
      </div>
    </div>
  );
};

export default FamilyMemberCard;