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

    // const handleRoomCreated = () => {
    //     setIsNewRoom(false); // After creating a new chat, go to normal UI
    //     setCurrentRoom('New Chat'); // Optionally set the new chat name
    // };

    return (
        <Box width='100%' sx={{ display: 'flex', height: '100vh' }}>
            <Menu handleNewRoom={handleNewRoom} handleSelectRoom={handleSelectRoom} />

            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                }}>
                {isNewRoom ? (
                    // Show the form for creating a new chat
                    // onChatCreated={handleChatCreated}
                    <AiProvider handleSelectRoom={handleSelectRoom} />
                ) : currentRoom ? (
                    // Show the normal chat UI
                    <ChatRoom room={currentRoom} />
                ) : (
                    // Placeholder for when no chat is selected
                    <Typography variant='body1' sx={{ p: 2 }}>
                        Select a chat or start a new one.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default App;
