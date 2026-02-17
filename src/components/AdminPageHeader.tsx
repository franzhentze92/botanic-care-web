import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ 
  title, 
  description,
  actionButton 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-editorial-new mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-gray-600">
            {description}
          </p>
        )}
      </div>
      {actionButton && (
        <Button 
          onClick={actionButton.onClick}
          className="bg-[#7d8768] hover:bg-[#6a7559]"
        >
          {actionButton.icon && <actionButton.icon className="h-4 w-4 mr-2" />}
          {actionButton.label}
        </Button>
      )}
    </div>
  );
};

export default AdminPageHeader;

