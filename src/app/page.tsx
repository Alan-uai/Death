
'use client';

import { useState, useEffect } from 'react';
import { DiscordLayout } from '@/components/discord-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DiscordLogoIcon } from '@/components/discord-logo-icon';
import { getBotGuildsAction } from '@/app/actions';
import type { DiscordGuild } from '@/lib/types';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [botGuilds, setBotGuilds] = useState<string[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<DiscordGuild | null>(null);
  const [oauthUrl, setOauthUrl] = useState('');
  const [botInviteBaseUrl, setBotInviteBaseUrl] = useState('');
  const [showInviteMessage, setShowInviteMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectUri = window.location.origin;
    setOauthUrl(`https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify%20guilds`);
    setBotInviteBaseUrl(`https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`);

    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        localStorage.setItem('discord_access_token', accessToken);
        window.location.hash = '';
        setIsLoggedIn(true);
      }
    } else if (localStorage.getItem('discord_access_token')) {
      setIsLoggedIn(true);
    } else {
      setIsLoading(false);
    }
    
    const storedGuild = localStorage.getItem('selected_guild');
    if (storedGuild) {
        setSelectedGuild(JSON.parse(storedGuild));
    }

  }, []);

  useEffect(() => {
    const checkPendingInvite = async () => {
        const pendingGuildId = localStorage.getItem('pending_guild_id');
        if (pendingGuildId) {
          const currentBotGuilds = await getBotGuildsAction();
          const currentBotGuildIds = currentBotGuilds.map(g => g.id);
          setBotGuilds(currentBotGuildIds);

          if (currentBotGuildIds.includes(pendingGuildId)) {
            localStorage.removeItem('pending_guild_id');
            setShowInviteMessage(false);
            const guild = guilds.find(g => g.id === pendingGuildId);
            if (guild) {
              handleSelect(guild);
            }
          }
        }
    };

    if (isLoggedIn && !selectedGuild) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('discord_access_token');
        if (!token) {
          setIsLoading(false);
          setIsLoggedIn(false);
          return;
        }

        try {
          const [userGuildsResponse, botGuildsResponse] = await Promise.all([
            fetch('https://discord.com/api/v10/users/@me/guilds', {
              headers: { Authorization: `Bearer ${token}` },
            }),
            getBotGuildsAction()
          ]);

          if (userGuildsResponse.ok) {
            const userGuildsData: any[] = await userGuildsResponse.json();
            const manageableGuilds = userGuildsData.filter(g => (parseInt(g.permissions) & 0x20) === 0x20);
            setGuilds(manageableGuilds);
          } else {
             if (userGuildsResponse.status === 401 || userGuildsResponse.status === 403) {
                localStorage.removeItem('discord_access_token');
                setIsLoggedIn(false);
             }
          }
          
          const botGuildIds = botGuildsResponse.map(g => g.id);
          setBotGuilds(botGuildIds);
        } catch (error) {
          console.error('Erro ao buscar dados iniciais:', error);
        } finally {
            setIsLoading(false);
        }
      };
      fetchInitialData();
    } else if(!isLoggedIn) {
        setIsLoading(false);
    }
    
    const interval = setInterval(() => {
        if (localStorage.getItem('pending_guild_id')) {
            checkPendingInvite();
        } else {
            clearInterval(interval);
        }
    }, 5000);

    return () => clearInterval(interval);

  }, [isLoggedIn, selectedGuild, guilds]);

  const handleLogin = () => {
    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('discord_access_token');
    localStorage.removeItem('selected_guild');
    setIsLoggedIn(false);
    setGuilds([]);
    setSelectedGuild(null);
  };
  
  const handleInvite = (guild: DiscordGuild) => {
    if (botInviteBaseUrl) {
      const inviteUrl = `${botInviteBaseUrl}&guild_id=${guild.id}&disable_guild_select=true`;
      localStorage.setItem('pending_guild_id', guild.id);
      window.open(inviteUrl, '_blank');
      setShowInviteMessage(true);
    }
  };

  const handleSelect = (guild: DiscordGuild) => {
    localStorage.setItem('selected_guild', JSON.stringify(guild));
    setSelectedGuild(guild);
  }

  const handleGoBack = () => {
    localStorage.removeItem('selected_guild');
    setSelectedGuild(null);
    setShowInviteMessage(false);
  };
  
  if (selectedGuild) {
    return <DiscordLayout guild={selectedGuild} onGoBack={handleGoBack} />;
  }

  if (isLoading) {
    return (
         <main className="flex min-h-screen flex-col items-center justify-center bg-[#36393f] p-8">
            <Card className="w-full max-w-md bg-[#2f3136] text-white shadow-2xl border-none">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary animate-pulse">
                       <DiscordLogoIcon className="h-12 w-12 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Carregando seus servidores...</CardTitle>
                    <CardDescription className="text-gray-400">
                        Por favor, aguarde enquanto buscamos suas informações.
                    </CardDescription>
                </CardHeader>
            </Card>
        </main>
    );
  }

  if (!isLoggedIn) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#36393f] p-8">
            <Card className="w-full max-w-md bg-[#2f3136] text-white shadow-2xl border-none">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                       <DiscordLogoIcon className="h-12 w-12 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Configure seu Bot do Discord</CardTitle>
                    <CardDescription className="text-gray-400">
                        Faça login com sua conta do Discord para selecionar um servidor e configurar o bot.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Button onClick={handleLogin} className="w-full max-w-xs bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold" disabled={!oauthUrl}>
                        Login com Discord
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
  }

  return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#36393f] p-8">
          <Card className="w-full max-w-lg bg-[#2f3136] text-white shadow-2xl border-none">
              <CardHeader>
                  <CardTitle>Selecione um Servidor</CardTitle>
                  <CardDescription className="text-gray-400">
                      {showInviteMessage 
                        ? 'Após adicionar o bot, esta página será atualizada automaticamente.'
                        : "Escolha um servidor para convidar o bot, ou selecione um onde ele já está presente."
                      }
                  </CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                      {guilds.length > 0 ? (
                          guilds.map(guild => {
                            const isBotMember = botGuilds.includes(guild.id);
                            return (
                              <div key={guild.id} className="flex items-center justify-between rounded-lg bg-[#36393f] p-3">
                                  <div className="flex items-center space-x-3">
                                      {guild.icon ? (
                                        <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} alt={guild.name} className="h-10 w-10 rounded-full" />
                                      ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                            {guild.name.charAt(0)}
                                        </div>
                                      )}
                                      <span className="font-medium">{guild.name}</span>
                                  </div>
                                  {isBotMember ? (
                                    <Button onClick={() => handleSelect(guild)} className="bg-green-600 hover:bg-green-700">
                                      Selecionar
                                    </Button>
                                  ) : (
                                    <Button onClick={() => handleInvite(guild)} className="bg-primary hover:bg-primary/80" disabled={!botInviteBaseUrl}>
                                        Adicionar Bot
                                    </Button>
                                  )}
                              </div>
                            )
                          })
                      ) : (
                          <p className="text-muted-foreground">Nenhum servidor gerenciável encontrado. Certifique-se de estar logado na conta correta do Discord e ter permissões de 'Gerenciar Servidor'.</p>
                      )}
                  </div>
              </CardContent>
               <CardFooter className="flex justify-end pt-4">
                  <Button variant="destructive" onClick={handleLogout}>Sair</Button>
              </CardFooter>
          </Card>
      </main>
  );
}

    