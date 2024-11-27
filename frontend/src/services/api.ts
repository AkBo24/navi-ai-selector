import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Provider = 'OpenAi' | 'Anthropic';

export type User = {
    username: string;
    email?: string;
};

export type ChatRoom = {
    id?: number;
    title: string;
    created_at: string;
    updated_at: string;
    provider: Provider;
    model_id: string[];
    system_prompt: string;
    messages: Message2[];
};

export type Prompt = {
    provider: Provider;
    model: string;
    systemPrompt: string;
    message: string;
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
    tagTypes: ['todos', 'user', 'models'],
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
        }),
        getProviders: builder.query<Provider[], void>({
            query: () => `providers`,
        }),
        getModels: builder.query<string[], Provider>({
            query: (provider) => `providers/${provider.toLowerCase()}/models`,
            providesTags: ['models'],
        }),
        createCompletion: builder.mutation<any, Prompt>({
            query: ({ provider, model, systemPrompt, message }) => ({
                url: `/providers/${provider}/models/${model}/completions/`,
                method: 'POST',
                body: {
                    system_prompt: systemPrompt,
                    message,
                },
            }),
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
