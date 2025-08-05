
'use client';

import { useState, useEffect } from 'react';
import { DiscordLayout } from '@/components/discord-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DiscordLogoIcon } from '@/components/discord-logo-icon';
import { getBotGuildsAction } from '@/app/actions';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [botGuilds, setBotGuilds] = useState<string[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);
  const [oauthUrl, setOauthUrl] = useState('');
  const [botInviteBaseUrl, setBotInviteBaseUrl] = useState('');
  const [showInviteMessage, setShowInviteMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This code now runs only on the client
    const redirectUri = window.location.origin;
    setOauthUrl(`https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify%20guilds`);
    setBotInviteBaseUrl(`https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`);

    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        localStorage.setItem('discord_access_token', accessToken);
        window.location.hash = ''; // Clear the hash
        setIsLoggedIn(true);
      }
    } else if (localStorage.getItem('discord_access_token')) {
      setIsLoggedIn(true);
    } else {
      setIsLoading(false);
    }
    
    const storedGuild = localStorage.getItem('selected_guild_id');
    if (storedGuild) {
        setSelectedGuild(storedGuild);
    }

  }, []);

  useEffect(() => {
    if (isLoggedIn && !selectedGuild) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('discord_access_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        try {
          // Fetch user guilds and bot guilds in parallel
          const [userGuildsResponse, botGuildsResponse] = await Promise.all([
            fetch('https://discord.com/api/v10/users/@me/guilds', {
              headers: { Authorization: `Bearer ${token}` },
            }),
            getBotGuildsAction()
          ]);

          if (userGuildsResponse.ok) {
            const userGuildsData: Guild[] = await userGuildsResponse.json();
            const manageableGuilds = userGuildsData.filter(g => (parseInt(g.permissions) & 0x20) === 0x20);
            setGuilds(manageableGuilds);
          } else {
             localStorage.removeItem('discord_access_token');
             setIsLoggedIn(false);
          }
          
          const botGuildIds = botGuildsResponse.map(g => g.id);
          setBotGuilds(botGuildIds);

        } catch (error) {
          console.error('Error fetching initial data:', error);
          // Still try to show manageable guilds if bot guilds fetch fails
          if (guilds.length === 0) {
             localStorage.removeItem('discord_access_token');
             setIsLoggedIn(false);
          }
        } finally {
            setIsLoading(false);
        }
      };
      fetchInitialData();
    } else if(!isLoggedIn) {
        setIsLoading(false);
    }
  }, [isLoggedIn, selectedGuild]);

  const handleLogin = () => {
    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
  };
  
  const handleInvite = (guildId: string) => {
    if (botInviteBaseUrl) {
      const inviteUrl = `${botInviteBaseUrl}&guild_id=${guildId}&disable_guild_select=true`;
      localStorage.setItem('pending_guild_id', guildId); // Store pending guild
      window.open(inviteUrl, '_blank');
      setShowInviteMessage(true);
    }
  };

  const handleSelect = (guildId: string) => {
    localStorage.setItem('selected_guild_id', guildId);
    setSelectedGuild(guildId);
  }
  
  useEffect(() => {
      // Check if we are returning from the invite flow
      const pendingGuildId = localStorage.getItem('pending_guild_id');
      if (pendingGuildId && botGuilds.includes(pendingGuildId)) {
          localStorage.removeItem('pending_guild_id');
          handleSelect(pendingGuildId);
      }
  }, [botGuilds]);


  const handleGoBack = () => {
    localStorage.removeItem('selected_guild_id');
    setSelectedGuild(null);
    setShowInviteMessage(false);
  };
  
  if (selectedGuild) {
    return <DiscordLayout guildId={selectedGuild} onGoBack={handleGoBack} />;
  }

  if (isLoading) {
    return (
         <main className="flex min-h-screen flex-col items-center justify-center bg-[#36393f] p-8">
            <Card className="w-full max-w-md bg-[#2f3136] text-white shadow-2xl border-none">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary animate-pulse">
                       <DiscordLogoIcon className="h-12 w-12 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Loading your servers...</CardTitle>
                    <CardDescription className="text-gray-400">
                        Please wait while we fetch your information.
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
                    <CardTitle className="text-2xl font-bold">Configure Your Discord Bot</CardTitle>
                    <CardDescription className="text-gray-400">
                        Login with your Discord account to select a server and configure the bot.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Button onClick={handleLogin} className="w-full max-w-xs bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold" disabled={!oauthUrl}>
                        Login with Discord
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
                  <CardTitle>Select a Server</CardTitle>
                  <CardDescription className="text-gray-400">
                      {showInviteMessage 
                        ? 'After adding the bot, reload this page to continue.'
                        : "Choose a server to invite the bot to, or select one where it's already present."
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
                                    <Button onClick={() => handleSelect(guild.id)} className="bg-green-600 hover:bg-green-700">
                                      Selecionar
                                    </Button>
                                  ) : (
                                    <Button onClick={() => handleInvite(guild.id)} className="bg-primary hover:bg-primary/80" disabled={!botInviteBaseUrl}>
                                        Add Bot
                                    </Button>
                                  )}
                              </div>
                            )
                          })
                      ) : (
                          <p className="text-muted-foreground">No manageable servers found. Make sure you are logged into the correct Discord account and have 'Manage Server' permissions.</p>
                      )}
                  </div>
              </CardContent>
          </Card>
      </main>
  );

}
