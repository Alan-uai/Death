
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaceholderPanelProps {
  title: string;
  description: string;
}

export function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
  return (
    <div className="flex h-full items-center justify-center p-4 md:p-6 bg-transparent">
      <Card className="w-full max-w-2xl text-center border-dashed border-border bg-transparent shadow-none">
        <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                 <Bot className={cn(
                        "h-8 w-8",
                        "bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text"
                       )} />
            </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Esta funcionalidade está em desenvolvimento e estará disponível em breve.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
