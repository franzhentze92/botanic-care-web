import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserDropdownMenuProps {
  userName: string;
  userEmail: string;
  isAuthorizedAdmin: boolean;
  onSignOut: () => void;
}

const UserDropdownMenuComponent: React.FC<UserDropdownMenuProps> = ({
  userName,
  userEmail,
  isAuthorizedAdmin,
  onSignOut,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-semibold font-gilda-display">
            {userName}
          </p>
          <p className="text-xs text-gray-500 font-body">{userEmail}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer font-body">
            <User className="mr-2 h-4 w-4" />
            Mi Cuenta
          </Link>
        </DropdownMenuItem>
        {isAuthorizedAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer font-body">
              <Settings className="mr-2 h-4 w-4" />
              Administración
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onSelect={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              await onSignOut();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          }} 
          className="cursor-pointer text-red-600 font-body focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Memoizar el componente para evitar re-renders innecesarios
export const UserDropdownMenu = memo(UserDropdownMenuComponent);

