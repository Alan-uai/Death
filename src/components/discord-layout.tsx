
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
import { getBotStatusAction, getGuildChannelsAction } from '@/app/actions';
import { DiscordLogoIcon } from '@/components/discord-logo-icon';
import type { DiscordChannel } from '@/services/discord';

// This is a mock guild ID. In a real app, you'd get this after the bot joins a server.
const MOCK_GUILD_ID = '123456789012345678';

interface ChannelList {
  text: DiscordChannel[];
  voice: DiscordChannel[];
}

export function DiscordLayout() {
  const [activeChannel, setActiveChannel] = useState('welcome');
  const [channels, setChannels] = useState<ChannelList>({ text: [], voice: [] });
  const [botStatus, setBotStatus] = useState('Connecting...');

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getBotStatusAction();
      setBotStatus(status);
    };
    fetchStatus();

    const fetchChannels = async () => {
      // For the prototype, we can't know the actual server ID the user
      // invited the bot to. We'll use a placeholder and rely on the
      // bot token being for a server it's already in.
      // A real implementation would get the guild ID from a webhook
      // after the bot is invited.
      const allChannels = await getGuildChannelsAction(MOCK_GUILD_ID);
      
      const textChannels = allChannels.filter(c => c.type === 0 && c.name === 'general');
      const voiceChannels = allChannels.filter(c => c.type === 2);
      
      const welcomeChannel: DiscordChannel = { id: 'welcome', name: 'welcome', type: 0 };
      const qnaChannel = allChannels.find(c => c.name === 'q-and-a') || {id: 'q-and-a', name: 'q-and-a', type: 0};
      const buildChannel = allChannels.find(c => c.name === 'build-suggestions') || {id: 'build-suggestions', name: 'build-suggestions', type: 0};
      const statsChannel = allChannels.find(c => c.name === 'game-stats') || {id: 'game-stats', name: 'game-stats', type: 0};

      const finalChannels = {
        text: [welcomeChannel, qnaChannel, buildChannel, statsChannel, ...textChannels.filter(c => !['q-and-a', 'build-suggestions', 'game-stats'].includes(c.name))],
        voice: voiceChannels
      };

      // Set a default active channel if the initial one doesn't exist
      if (finalChannels.text.length > 0) {
        setActiveChannel(finalChannels.text[0].id);
      } else if (finalChannels.voice.length > 0) {
         setActiveChannel(finalChannels.voice[0].id);
      }
      
      setChannels(finalChannels);
    };

    fetchChannels().catch(console.error);

  }, []);

  const activeChannelName = 
    channels.text.find(c => c.id === activeChannel)?.name ||
    channels.voice.find(c => c.id === activeChannel)?.name ||
    'channel';

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
            {channels.text.length > 0 && (<div className="space-y-1">
              <button className="flex w-full items-center px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-white">
                <ChevronDown className="mr-1 h-3 w-3" />
                Text Channels
              </button>
              {channels.text.map((channel) => (
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
            </div>)}
            {channels.voice.length > 0 && (<div className="space-y-1 pt-2">
              <button className="flex w-full items-center px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-white">
                <ChevronDown className="mr-1 h-3 w-3" />
                Voice Channels
              </button>
              {channels.voice.map((channel) => (
                <div
                  key={channel.id}
                  className='group flex w-full items-center rounded-md px-2 py-1'
                >
                  <Speaker className="mr-2 h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{channel.name}</span>
                </div>
              ))}
            </div>)}
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
            <span className="ml-2 font-semibold text-white">{activeChannelName}</span>
          </div>
          <ChatPanel channelId={activeChannel} key={activeChannel} />
        </div>
      </div>
    </TooltipProvider>
  );
}
