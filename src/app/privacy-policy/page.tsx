
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-4xl bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold">Política de Privacidade</CardTitle>
          <p className="text-muted-foreground">Última atualização: 7 de Agosto de 2024</p>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-invert prose-sm sm:prose-base max-w-none text-card-foreground/90">
          <p>
            Bem-vindo à nossa Política de Privacidade. A sua privacidade é de extrema importância para nós. Este documento explica quais informações coletamos de você através do Discord e da integração com o Roblox, e como as utilizamos.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-primary">1. Coleta de Dados</h2>
            <p>
              Ao usar nosso bot e serviços, nós coletamos as seguintes informações:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Informações do Discord:</strong> Coletamos seu ID de usuário, nome de usuário e informações sobre os servidores (guilds) que você gerencia e nos quais nosso bot está presente. O bot requer permissões de Administrador para criar canais, gerenciar cargos e executar outras funções essenciais para sua operação.
              </li>
              <li>
                <strong>Informações do Roblox:</strong> Para funcionalidades de integração, podemos coletar seu ID de usuário do Roblox e nome de usuário quando você voluntariamente os fornece através de comandos do bot.
              </li>
              <li>
                <strong>Dados de Configuração:</strong> Todas as configurações que você define através deste painel são armazenadas e associadas ao ID do seu servidor do Discord.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">2. Uso dos Dados</h2>
            <p>
              Os dados coletados são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer e operar as funcionalidades do bot no seu servidor.</li>
              <li>Personalizar a experiência do usuário, como em mensagens de boas-vindas.</li>
              <li>Realizar a integração entre suas contas do Discord e Roblox, se aplicável.</li>
              <li>Salvar suas configurações para que o bot funcione conforme o esperado.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">3. Compartilhamento de Dados</h2>
            <p>
              Nós não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nos casos em que a lei o exija.
            </p>
          </section>
          
           <section>
            <h2 className="text-xl font-semibold text-primary">4. Segurança</h2>
            <p>
              Empregamos medidas de segurança para proteger suas informações. As configurações do servidor são armazenadas em um banco de dados seguro (Firebase Firestore) e as comunicações entre este painel e o bot são protegidas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">5. Seus Direitos</h2>
            <p>
              Você pode remover o bot do seu servidor a qualquer momento, o que interromperá a coleta de novos dados. Para solicitar a exclusão de dados existentes, por favor, entre em contato conosco.
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

    