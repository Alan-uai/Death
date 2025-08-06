
'use client';

import type { CustomCommand } from './types';

// This should point to your bot's backend server
const BOT_API_BASE_URL = process.env.BOT_API_URL || 'https://deathbot-o2pa.onrender.com';
const API_SECRET = process.env.BOT_API_SECRET;

async function postToBotApi(endpoint: string, body: object) {
    if (!API_SECRET) {
        console.error('A variável de ambiente BOT_API_SECRET não está definida.');
        throw new Error('A variável de ambiente BOT_API_SECRET não está definida.');
    }

    const response = await fetch(`${BOT_API_BASE_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_SECRET}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
        throw new Error(`Falha na API do Bot: ${errorData.message}`);
    }

    return response.json();
}

export async function saveCommandConfig(guildId: string, command: CustomCommand) {
    return postToBotApi('config-command', { guildId, command });
}

export async function saveChannelConfig(guildId: string, config: { mode: string; suggestions: { enabled: boolean; }; reports: { enabled: boolean; }; }) {
    // We need to send a flattened structure to the bot backend
    const payload = {
        guildId,
        mode: config.mode,
        suggestions_enabled: config.suggestions.enabled,
        reports_enabled: config.reports.enabled,
    };
    return postToBotApi('config-channel', payload);
}

export async function saveGenericConfig(guildId: string, config: object) {
    return postToBotApi('config-generic', { guildId, ...config });
}
