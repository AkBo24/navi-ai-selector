import {
    Drawer,
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import React from 'react';
import { ChatRoom, useGetChatroomsQuery } from '../services/api';

const Menu: React.FC<{
    handleNewRoom: () => void;
    handleSelectRoom: (room: ChatRoom) => void;
}> = ({ handleNewRoom: handleNewChat, handleSelectRoom: handleSelectChat }) => {
    const { data: chats, isSuccess } = useGetChatroomsQuery();

    return (
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
                    {isSuccess &&
                        chats.map((room, index) => (
                            <ListItem
                                key={index}
                                component={Button}
                                onClick={() => handleSelectChat(room)}>
                                <ListItemText primary={room.title} />
                            </ListItem>
                        ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default Menu;
