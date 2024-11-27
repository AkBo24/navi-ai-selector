import React, { useState } from 'react';
import {
    Box,
    Drawer,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import AiProvider from './features/AiProvider/AiProvider';

const App: React.FC = () => {
    const [isNewChat, setIsNewChat] = useState(false); // Tracks whether the user is starting a new chat
    const [currentChat, setCurrentChat] = useState<string | null>(null); // Tracks the selected chat

    const handleNewChat = () => {
        setIsNewChat(true); // Show the new chat form
        setCurrentChat(null); // Clear any selected chat
    };

    const handleSelectChat = (chat: string) => {
        setIsNewChat(false); // Switch to normal chat UI
        setCurrentChat(chat); // Load the selected chat
    };

    const handleChatCreated = () => {
        setIsNewChat(false); // After creating a new chat, go to normal UI
        setCurrentChat('New Chat'); // Optionally set the new chat name
    };

    return (
        <Box width='100%' sx={{ display: 'flex', height: '100vh' }}>
            {/* Left Drawer for Navigation */}
            <Drawer
                variant='permanent'
                sx={{
                    width: 240,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: 240,
                        boxSizing: 'border-box',
                    },
                }}>
                <Box sx={{ overflow: 'auto' }}>
                    <Typography variant='h6' sx={{ p: 2 }}>
                        Past Chats
                    </Typography>
                    <Button
                        variant='contained'
                        fullWidth
                        size='small'
                        onClick={handleNewChat}>
                        New Chat
                    </Button>
                    <List>
                        {['Chat 1', 'Chat 2', 'Chat 3'].map((text, index) => (
                            <ListItem
                                component={Button}
                                key={index}
                                onClick={() => handleSelectChat(text)}>
                                <ListItemText primary={text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                }}>
                {isNewChat ? (
                    // Show the form for creating a new chat
                    // onChatCreated={handleChatCreated}
                    <AiProvider />
                ) : currentChat ? (
                    // Show the normal chat UI
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflow: 'auto',
                            border: '1px solid #ccc',
                            borderRadius: 1,
                            p: 2,
                        }}>
                        <Typography variant='h6' sx={{ mb: 2 }}>
                            {currentChat}
                        </Typography>
                        {/* <Typography variant='body1'>
                            Chat messages for {currentChat} go here...
                        </Typography> */}
                    </Box>
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
