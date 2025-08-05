
'use client';

import { useState } from 'react';
import { Bot, Gamepad2, Hash, UserCircle } from 'lucide-react';
import { ChatPanel } from '@/components/chat-panel';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const channels = [
  { id: 'welcome', name: 'welcome', icon: Hash },
  { id: 'q-and-a', name: 'q-and-a', icon: Hash },
  { id: 'build-suggestions', name: 'build-suggestions', icon: Hash },
  { id: 'game-stats', name: 'game-stats', icon: Hash },
];

export function DiscordLayout() {
  const [activeChannel, setActiveChannel] = useState('welcome');

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full text-sm text-muted-foreground">
        <div className="flex flex-col items-center space-y-2 bg-[#202225] p-2">
          <Tooltip>
            <TooltipTrigger>
              <div className="group relative">
                <div className="absolute -left-2 h-10 w-1 rounded-r-full bg-primary transition-all duration-200" />
                <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all duration-200 group-hover:rounded-2xl">
                  <Gamepad2 className="h-7 w-7" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Echo Game Server</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex w-60 flex-col bg-[#2f3136]">
          <div className="flex h-12 items-center px-4 font-bold text-white shadow-md">
            Echo Game Bot
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-2">
            <span className="px-2 text-xs font-semibold uppercase tracking-wider">
              Text Channels
            </span>
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={cn(
                  'group flex w-full items-center rounded-md px-2 py-1 transition-colors hover:bg-card hover:text-white',
                  activeChannel === channel.id && 'bg-card text-white'
                )}
              >
                <channel.icon className="mr-2 h-5 w-5" />
                <span className="font-medium">{channel.name}</span>
              </button>
            ))}
          </div>
          <div className="flex h-14 items-center bg-[#292b2f] p-2">
             <div className="flex items-center">
              <div className="relative">
                <UserCircle className="h-9 w-9 text-white" />
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-[#292b2f] bg-green-500" />
              </div>
              <div className="ml-2">
                <div className="text-sm font-semibold text-white">PlayerOne</div>
                <div className="text-xs text-muted-foreground">Online</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col bg-[#36393f]">
          <div className="flex h-12 items-center border-b border-border px-4 shadow-md">
            <Hash className="h-6 w-6 text-muted-foreground" />
            <span className="ml-2 font-semibold text-white">{activeChannel}</span>
          </div>
          <ChatPanel channelId={activeChannel} key={activeChannel} />
        </div>
      </div>
    </TooltipProvider>
  );
}
