
'use client';

import { useState, useEffect } from 'react';
import { Bot, ChevronDown, Gamepad2, Hash, Speaker, UserCircle } from 'lucide-react';
import { ChatPanel } from '@/components/chat-panel';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserAvatar } from './user-avatar';
import { getBotStatusAction } from '@/app/actions';
import { DiscordLogoIcon } from '@/components/discord-logo-icon';

const initialChannels = {
  text: [
    { id: 'welcome', name: 'welcome' },
    { id: 'q-and-a', name: 'q-and-a' },
    { id: 'build-suggestions', name: 'build-suggestions' },
    { id: 'game-stats', name: 'game-stats' },
  ],
  voice: [
    { id: 'general-voice', name: 'General' },
    { id: 'gaming-lounge', name: 'Gaming Lounge' },
  ]
};


export function DiscordLayout() {
  const [activeChannel, setActiveChannel] = useState('welcome');
  const [botStatus, setBotStatus] = useState('Connecting...');

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getBotStatusAction();
      setBotStatus(status);
    };
    fetchStatus();
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full text-sm text-muted-foreground">
        <div className="flex flex-col items-center space-y-2 bg-[#202225] p-2">
          <Tooltip>
            <TooltipTrigger>
              <div className="group relative">
                <div className="absolute -left-2 h-10 w-1 rounded-r-full bg-primary transition-all duration-200" />
                <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl bg-primary/20 text-primary transition-all duration-200 group-hover:rounded-2xl">
                  <DiscordLogoIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Your Server</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex w-60 flex-col bg-[#2f3136]">
          <div className="flex h-12 items-center px-4 font-bold text-white shadow-md">
            Your Server Name
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-2">
            <div className="space-y-1">
              <button className="flex w-full items-center px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-white">
                <ChevronDown className="mr-1 h-3 w-3" />
                Text Channels
              </button>
              {initialChannels.text.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={cn(
                    'group flex w-full items-center rounded-md px-2 py-1 transition-colors hover:bg-card hover:text-white',
                    activeChannel === channel.id && 'bg-card text-white'
                  )}
                >
                  <Hash className="mr-2 h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{channel.name}</span>
                </button>
              ))}
            </div>
            <div className="space-y-1 pt-2">
              <button className="flex w-full items-center px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-white">
                <ChevronDown className="mr-1 h-3 w-3" />
                Voice Channels
              </button>
              {initialChannels.voice.map((channel) => (
                <div
                  key={channel.id}
                  className='group flex w-full items-center rounded-md px-2 py-1'
                >
                  <Speaker className="mr-2 h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{channel.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-14 items-center bg-[#292b2f] p-2">
             <div className="flex items-center">
              <div className="relative">
                <UserAvatar username="Death" />
                <span className={cn(
                  "absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-[#292b2f]",
                  botStatus === 'Online' ? 'bg-green-500' : 'bg-gray-500',
                )} />
              </div>
              <div className="ml-2">
                <div className="text-sm font-semibold text-white">Death</div>
                <div className="text-xs text-muted-foreground">{botStatus}</div>
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
