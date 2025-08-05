
'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Hash, Speaker } from 'lucide-react';
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


interface ChannelList {
  text: DiscordChannel[];
  voice: DiscordChannel[];
}

interface DiscordLayoutProps {
    guildId: string;
}

export function DiscordLayout({ guildId }: DiscordLayoutProps) {
  const [activeChannel, setActiveChannel] = useState('welcome');
  const [channels, setChannels] = useState<ChannelList>({ text: [], voice: [] });
  const [botStatus, setBotStatus] = useState('Connecting...');
  const [guildName, setGuildName] = useState('Your Server');
  const [guildIcon, setGuildIcon] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getBotStatusAction();
      setBotStatus(status);
    };
    fetchStatus();

    const fetchChannels = async () => {
      if (!guildId) return;
      const allChannels = await getGuildChannelsAction(guildId);
      
      const textChannels = allChannels.filter(c => c.type === 0);
      const voiceChannels = allChannels.filter(c => c.type === 2);

      const welcomeChannel: DiscordChannel = { id: 'welcome', name: 'welcome', type: 0 };
      const defaultChannels = [
          welcomeChannel,
          ...textChannels,
      ];
      
      const finalChannels = {
        text: defaultChannels,
        voice: voiceChannels
      };
      
      if (finalChannels.text.length > 0) {
        setActiveChannel(finalChannels.text[0].id);
      }
      
      setChannels(finalChannels);
    };
    
    const fetchGuildInfo = async () => {
        const token = localStorage.getItem('discord_access_token');
        if (!token || !guildId) return;
        
        try {
            const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const guildData = await response.json();
                setGuildName(guildData.name);
                if (guildData.icon) {
                    setGuildIcon(`https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.png`);
                }
            }
        } catch (error) {
            console.error('Error fetching guild info:', error);
        }
    };


    fetchChannels().catch(console.error);
    fetchGuildInfo().catch(console.error);

  }, [guildId]);

  const activeChannelName = 
    channels.text.find(c => c.id === activeChannel)?.name ||
    channels.voice.find(c => c.id === activeChannel)?.name ||
    'channel';

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full text-sm text-muted-foreground">
        {/* Server Icon Sidebar */}
        <div className="flex flex-col items-center space-y-2 bg-[#202225] p-2">
          <Tooltip>
            <TooltipTrigger>
              <div className="group relative">
                <div className="absolute -left-2 h-10 w-1 rounded-r-full bg-primary transition-all duration-200" />
                <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl bg-primary/20 text-primary transition-all duration-200 group-hover:rounded-2xl">
                 {guildIcon ? (
                    <img src={guildIcon} alt={guildName} className="h-full w-full rounded-2xl" />
                 ) : (
                    <DiscordLogoIcon className="h-8 w-8 text-white" />
                 )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{guildName}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Channel List and User Panel */}
        <div className="flex w-60 flex-col bg-[#2f3136]">
          <div className="flex h-12 items-center px-4 font-bold text-white shadow-md">
            {guildName}
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
                    'group flex w-full items-center rounded-md px-2 py-1 transition-colors hover:bg-[#36393f] hover:text-white',
                    activeChannel === channel.id && 'bg-[#40444b] text-white'
                  )}
                >
                  <Hash className="mr-2 h-5 w-5 text-gray-400" />
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
                  className='group flex w-full cursor-not-allowed items-center rounded-md px-2 py-1 text-gray-400'
                >
                  <Speaker className="mr-2 h-5 w-5 text-gray-400" />
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

        {/* Main Chat Panel */}
        <div className="flex flex-1 flex-col bg-[#36393f]">
          <div className="flex h-12 items-center border-b border-black/20 px-4 shadow-md">
            <Hash className="h-6 w-6 text-gray-400" />
            <span className="ml-2 font-semibold text-white">{activeChannelName}</span>
          </div>
          <ChatPanel channelId={activeChannel} key={activeChannel} />
        </div>
      </div>
    </TooltipProvider>
  );
}
