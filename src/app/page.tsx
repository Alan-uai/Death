
'use client';

import { useState, useEffect } from 'react';
import { DiscordLayout } from '@/components/discord-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DiscordLogoIcon } from '@/components/discord-logo-icon';


const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}`;

export default function Home() {
  const [isInvited, setIsInvited] = useState(false);

  useEffect(() => {
    // Check if the user has already invited the bot
    if (localStorage.getItem('bot_invited') === 'true') {
      setIsInvited(true);
    }
  }, []);

  const handleInvite = () => {
    window.open(BOT_INVITE_URL, '_blank');
    // Set a flag in localStorage to remember the action
    localStorage.setItem('bot_invited', 'true');
    // We can show the dashboard immediately now, or after a short delay
    setTimeout(() => {
        setIsInvited(true);
    }, 1500); // Give user time to see the new tab
  };

  if (!isInvited) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <Card className="w-full max-w-md bg-card shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                       <DiscordLogoIcon className="h-12 w-12 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Invite Death to Your Server</CardTitle>
                    <CardDescription>
                        Grant Death access to your server to get started with build suggestions and game stats.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Button onClick={handleInvite} className="w-full max-w-xs">
                        Add to Discord
                    </Button>
                    <p className="mt-4 text-xs text-muted-foreground">
                        You will be redirected to Discord to authorize the bot.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
  }

  return <DiscordLayout />;
}
