import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApiProvider } from '@reduxjs/toolkit/query/react';
import { api } from './services/api.ts';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ApiProvider api={api}>
            <App />
        </ApiProvider>
    </StrictMode>
);
