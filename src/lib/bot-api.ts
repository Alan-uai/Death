'use client';

// Este arquivo contém funções auxiliares para interagir com a API do bot,
// mas APENAS para chamadas que NÃO requerem um segredo de API.
// Chamadas seguras devem ser feitas através de Server Actions.

import type { CustomCommand } from './types';

// Este deve apontar para o servidor de backend do seu bot
const BOT_API_BASE_URL = process.env.NEXT_PUBLIC_BOT_API_URL;

async function postToBotApi(endpoint: string, body: object) {
    if (!BOT_API_BASE_URL) {
        console.error('A variável de ambiente NEXT_PUBLIC_BOT_API_URL não está definida.');
        throw new Error('A URL da API não está configurada.');
    }

    const response = await fetch(`${BOT_API_BASE_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        let errorMessage = 'Ocorreu um erro desconhecido.';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // A resposta pode não ser JSON, use o texto bruto
            errorMessage = await response.text();
        }
        console.error(`Falha na API do Bot (${endpoint}):`, errorMessage);
        throw new Error(`Falha na API do Bot: ${errorMessage}`);
    }

    return response.json();
}


// Esta função é chamada pelo lado do cliente, mas a chamada segura é feita por uma Server Action.
// A lógica real de `setOwner` com segredo foi movida para `actions.ts`.
// Esta função permanece para compatibilidade, mas a chamada segura real está na Server Action.
export async function setOwner(userId: string) {
    // A implementação real e segura está em `setOwnerAction` em `src/app/actions.ts`
    console.warn("A função `setOwner` em `bot-api.ts` não deve ser chamada diretamente para operações seguras. Use `setOwnerAction`.");
    // Retornando uma promessa resolvida para evitar quebrar o fluxo existente que pode ainda chamá-la.
    return Promise.resolve();
}
