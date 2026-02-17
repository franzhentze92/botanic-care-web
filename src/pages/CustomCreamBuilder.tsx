import React from 'react';
import { AppProvider } from '@/contexts/AppContext';
import BotanicCareApp from '@/components/BotanicCareApp';
import Layout from '@/components/Layout';

const CustomCreamBuilder: React.FC = () => {
  return (
    <AppProvider>
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#fafaf9] via-white to-[#fafaf9]">
          <BotanicCareApp />
        </div>
      </Layout>
    </AppProvider>
  );
};

export default CustomCreamBuilder; 