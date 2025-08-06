
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  username: string;
  className?: string;
}

export function UserAvatar({ username, className }: UserAvatarProps) {
  const isBot = username.toLowerCase().includes('bot');

  return (
    <Avatar className={cn('h-10 w-10 border-2', isBot ? 'border-primary' : 'border-secondary', className)}>
       <AvatarImage
        src={`https://placehold.co/40x40/${isBot ? 'FF1493' : 'B2FF66'}/FFFFFF.png?text=${username.charAt(0).toUpperCase()}`}
        alt={username}
      />
      <AvatarFallback>
        {isBot ? <Bot className="h-6 w-6 text-primary" /> : <User className="h-6 w-6" />}
      </AvatarFallback>
    </Avatar>
  );
}
