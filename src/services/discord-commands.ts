
import { REST, Routes } from 'discord.js';

const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';

const commands = [
  {
    name: 'sugestao',
    description: 'Guia o usuário para o canal de sugestões.',
  },
  {
    name: 'denunciar',
    description: 'Abre um formulário para criar uma denúncia privada.',
  },
];

async function registerGuildCommands(guildId: string, enable: boolean): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId || !token) {
    throw new Error('Variáveis de ambiente DISCORD_CLIENT_ID ou DISCORD_BOT_TOKEN ausentes.');
  }
  
  const rest = new REST({ version: '10' }).setToken(token);

  const body = enable ? commands : [];

  try {
    console.log(`Iniciando a ${enable ? 'inscrição' : 'remoção'} de ${commands.length} comandos (/) de aplicação.`);

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body },
    );

    console.log(`Comandos de aplicação (/) foram ${enable ? 'recarregados' : 'removidos'} com sucesso.`);
  } catch (error) {
    console.error(error);
  }
}

export { registerGuildCommands };
