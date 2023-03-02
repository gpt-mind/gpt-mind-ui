import { PUBLIC_AUTOMATIC111_URL, PUBLIC_OPENAI_KEY, PUBLIC_PINECONE_ENV, PUBLIC_PINECONE_KEY, PUBLIC_PINECONE_URL } from "$env/static/public";

export const config = {
    openai: {
        key: PUBLIC_OPENAI_KEY
    },
    pinecone: {
        environment: PUBLIC_PINECONE_ENV,
        apiKey: PUBLIC_PINECONE_KEY,
        baseUrl: PUBLIC_PINECONE_URL,
    },
    automatic111: {
        baseUrl: PUBLIC_AUTOMATIC111_URL
    }
}