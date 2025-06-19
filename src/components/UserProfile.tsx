
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

export const UserProfile = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.user_metadata?.avatar_url} />
        <AvatarFallback className="bg-blue-600 text-white text-xs">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {displayName}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {user.email}
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        className="text-gray-400 hover:text-white hover:bg-gray-700"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};
