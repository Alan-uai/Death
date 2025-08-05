
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bot, Cog, MessageSquare, Plus, Users, BarChart } from 'lucide-react';
import { ChatPanel } from '@/components/chat-panel';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getBotStatusAction, getGuildChannelsAction } from '@/app/actions';
import { DiscordLogoIcon } from '@/components/discord-logo-icon';
import type { DiscordChannel, DiscordGuild } from '@/services/discord';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from './settings-panel';


interface DiscordLayoutProps {
    guild: DiscordGuild;
    onGoBack: () => void;
}

export function DiscordLayout({ guild, onGoBack }: DiscordLayoutProps) {
  const [activePanel, setActivePanel] = useState('chat');
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [botStatus, setBotStatus] = useState('Connecting...');

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getBotStatusAction();
      setBotStatus(status);
    };
    fetchStatus();

    const fetchChannels = async () => {
      if (!guild.id) return;
      const allChannels = await getGuildChannelsAction(guild.id);
      setChannels(allChannels);
    };

    fetchChannels().catch(console.error);

  }, [guild.id]);

  const guildIcon = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null;

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-[#36393f] text-sm text-white">
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-12 flex-shrink-0 items-center border-b border-black/20 px-4 shadow-md">
              <div className="flex items-center">
                 {guildIcon ? (
                    <img src={guildIcon} alt={guild.name} className="h-8 w-8 rounded-full" />
                 ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {guild.name.charAt(0)}
                    </div>
                 )}
                <span className="ml-3 font-bold text-lg">{guild.name}</span>
              </div>
              <div className="ml-auto flex items-center">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onGoBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Select another server</p>
                    </TooltipContent>
                </Tooltip>
              </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Vertical Navigation Sidebar */}
            <nav className="w-60 flex-shrink-0 space-y-2 border-r border-black/20 bg-[#2f3136] p-4">
              <h2 className="mb-4 text-lg font-semibold">Dashboard</h2>
              <Button
                variant={activePanel === 'chat' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActivePanel('chat')}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat Simulator
              </Button>
              <Button
                variant={activePanel === 'settings' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActivePanel('settings')}
              >
                <Cog className="mr-2 h-5 w-5" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start" disabled>
                <Users className="mr-2 h-5 w-5" />
                Custom Commands
              </Button>
              <Button variant="ghost" className="w-full justify-start" disabled>
                <Plus className="mr-2 h-5 w-5" />
                Channel Manager
              </Button>
               <Button variant="ghost" className="w-full justify-start" disabled>
                <Bot className="mr-2 h-5 w-5" />
                Bot Personality
              </Button>
              <Button variant="ghost" className="w-full justify-start" disabled>
                <BarChart className="mr-2 h-5 w-5" />
                Analytics
              </Button>
            </nav>

            {/* Panel Content */}
            <main className="flex-1 overflow-y-auto">
              {activePanel === 'chat' && <ChatPanel channels={channels} />}
              {activePanel === 'settings' && <SettingsPanel channels={channels} />}
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
