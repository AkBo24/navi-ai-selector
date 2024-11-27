import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Provider = 'OpenAi' | 'Anthropic';

export type User = {
    username: string;
    email?: string;
};

export type Todo = {
    id?: number;
    title: string;
    description: string;
    completed: boolean;
    owner?: User;
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
        getProviders: builder.query<Provider[], void>({
            query: () => `providers`,
        }),
        getModels: builder.query<string[], Provider>({
            query: (provider) => `providers/${provider}/models`,
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
        getTodos: builder.query<Todo[], void>({
            query: () => `todos`,
            providesTags: ['todos'],
        }),
        addTodo: builder.mutation<Todo, Partial<Todo>>({
            query: (body) => ({
                url: `todos`,
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['todos'],
        }),
        updateTodo: builder.mutation<Todo, Partial<Todo> & Pick<Todo, 'id'>>({
            // note: an optional `queryFn` may be used in place of `query`
            query: ({ id, ...patch }) => ({
                url: `todos/${id}`,
                method: 'PATCH',
                body: patch,
            }),
            invalidatesTags: ['todos'],
        }),
    }),
});

export const {
    useCheckAuthQuery,
    useGetProvidersQuery,
    useLazyGetModelsQuery,
    useCreateCompletionMutation,
    useGetTodosQuery,
    useAddTodoMutation,
    useUpdateTodoMutation,
} = api;
