import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import AiProvider from './features/AiProvider/AiProvider';
import Menu from './components/Menu';
import ChatRoom from './features/ChatRoom/ChatRoom';

const App: React.FC = () => {
    const [isNewRoom, setIsNewRoom] = useState(false); // Tracks whether the user is starting a new chat
    const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null); // Tracks the selected chat

    const handleNewRoom = () => {
        setIsNewRoom(true); // Show the new chat form
        setCurrentRoom(null); // Clear any selected chat
    };

    const handleSelectRoom = (chat: ChatRoom) => {
        setIsNewRoom(false); // Switch to normal chat UI
        setCurrentRoom(chat); // Load the selected chat
    };

    return (
        <Box width='100%' sx={{ display: 'flex', height: '100vh' }}>
            <Menu
                handleNewRoom={handleNewRoom}
                handleSelectRoom={handleSelectRoom}
                room={currentRoom}
            />

            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                }}>
                {isNewRoom ? (
                    <AiProvider handleSelectRoom={handleSelectRoom} />
                ) : currentRoom ? (
                    <ChatRoom roomId={currentRoom.id || ''} />
                ) : (
                    <Typography sx={{ p: 2 }}>
                        Select a chat or start a new one.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default App;
