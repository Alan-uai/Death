
'use client';

import { useState, useEffect } from 'react';
import type { DiscordChannel } from '@/services/discord';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  channels: DiscordChannel[];
}

export function SettingsPanel({ channels }: SettingsPanelProps) {
  const { toast } = useToast();
  const [qaChannel, setQaChannel] = useState<string>('any');
  const [buildsChannel, setBuildsChannel] = useState<string>('any');
  const [isSaving, setIsSaving] = useState(false);
  
  const textChannels = channels.filter(c => c.type === 0);

  // In a real app, you would fetch and save these settings.
  // For now, we'll simulate it with local state and a toast notification.
  useEffect(() => {
    // Load saved settings from localStorage or an API
    const savedQaChannel = localStorage.getItem('settings_qaChannel') || 'any';
    const savedBuildsChannel = localStorage.getItem('settings_buildsChannel') || 'any';
    setQaChannel(savedQaChannel);
    setBuildsChannel(savedBuildsChannel);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving settings
    localStorage.setItem('settings_qaChannel', qaChannel);
    localStorage.setItem('settings_buildsChannel', buildsChannel);

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your new configurations have been applied.",
      });
    }, 1000);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Bot Configuration</CardTitle>
          <CardDescription>
            Configure where the bot's features are active and how it responds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Feature #2: Channel Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Channel Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="qa-channel">Q&A Channel</Label>
              <p className="text-sm text-muted-foreground">
                Select a channel where the bot will answer questions. Choose "Any Channel" to allow questions everywhere.
              </p>
              <Select value={qaChannel} onValueChange={setQaChannel}>
                <SelectTrigger id="qa-channel" className="w-[300px]">
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Channel</SelectItem>
                  {textChannels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      # {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="builds-channel">Build Suggestions Channel</Label>
              <p className="text-sm text-muted-foreground">
                Select a channel for build suggestions. Choose "Any Channel" to allow this command everywhere.
              </p>
              <Select value={buildsChannel} onValueChange={setBuildsChannel}>
                <SelectTrigger id="builds-channel" className="w-[300px]">
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Channel</SelectItem>
                  {textChannels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      # {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
