
'use client';

import { useState, useEffect } from 'react';
import { DiscordLayout } from '@/components/discord-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DiscordLogoIcon } from '@/components/discord-logo-icon';
import { getManageableGuildsAction } from '@/app/actions';
import type { DiscordGuild } from '@/lib/types';
import { cn } from '@/lib/utils';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<DiscordGuild | null>(null);
  const [oauthUrl, setOauthUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectUri = window.location.origin;
    setOauthUrl(`https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify%20guilds`);
    
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
    if (isLoggedIn && !selectedGuild) {
      const fetchGuilds = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('discord_access_token');
        if (!token) {
          setIsLoading(false);
          setIsLoggedIn(false);
          return;
        }

        try {
          const manageableGuilds = await getManageableGuildsAction(token);
          setGuilds(manageableGuilds);
        } catch (error) {
          console.error('Erro ao buscar servidores gerenciáveis:', error);
          // Handle token expiration or invalidation
          localStorage.removeItem('discord_access_token');
          setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
      };
      fetchGuilds();
    } else {
        setIsLoading(false);
    }
  }, [isLoggedIn, selectedGuild]);

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

  const handleSelect = (guild: DiscordGuild) => {
    localStorage.setItem('selected_guild', JSON.stringify(guild));
    setSelectedGuild(guild);
  }

  const handleGoBack = () => {
    localStorage.removeItem('selected_guild');
    setSelectedGuild(null);
  };
  
  if (selectedGuild) {
    return <DiscordLayout guild={selectedGuild} onGoBack={handleGoBack} />;
  }

  if (isLoading) {
    return (
         <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <Card className="w-full max-w-md bg-card text-card-foreground shadow-2xl border-border">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 animate-pulse">
                       <DiscordLogoIcon className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Carregando seus servidores...</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Por favor, aguarde enquanto buscamos suas informações.
                    </CardDescription>
                </CardHeader>
            </Card>
        </main>
    );
  }

  if (!isLoggedIn) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <Card className="w-full max-w-md bg-card text-card-foreground shadow-2xl border-border">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                       <DiscordLogoIcon className={cn(
                        "h-12 w-12",
                        "bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text"
                       )} />
                    </div>
                    <CardTitle className="text-2xl font-bold">Configure seu Bot do Discord</CardTitle>
                    <CardDescription className="text-muted-foreground">
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
          <Card className="w-full max-w-lg bg-card text-card-foreground shadow-2xl border-border">
              <CardHeader>
                  <CardTitle>Selecione um Servidor</CardTitle>
                  <CardDescription className="text-muted-foreground">
                      Escolha um servidor para configurar. Somente servidores onde o bot já está presente e você tem permissão aparecerão.
                  </CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                      {guilds.length > 0 ? (
                          guilds.map(guild => (
                              <div key={guild.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
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
                                  <Button onClick={() => handleSelect(guild)} className="bg-primary hover:bg-primary/80">
                                      Configurar
                                  </Button>
                              </div>
                          ))
                      ) : (
                          <p className="text-muted-foreground">Nenhum servidor gerenciável encontrado. Certifique-se de que o bot está em um servidor onde você tem permissão de 'Gerenciar Servidor'.</p>
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
