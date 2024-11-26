import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/' }),
    tagTypes: ['todos', 'user'],
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
    useGetTodosQuery,
    useAddTodoMutation,
    useUpdateTodoMutation,
} = api;
