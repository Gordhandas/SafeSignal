import React, { useState, useEffect, useCallback } from 'react';
import { User, Location, Notification } from '../types';
import useOnlineStatus from '../hooks/useOnlineStatus';
import useGeolocation from '../hooks/useGeolocation';
import FamilyMemberCard from './FamilyMemberCard';
import { generateSafetyMessage } from '../services/geminiService';
import { LogoutIcon, ShieldCheckIcon, SparklesIcon, CopyIcon, UserGroupIcon, SignalIcon, WifiOffIcon, CogIcon, PhoneIcon } from './icons';
import NotificationBanner from './NotificationBanner';

interface DashboardProps {
  currentUser: User;
  familyMembers: User[];
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, familyMembers: initialFamilyMembers, onLogout }) => {
  const [family, setFamily] = useState<User[]>(initialFamilyMembers);
  const [isGenerating, setIsGenerating] = useState(false);
  const [safetyMessage, setSafetyMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isMessageCopied, setIsMessageCopied] = useState(false);
  const [statusMode, setStatusMode] = useState<'auto' | 'online' | 'offline'>('auto');

  const isOnline = useOnlineStatus();
  const currentLocation = useGeolocation();

  const updateUserState = useCallback((status: 'online' | 'offline', location: Location | null) => {
    setFamily(prevFamily =>
      prevFamily.map(member =>
        member.isCurrentUser
          ? { ...member, status, lastLocation: location ?? member.lastLocation }
          : member
      )
    );
  }, []);

  useEffect(() => {
    if (statusMode !== 'auto') return;

    const wasOffline = localStorage.getItem('wasOffline') === 'true';
    if (isOnline) {
      if (wasOffline) {
        addNotification("You're back online! Your status has been updated.", 'success');
        handleGenerateMessage();
        localStorage.removeItem('wasOffline');
      }
      updateUserState('online', currentLocation);
    } else {
      addNotification("You're offline. Your last known location will be shared when you reconnect.", 'warning');
      localStorage.setItem('wasOffline', 'true');
      updateUserState('offline', currentLocation);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, currentLocation, updateUserState, statusMode]);
  
  const addNotification = (message: string, type: Notification['type']) => {
    setNotification({ id: Date.now(), message, type });
  };
  
  const handleStatusModeChange = (mode: 'auto' | 'online' | 'offline') => {
    setStatusMode(mode);
    let newStatus: 'online' | 'offline';
    let notificationMessage = '';
  
    switch (mode) {
      case 'online':
        newStatus = 'online';
        notificationMessage = "Your status is manually set to Online. Automatic updates are paused.";
        break;
      case 'offline':
        newStatus = 'offline';
        notificationMessage = "Your status is manually set to Offline. Automatic updates are paused.";
        break;
      case 'auto':
      default:
        newStatus = isOnline ? 'online' : 'offline';
        notificationMessage = "Your status is now in Auto mode, reflecting your network connection.";
        break;
    }
    
    updateUserState(newStatus, currentLocation);
    addNotification(notificationMessage, 'info');
  };

  const handleGenerateMessage = async () => {
    setIsGenerating(true);
    setSafetyMessage(null);
    try {
      const userForMessage = family.find(m => m.isCurrentUser);
      if(!userForMessage) throw new Error("Current user not found");
      
      const message = await generateSafetyMessage(userForMessage.name, userForMessage.lastLocation);
      setSafetyMessage(message);
    } catch (error) {
      console.error("Error generating message:", error);
      addNotification('Could not generate AI message. Please try again.', 'warning');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMessage = () => {
    if (safetyMessage) {
      navigator.clipboard.writeText(safetyMessage);
      setIsMessageCopied(true);
      setTimeout(() => setIsMessageCopied(false), 2000);
    }
  };

  const handleSendSafetyPing = () => {
    addNotification("Safety Ping sent to your family.", 'success');

    setFamily(prevFamily =>
        prevFamily.map(member =>
            !member.isCurrentUser ? { ...member, isPinging: true } : member
        )
    );

    setTimeout(() => {
        setFamily(prevFamily =>
            prevFamily.map(member => ({ ...member, isPinging: false }))
        );
    }, 4000); // Ping is visible for 4 seconds
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:911';
  };

  const currentUserForDisplay = family.find(m => m.isCurrentUser);
  const currentUserIsOnline = currentUserForDisplay?.status === 'online';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-blue-900 text-slate-800 dark:text-slate-200">
      <header className="p-4 flex justify-between items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-sm">
        <h1 className="text-xl font-bold font-poppins text-blue-600 dark:text-blue-400">SafeSignal</h1>
        <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${currentUserIsOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                {currentUserIsOnline ? 'Online' : 'Offline'}
            </span>
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <LogoutIcon className="w-5 h-5" />
            </button>
        </div>
      </header>
      
      <main className="p-4 md:p-6 lg:p-8">
        {notification && <NotificationBanner notification={notification} onClose={() => setNotification(null)} />}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                        <UserGroupIcon className="w-6 h-6 mr-3 text-blue-500"/>
                        <h2 className="text-2xl font-bold">Family Dashboard</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {family.map(member => (
                            <FamilyMemberCard key={member.id} member={member} />
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                    <h3 className="font-bold text-lg mb-4">Set Your Status</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button onClick={() => handleStatusModeChange('auto')} className={`flex flex-col items-center justify-center p-2 text-xs font-medium rounded-lg transition-colors ${statusMode === 'auto' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                            <CogIcon className="w-5 h-5 mb-1"/>
                            Auto
                        </button>
                        <button onClick={() => handleStatusModeChange('online')} className={`flex flex-col items-center justify-center p-2 text-xs font-medium rounded-lg transition-colors ${statusMode === 'online' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                            <SignalIcon className="w-5 h-5 mb-1"/>
                            Online
                        </button>
                        <button onClick={() => handleStatusModeChange('offline')} className={`flex flex-col items-center justify-center p-2 text-xs font-medium rounded-lg transition-colors ${statusMode === 'offline' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                            <WifiOffIcon className="w-5 h-5 mb-1"/>
                            Offline
                        </button>
                    </div>

                    <h3 className="font-bold text-lg mb-4 border-t border-slate-200 dark:border-slate-700 pt-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                          onClick={handleEmergencyCall}
                          className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                        >
                          <PhoneIcon className="w-5 h-5 mr-2" />
                          Emergency Contact
                        </button>
                        <button
                          onClick={handleGenerateMessage}
                          disabled={!isOnline || isGenerating}
                          className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                          <SparklesIcon className="w-5 h-5 mr-2" />
                          {isGenerating ? 'AI Generating...' : 'Notify I\'m Safe'}
                        </button>
                        <button 
                          onClick={handleSendSafetyPing}
                          className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg shadow-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 transform hover:scale-105"
                        >
                          <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-500" />
                          Send Safety Ping
                        </button>
                    </div>
                </div>

                {(isGenerating || safetyMessage) && (
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg animate-fade-in">
                        <h3 className="font-bold text-lg mb-4">Generated Message</h3>
                        {isGenerating ? (
                           <div className="flex items-center justify-center p-4">
                               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                               <p className="ml-3">Gemini is writing a message...</p>
                           </div>
                        ) : (
                            safetyMessage && (
                                <div className="text-sm p-4 bg-blue-50 dark:bg-slate-700/50 rounded-lg relative">
                                    <p className="whitespace-pre-wrap">{safetyMessage}</p>
                                    <button onClick={handleCopyMessage} className="absolute top-2 right-2 p-2 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">
                                        <CopyIcon className="w-4 h-4" />
                                    </button>
                                    {isMessageCopied && <span className="absolute bottom-2 right-2 text-xs bg-green-500 text-white px-2 py-1 rounded">Copied!</span>}
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;