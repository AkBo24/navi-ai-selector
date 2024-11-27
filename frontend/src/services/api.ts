import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
};

export type Prompt = {
    provider: Provider;
    model: string;
    systemPrompt: string;
    content: string;
};

export type Role = 'system' | 'user' | 'assistant';

export type Message2 = {
    id?: number;
    role: Role;
    content: string;
    created_at?: string;
    input_tokens?: number;
    output_tokens?: number;
};

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/' }),
    tagTypes: ['user', 'models', 'chat-rooms', 'messages', 'chat-room'],
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
            providesTags: ['chat-rooms'],
        }),
        getChatRoom: builder.query<ChatRoom, string>({
            query: (id) => `chatrooms/${id}`,
            providesTags: (result, error, id) => [{ type: 'chat-room', id }],
        }),
        updateChatRoom: builder.mutation<Partial<ChatRoom>, Partial<ChatRoom>>({
            query: ({ id, ...body }) => ({
                url: `chatrooms/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'chat-room', id },
                'chat-rooms',
            ],
        }),
        deleteChatRoom: builder.mutation<void, string>({
            query: (id) => ({
                url: `chatrooms/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['chat-room', 'messages'],
        }),
        getChatRoomMessages: builder.query<Message2[], string>({
            query: (id) => `chatrooms/${id}/messages`,
            providesTags: ['chat-room', 'messages'],
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
                    chatroom_id: id,
                },
            }),
            invalidatesTags: ['chat-room', 'messages'],
        }),
        createCompletionStreaming: builder.mutation<
            { message: Message2; chatroom: ChatRoom } | ChatRoom,
            Prompt & { id?: string }
        >({
            queryFn: async (
                { provider, model, systemPrompt, content, id },
                { dispatch }
            ) => {
                try {
                    // If we have a chatroom ID, add the user message immediately
                    if (id) {
                        dispatch(
                            api.util.updateQueryData(
                                'getChatRoomMessages',
                                id,
                                (draft) => {
                                    draft.push({
                                        role: 'user',
                                        content,
                                        created_at: new Date().toISOString(),
                                    });
                                }
                            )
                        );
                    }
                    const response = await fetch(
                        `http://localhost:8000/api/providers/${provider.toLowerCase()}/models/${model.toLowerCase()}/complete`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                system_prompt: systemPrompt,
                                message: content,
                                chatroom_id: id,
                            }),
                        }
                    );

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Something went wrong');
                    }

                    const reader = response.body?.getReader();
                    if (!reader) throw new Error('No reader available');

                    const decoder = new TextDecoder();
                    let fullContent = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data: StreamResponse = JSON.parse(
                                        line.slice(6)
                                    );

                                    if (data.type === 'chunk' && data.content) {
                                        fullContent += data.content;

                                        // Update the messages in real-time
                                        if (id) {
                                            dispatch(
                                                api.util.updateQueryData(
                                                    'getChatRoomMessages',
                                                    id,
                                                    (draft) => {
                                                        const lastMessage =
                                                            draft[draft.length - 1];
                                                        if (
                                                            lastMessage?.role ===
                                                            'assistant'
                                                        ) {
                                                            lastMessage.content =
                                                                fullContent;
                                                        } else {
                                                            draft.push({
                                                                role: 'assistant',
                                                                content: fullContent,
                                                                created_at:
                                                                    new Date().toISOString(),
                                                            });
                                                        }
                                                    }
                                                )
                                            );
                                        }
                                    } else if (data.type === 'done' && data.message) {
                                        return {
                                            data: {
                                                message: data.message,
                                                chatroom: data.message,
                                            },
                                        };
                                    }
                                } catch (e) {
                                    console.error('Error parsing streaming data:', e);
                                }
                            }
                        }
                    }

                    // Fallback return if no 'done' message is received
                    return {
                        data: {
                            message: {
                                role: 'assistant',
                                content: fullContent,
                                created_at: new Date().toISOString(),
                            } as Message2,
                            chatroom: {} as ChatRoom,
                        },
                    };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: {
                                message:
                                    error instanceof Error
                                        ? error.message
                                        : 'An error occurred',
                            },
                        },
                    };
                }
            },
            invalidatesTags: ['chat-room', 'messages'],
        }),
    }),
});

export const {
    useCheckAuthQuery,
    useGetProvidersQuery,
    useGetChatroomsQuery,
    useGetChatRoomQuery,
    useGetChatRoomMessagesQuery,
    useUpdateChatRoomMutation,
    useDeleteChatRoomMutation,
    useLazyGetModelsQuery,
    useCreateCompletionMutation,
    useCreateCompletionStreamingMutation,
} = api;
