
const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';

const commands = [
  {
    name: 'suggest-build',
    description: 'Get a build suggestion for your character.',
    options: [
        {
            name: 'style',
            description: 'The playstyle you prefer (e.g., aggressive, defensive, mage).',
            type: 3, // String
            required: true,
        },
    ],
  },
  {
    name: 'stats',
    description: 'View the bot\'s current status and statistics.',
  },
];

async function registerGuildCommands(guildId: string): Promise<void> {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_BOT_TOKEN) {
    throw new Error('Missing DISCORD_CLIENT_ID or DISCORD_BOT_TOKEN in environment variables.');
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
    console.error(`Failed to register commands for guild ${guildId}:`, errorText);
    throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Successfully registered ${data.length} commands for guild ${guildId}.`);
}

export { registerGuildCommands };
