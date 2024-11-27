import React, { useState } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ChatRoom as ChatRoomType } from './services/api';
import MenuIcon from '@mui/icons-material/Menu';
import NewChat from './features/NewChat';
import Menu from './components/Menu';
import ChatRoom from './features/ChatRoom/ChatRoom';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
    },
});

const App: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<ChatRoomType | null>(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNewRoom = () => {
        setCurrentRoom(null);
    };

    const handleSelectRoom = (chat: ChatRoomType | null) => {
        setCurrentRoom(chat);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', height: '100vh' }}>
                <AppBar
                    position='fixed'
                    sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <IconButton
                            color='inherit'
                            aria-label='open drawer'
                            edge='start'
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant='h6' noWrap>
                            Navi AI Assignment
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Menu
                    handleNewRoom={handleNewRoom}
                    handleSelectRoom={handleSelectRoom}
                    room={currentRoom}
                    mobileOpen={mobileOpen}
                    handleDrawerToggle={handleDrawerToggle}
                />

                <Box
                    component='main'
                    sx={{
                        flexGrow: 1,
                        mt: 8, // Adjust for AppBar height (64px default)
                        display: 'flex',
                        flexDirection: 'column',
                        height: 'calc(100vh - 64px)', // Subtract AppBar height
                    }}>
                    {currentRoom != null ? (
                        <ChatRoom roomId={currentRoom.id || ''} />
                    ) : (
                        <NewChat handleSelectRoom={handleSelectRoom} />
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default App;
