
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export type EmbedData = {
  title: string;
  description: string;
  fields?: { name: string; value: string }[];
};

export function BotResponseCard({ title, description, fields }: EmbedData) {
  return (
    <Card className="mt-2 w-full max-w-lg border-l-4 border-primary bg-[#2f3136] shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-sm text-gray-300">{description}</p>
        {fields && fields.length > 0 && <Separator className="my-2 bg-border" />}
        <div className="grid grid-cols-1 gap-3 text-sm">
          {fields?.map((field, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white">{field.name}</h4>
              <p className="text-gray-300">{field.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
