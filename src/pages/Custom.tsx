import React from 'react';
import { AppProvider } from '@/contexts/AppContext';
import BotanicCareApp from '@/components/BotanicCareApp';

const Custom: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-pink-50 p-4">
        <BotanicCareApp />
      </div>
    </AppProvider>
  );
};

export default Custom; 