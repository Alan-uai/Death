
'use client';

import { useState, useEffect } from 'react';
import { DiscordLayout } from '@/components/discord-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DiscordLogoIcon } from '@/components/discord-logo-icon';
import { getGuildChannelsAction } from '@/app/actions';
import type { DiscordChannel } from '@/services/discord';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
const REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin : '';

const OAUTH2_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify%20guilds`;

const BOT_INVITE_BASE_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);

  useEffect(() => {
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
    }
    
    // Check if a guild has been selected
    const storedGuild = localStorage.getItem('selected_guild_id');
    if (storedGuild) {
        setSelectedGuild(storedGuild);
    }

  }, []);

  useEffect(() => {
    if (isLoggedIn && !selectedGuild) {
      const fetchGuilds = async () => {
        const token = localStorage.getItem('discord_access_token');
        if (!token) return;

        try {
          const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userGuilds: Guild[] = await response.json();
            const manageableGuilds = userGuilds.filter(g => (parseInt(g.permissions) & 0x20) === 0x20);
            setGuilds(manageableGuilds);
          } else {
             // Token might be expired, clear it
             localStorage.removeItem('discord_access_token');
             setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('Error fetching guilds:', error);
        }
      };
      fetchGuilds();
    }
  }, [isLoggedIn, selectedGuild]);

  const handleLogin = () => {
    window.location.href = OAUTH2_URL;
  };
  
  const handleInvite = (guildId: string) => {
    const inviteUrl = `${BOT_INVITE_BASE_URL}&guild_id=${guildId}&disable_guild_select=true`;
    window.open(inviteUrl, '_blank');
    localStorage.setItem('selected_guild_id', guildId);
    setTimeout(() => {
        setSelectedGuild(guildId);
    }, 1500);
  };
  
  if (selectedGuild) {
    return <DiscordLayout guildId={selectedGuild} />;
  }

  if (!isLoggedIn) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <Card className="w-full max-w-md bg-card shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                       <DiscordLogoIcon className="h-12 w-12 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Configure Your Discord Bot</CardTitle>
                    <CardDescription>
                        Login with your Discord account to select a server and configure the bot.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Button onClick={handleLogin} className="w-full max-w-xs">
                        Login with Discord
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
  }

  return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
          <Card className="w-full max-w-lg bg-card shadow-2xl">
              <CardHeader>
                  <CardTitle>Select a Server</CardTitle>
                  <CardDescription>
                      Choose a server you manage to invite and configure the bot.
                  </CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                      {guilds.length > 0 ? (
                          guilds.map(guild => (
                              <div key={guild.id} className="flex items-center justify-between rounded-lg border p-3">
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
                                  <Button onClick={() => handleInvite(guild.id)}>
                                      Add Bot
                                  </Button>
                              </div>
                          ))
                      ) : (
                          <p className="text-muted-foreground">No manageable servers found.</p>
                      )}
                  </div>
              </CardContent>
          </Card>
      </main>
  );

}
