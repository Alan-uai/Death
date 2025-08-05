
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
    <Avatar className={cn('h-10 w-10', className)}>
      <AvatarImage
        src={`https://placehold.co/40x40/${isBot ? '39FF14' : 'B2FF66'}/000000.png?text=${username.charAt(0)}`}
        alt={username}
      />
      <AvatarFallback>
        {isBot ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
      </AvatarFallback>
    </Avatar>
  );
}
