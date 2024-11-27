import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import ChatRoom from '../features/ChatRoom/ChatRoom';

export type Provider = 'OpenAi' | 'Anthropic';

export type User = {
    username: string;
    email?: string;
};

export type ChatRoom = {
    id?: string;
    title: string;
    created_at: string;
    updated_at: string;
    provider: Provider;
    model_id: string;
    system_prompt: string;
    messages: Message2[];
};

export type Prompt = {
    provider: Provider;
    model: string;
    systemPrompt: string;
    content: string;
};

export type Message = {
    from: 'user' | 'provider';
    content: string;
};

export type Role = 'system' | 'user' | 'assistant';

export type Message2 = {
    id?: number;
    role: Role;
    content: string;
    created_at: string;
    input_tokens: number;
    output_tokens: number;
};

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/' }),
    tagTypes: ['user', 'models', 'chat-rooms', 'messages'],
    endpoints: (builder) => ({
        checkAuth: builder.query<object, void>({
            query: () => `auth/users/me`,
            providesTags: ['user'],
        }),
        login: builder.mutation<
            { refresh: string; access: string },
            Pick<User, 'username'> & { password: string }
        >({
            query: () => `auth/jwt/create`,
            invalidatesTags: ['user'],
        }),
        getChatrooms: builder.query<ChatRoom[], void>({
            query: () => `chatrooms`,
            providesTags: ['chat-rooms', 'messages'],
        }),
        getProviders: builder.query<Provider[], void>({
            query: () => `providers`,
        }),
        getModels: builder.query<string[], Provider>({
            query: (provider) => `providers/${provider.toLowerCase()}/models`,
            providesTags: ['models'],
        }),
        createCompletion: builder.mutation<
            { message: Message2; chatroom: ChatRoom } | ChatRoom,
            Prompt & { id?: string }
        >({
            query: ({ provider, model, systemPrompt, content, id }) => ({
                url: `/providers/${provider.toLowerCase()}/models/${model.toLowerCase()}/complete`,
                method: 'POST',
                body: {
                    system_prompt: systemPrompt,
                    message: content,
                    id,
                },
            }),
            invalidatesTags: ['chat-rooms', 'messages'],
        }),
    }),
});

export const {
    useCheckAuthQuery,
    useGetProvidersQuery,
    useGetChatroomsQuery,
    useLazyGetModelsQuery,
    useCreateCompletionMutation,
} = api;
