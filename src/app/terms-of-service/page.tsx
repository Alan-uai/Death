
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-4xl bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold">Termos de Serviço</CardTitle>
          <p className="text-muted-foreground">Última atualização: 7 de Agosto de 2024</p>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-invert prose-sm sm:prose-base max-w-none text-card-foreground/90">
          <p>
            Ao adicionar nosso bot ao seu servidor Discord e usar este painel de controle, você concorda com os seguintes termos e condições.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-primary">1. Uso do Serviço</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Você é responsável por todas as configurações aplicadas ao seu servidor através deste painel.</li>
              <li>O uso indevido do bot, como para fins de spam ou atividades ilícitas, resultará na proibição do uso de nossos serviços.</li>
              <li>O bot requer permissões de Administrador para funcionar corretamente. Ao adicioná-lo, você concede essas permissões ciente das capacidades que elas oferecem.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">2. Integração com Roblox</h2>
            <p>
              Nossos serviços podem oferecer integração com a plataforma Roblox. Ao usar essas funcionalidades, você concorda que:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Podemos usar dados publicamente disponíveis da sua conta Roblox, como seu ID de usuário e nome de usuário, para fornecer as funcionalidades do bot.</li>
              <li>Você não deve usar as integrações para violar os Termos de Serviço do Roblox.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">3. Limitação de Responsabilidade</h2>
            <p>
              O serviço é fornecido "como está". Não nos responsabilizamos por qualquer perda de dados, danos ao seu servidor Discord ou qualquer outro prejuízo que possa surgir do uso (ou da incapacidade de uso) do nosso bot.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">4. Modificações nos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos sobre alterações significativas, mas é sua responsabilidade revisar os termos periodicamente.
            </p>
          </section>

          <div className="text-center pt-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

    