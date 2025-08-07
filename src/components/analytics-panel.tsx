
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Users, Bot, TrendingUp } from 'lucide-react';
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, LineChart } from 'recharts';
import { Skeleton } from './ui/skeleton';


const memberData = [
  { month: 'Jan', members: 150 },
  { month: 'Fev', members: 200 },
  { month: 'Mar', members: 350 },
  { month: 'Abr', members: 400 },
  { month: 'Mai', members: 520 },
  { month: 'Jun', members: 680 },
];

const commandData = [
  { command: '/ajuda', count: 125 },
  { command: '/jogar', count: 98 },
  { command: '/build', count: 75 },
  { command: '/regras', count: 52 },
  { command: '/denunciar', count: 31 },
];

export function AnalyticsPanel() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This runs only on the client, after the component has mounted.
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
               <Skeleton className="h-7 w-1/2" />
               <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral da Atividade</CardTitle>
          <CardDescription>
            Acompanhe as principais métricas de engajamento do seu servidor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <Card className="p-4 bg-secondary">
              <Users className="mx-auto h-8 w-8 text-primary" />
              <p className="text-2xl font-bold mt-2">680</p>
              <p className="text-sm text-muted-foreground">Membros Totais</p>
            </Card>
            <Card className="p-4 bg-secondary">
              <TrendingUp className="mx-auto h-8 w-8 text-primary" />
              <p className="text-2xl font-bold mt-2">123</p>
              <p className="text-sm text-muted-foreground">Membros Online</p>
            </Card>
            <Card className="p-4 bg-secondary">
              <Bot className="mx-auto h-8 w-8 text-primary" />
              <p className="text-2xl font-bold mt-2">381</p>
              <p className="text-sm text-muted-foreground">Comandos Usados (Mês)</p>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Membros</CardTitle>
            <CardDescription>Aumento de membros nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={memberData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          labelClassName="text-sm"
                          className="bg-card border-border shadow-lg"
                        />
                      }
                    />
                    <Legend content={<ChartLegendContent wrapperStyle={{ paddingTop: '20px' }} />} />
                    <Line type="monotone" dataKey="members" name="Membros" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comandos Mais Usados</CardTitle>
            <CardDescription>Os 5 comandos mais populares do bot.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={commandData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis type="category" dataKey="command" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--secondary))' }}
                             content={
                                <ChartTooltipContent
                                labelClassName="text-sm"
                                className="bg-card border-border shadow-lg"
                                />
                            }
                        />
                        <Bar dataKey="count" name="Usos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
          </CardContent>
        </Card>
      </div>
       <p className="text-xs text-muted-foreground text-center pt-4">
            Observação: Os dados exibidos nesta página são estáticos e servem apenas para demonstração.
        </p>
    </div>
  );
}
