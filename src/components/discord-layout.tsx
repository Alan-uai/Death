'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bot, Cog, MessageSquare, Users, BarChart, Menu, Landmark } from 'lucide-react';
import { ChatPanel } from '@/components/chat-panel';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getGuildChannelsAction } from '@/app/actions';
import type { DiscordChannel, DiscordGuild } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from './settings-panel';
import { CustomCommandsPanel } from './custom-commands-panel';
import { ChannelManagerPanel } from './channel-manager-panel';
import { BotPersonalityPanel } from './bot-personality-panel';
import { AnalyticsPanel } from './analytics-panel';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

type Panel = 'chat' | 'settings' | 'commands' | 'channels' | 'personality' | 'analytics';

interface DiscordLayoutProps {
    guild: DiscordGuild;
    onGoBack: () => void;
}

export function DiscordLayout({ guild, onGoBack }: DiscordLayoutProps) {
  const [activePanel, setActivePanel] = useState<Panel>('chat');
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const panelComponents: Record<Panel, React.FC<any>> = {
    chat: ChatPanel,
    settings: SettingsPanel,
    commands: (props) => <CustomCommandsPanel {...props} guildId={guild.id} />,
    channels: (props) => <ChannelManagerPanel {...props} guildId={guild.id} />,
    personality: BotPersonalityPanel,
    analytics: AnalyticsPanel,
  };

  const navItems = [
      { id: 'chat', label: 'Simulador de Chat', icon: MessageSquare },
      { id: 'settings', label: 'Configurações', icon: Cog },
      { id: 'commands', label: 'Comandos Customizados', icon: Users },
      { id: 'channels', label: 'Gerenciador de Canais', icon: Landmark },
      { id: 'personality', label: 'Personalidade do Bot', icon: Bot },
      { id: 'analytics', label: 'Analytics', icon: BarChart },
  ];

  useEffect(() => {
    const fetchChannels = async () => {
      if (!guild.id) return;
      const allChannels = await getGuildChannelsAction(guild.id);
      setChannels(allChannels);
    };

    fetchChannels().catch(console.error);

  }, [guild.id]);

  const guildIcon = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null;

  const handlePanelChange = (panel: Panel) => {
    setActivePanel(panel);
    setIsSheetOpen(false); // Fecha o menu mobile ao selecionar uma opção
  }

  const renderNav = () => (
    <nav className="flex flex-col space-y-2 p-4">
      <h2 className="mb-4 px-2 text-lg font-semibold tracking-tight">Painel</h2>
      <div className="space-y-1">
         {navItems.map(item => (
            <Button
                key={item.id}
                variant={activePanel === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handlePanelChange(item.id as Panel)}
            >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
            </Button>
        ))}
      </div>
    </nav>
  );

  const ActivePanelComponent = panelComponents[activePanel];

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-[#36393f] text-sm text-white">
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-12 flex-shrink-0 items-center border-b border-black/20 px-4 shadow-md">
              <div className="flex items-center">
                <div className="md:hidden mr-2">
                   <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[240px] bg-[#2f3136] border-r border-black/20 p-0 pt-4">
                      {renderNav()}
                    </SheetContent>
                  </Sheet>
                </div>
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
                        <p>Selecionar outro servidor</p>
                    </TooltipContent>
                </Tooltip>
              </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Vertical Navigation Sidebar for Desktop */}
            <div className="hidden md:block w-60 flex-shrink-0 border-r border-black/20 bg-[#2f3136]">
              {renderNav()}
            </div>
            
            {/* Panel Content */}
            <main className="flex-1 overflow-y-auto">
              <ActivePanelComponent channels={channels} guildId={guild.id} />
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
