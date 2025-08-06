
'use client';

import { useState, useEffect } from 'react';
import { DiscordLayout } from '@/components/discord-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DiscordLogoIcon } from '@/components/discord-logo-icon';
import { getManageableGuildsAction, getCurrentUserAction, setOwnerAction } from '@/app/actions';
import type { DiscordGuild, DiscordUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
const DISCORD_PERMISSIONS = '8'; // Administrator permissions

type ManageableGuild = DiscordGuild & { bot_present: boolean };

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [guilds, setGuilds] = useState<ManageableGuild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<DiscordGuild | null>(null);
  const [oauthUrl, setOauthUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const redirectUri = window.location.origin;
    // Added guilds.join scope
    setOauthUrl(`https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify%20guilds%20guilds.join`);
    
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
      const fetchInitialData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('discord_access_token');
        if (!token) {
          setIsLoading(false);
          setIsLoggedIn(false);
          return;
        }

        try {
          const [manageableGuilds, currentUser] = await Promise.all([
            getManageableGuildsAction(token),
            getCurrentUserAction(token),
          ]);
          setGuilds(manageableGuilds);
          setUser(currentUser);
        } catch (error) {
          console.error('Erro ao buscar dados iniciais:', error);
          // Handle specific errors if needed, e.g., invalid token
          handleLogout();
        } finally {
            setIsLoading(false);
        }
      };
      fetchInitialData();
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
    setUser(null);
  };

  const handleSelect = (guild: DiscordGuild) => {
    localStorage.setItem('selected_guild', JSON.stringify(guild));
    setSelectedGuild(guild);
  }
  
  const handleInvite = async (guildId: string) => {
      if (!user) {
          toast({
              variant: 'destructive',
              title: 'Erro de Usuário',
              description: 'Não foi possível identificar o usuário. Tente fazer login novamente.'
          });
          return;
      }
      try {
          await setOwnerAction(user.id);
          const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&guild_id=${guildId}&permissions=${DISCORD_PERMISSIONS}&scope=bot%20applications.commands`;
          window.open(inviteUrl, '_blank');
      } catch (error) {
          console.error('Falha ao definir o proprietário:', error);
          toast({
              variant: 'destructive',
              title: 'Erro de API',
              description: 'Não foi possível comunicar ao bot quem está o adicionando. O convite não pode prosseguir.',
          });
      }
  };

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
                        Faça login com sua conta do Discord para gerenciar os servidores.
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

  const guildsWithBot = guilds.filter(g => g.bot_present);
  const guildsWithoutBot = guilds.filter(g => !g.bot_present);

  return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
          <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-2xl border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Selecione um Servidor</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Gerencie um servidor existente ou adicione o bot a um novo.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                  </Button>
              </CardHeader>
              <CardContent className="max-h-[70vh] overflow-y-auto p-4 space-y-6">
                  {guilds.length > 0 ? (
                      <>
                          {guildsWithBot.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-2">CONFIGURAR SERVIDORES</h3>
                              <div className="space-y-2">
                                  {guildsWithBot.map(guild => (
                                      <div key={guild.id} className="flex items-center justify-between rounded-lg bg-secondary p-3 hover:bg-secondary/80 transition-colors">
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
                                              Gerenciar
                                          </Button>
                                      </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {guildsWithBot.length > 0 && guildsWithoutBot.length > 0 && <Separator />}

                          {guildsWithoutBot.length > 0 && (
                            <div>
                               <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-2">ADICIONAR A SERVIDORES</h3>
                               <div className="space-y-2">
                                  {guildsWithoutBot.map(guild => (
                                      <div key={guild.id} className="flex items-center justify-between rounded-lg bg-secondary p-3 hover:bg-secondary/80 transition-colors">
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
                                          <Button onClick={() => handleInvite(guild.id)} variant="outline">
                                              Convidar Bot
                                              <ArrowRight className="ml-2 h-4 w-4" />
                                          </Button>
                                      </div>
                                  ))}
                              </div>
                            </div>
                          )}

                      </>
                  ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhum servidor onde você tem permissão de 'Gerenciar Servidor' foi encontrado.
                      </p>
                  )}
              </CardContent>
          </Card>
      </main>
  );
}
