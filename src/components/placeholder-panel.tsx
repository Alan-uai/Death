
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot } from 'lucide-react';

interface PlaceholderPanelProps {
  title: string;
  description: string;
}

export function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
  return (
    <div className="flex h-full items-center justify-center p-4 md:p-6 bg-[#36393f]">
      <Card className="w-full max-w-2xl text-center border-dashed border-gray-600 bg-transparent">
        <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Bot className="h-8 w-8" />
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
