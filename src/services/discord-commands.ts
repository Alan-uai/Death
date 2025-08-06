
const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';

const commands = [
  // O comando 'suggest-build' foi removido conforme a solicitação.
  // A funcionalidade de sugestão agora é gerenciada pela criação automática de canais.
];

async function registerGuildCommands(guildId: string): Promise<void> {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_BOT_TOKEN) {
    throw new Error('Variáveis de ambiente DISCORD_CLIENT_ID ou DISCORD_BOT_TOKEN ausentes.');
  }

  const url = `${DISCORD_API_BASE_URL}/applications/${process.env.DISCORD_CLIENT_ID}/guilds/${guildId}/commands`;

  // Se não houver comandos para registrar, podemos simplesmente retornar ou enviar um array vazio.
  // Enviar um array vazio removerá todos os comandos globais do servidor.
  const body = commands.length > 0 ? JSON.stringify(commands) : '[]';

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    },
    body: body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Falha ao registrar comandos para o servidor ${guildId}:`, errorText);
    throw new Error(`Erro na API do Discord: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.length > 0) {
      console.log(`Registrado(s) ${data.length} comando(s) com sucesso para o servidor ${guildId}.`);
  } else {
      console.log(`Todos os comandos do servidor foram removidos para o servidor ${guildId}.`);
  }
}

export { registerGuildCommands };
