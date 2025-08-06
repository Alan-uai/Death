
const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';

const commands = [
  {
    name: 'suggest-build',
    description: 'Obtenha uma sugestão de build para seu personagem.',
    options: [
        {
            name: 'style',
            description: 'O estilo de jogo que você prefere (ex: agressivo, defensivo, mago).',
            type: 3, // String
            required: true,
        },
    ],
  },
];

async function registerGuildCommands(guildId: string): Promise<void> {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_BOT_TOKEN) {
    throw new Error('Variáveis de ambiente DISCORD_CLIENT_ID ou DISCORD_BOT_TOKEN ausentes.');
  }

  const url = `${DISCORD_API_BASE_URL}/applications/${process.env.DISCORD_CLIENT_ID}/guilds/${guildId}/commands`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Falha ao registrar comandos para o servidor ${guildId}:`, errorText);
    throw new Error(`Erro na API do Discord: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Registrado(s) ${data.length} comando(s) com sucesso para o servidor ${guildId}.`);
}

export { registerGuildCommands };
