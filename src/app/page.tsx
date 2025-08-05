
'use client';

import { useState } from 'react';
import { DiscordLayout } from '@/components/discord-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DiscordLogoIcon } from '@/components/discord-logo-icon';


const BOT_INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1402390773332443177&permissions=8&scope=bot';

export default function Home() {
  const [isInvited, setIsInvited] = useState(false);

  const handleInvite = () => {
    // In a real app, you'd listen for a webhook from Discord 
    // to confirm the bot has joined a server.
    // For this prototype, we'll simulate it by setting state after a delay.
    window.open(BOT_INVITE_URL, '_blank');
    
    setTimeout(() => {
        setIsInvited(true);
    }, 3000); // Simulate time for user to complete auth
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
