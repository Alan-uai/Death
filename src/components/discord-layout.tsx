
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bot, Cog, MessageSquare, Plus, Users, BarChart, Menu } from 'lucide-react';
import { ChatPanel } from '@/components/chat-panel';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getBotStatusAction, getGuildChannelsAction } from '@/app/actions';
import type { DiscordChannel, DiscordGuild } from '@/services/discord';
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

const panelComponents: Record<Panel, React.FC<any>> = {
    chat: ChatPanel,
    settings: SettingsPanel,
    commands: CustomCommandsPanel,
    channels: ChannelManagerPanel,
    personality: BotPersonalityPanel,
    analytics: AnalyticsPanel,
};

export function DiscordLayout({ guild, onGoBack }: DiscordLayoutProps) {
  const [activePanel, setActivePanel] = useState<Panel>('chat');
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [botStatus, setBotStatus] = useState('Conectando...');
  const [isSheetOpen, setIsSheetOpen] = useState(false);


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

  const handlePanelChange = (panel: Panel) => {
    setActivePanel(panel);
    setIsSheetOpen(false); // Fecha o menu mobile ao selecionar uma opção
  }

  const renderNav = () => (
    <nav className="flex flex-col space-y-2 p-4">
      <h2 className="mb-4 text-lg font-semibold">Painel</h2>
      <Button
        variant={activePanel === 'chat' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => handlePanelChange('chat')}
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        Simulador de Chat
      </Button>
      <Button
        variant={activePanel === 'settings' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => handlePanelChange('settings')}
      >
        <Cog className="mr-2 h-5 w-5" />
        Configurações
      </Button>
      <Button
        variant={activePanel === 'commands' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => handlePanelChange('commands')}
      >
        <Users className="mr-2 h-5 w-5" />
        Comandos Customizados
      </Button>
      <Button
        variant={activePanel === 'channels' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => handlePanelChange('channels')}
      >
        <Plus className="mr-2 h-5 w-5" />
        Gerenciador de Canais
      </Button>
       <Button
        variant={activePanel === 'personality' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => handlePanelChange('personality')}
      >
        <Bot className="mr-2 h-5 w-5" />
        Personalidade do Bot
      </Button>
      <Button
        variant={activePanel === 'analytics' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => handlePanelChange('analytics')}
      >
        <BarChart className="mr-2 h-5 w-5" />
        Analytics
      </Button>
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
                    <SheetContent side="left" className="w-60 bg-[#2f3136] border-r border-black/20 p-0 pt-4">
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
              <ActivePanelComponent channels={channels} />
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
