import {
    Drawer,
    Box,
    Typography,
    Button,
    List,
    ListItemButton,
    ListItemText,
    IconButton,
    Tooltip,
    Menu as MuiMenu,
    MenuItem,
} from '@mui/material';
import React, { useState } from 'react';
import {
    ChatRoom,
    useDeleteChatRoomMutation,
    useGetChatroomsQuery,
} from '../services/api';
import { MoreHoriz } from '@mui/icons-material';

const Menu: React.FC<{
    room: ChatRoom;
    handleNewRoom: () => void;
    handleSelectRoom: (room: ChatRoom) => void;
}> = ({ room, handleNewRoom: handleNewChat, handleSelectRoom: handleSelectChat }) => {
    const { data: chats, isSuccess } = useGetChatroomsQuery();
    const [deleteRoom] = useDeleteChatRoomMutation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuRoom, setMenuRoom] = useState<ChatRoom | null>(null);

    const handleMenuOpen = (
        event: React.MouseEvent<HTMLElement>,
        selectedRoom: ChatRoom
    ) => {
        setAnchorEl(event.currentTarget);
        setMenuRoom(selectedRoom);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuRoom(null);
    };

    const handleEditChat = (room: ChatRoom) => {
        console.log('Edit chat:', room); // Replace with your edit logic
        handleMenuClose();
    };

    const handleDeleteChat = async (room: ChatRoom) => {
        console.log('Delete chat:', room); // Replace with your delete logic
        if (room.id) {
            alert('deleting');
            const dr = await deleteRoom(room.id);
            console.log(dr);
        }
        handleMenuClose();
    };

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
                    Navi AI Assignment
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
                        chats.map((r, i) => (
                            <ListItemButton
                                onClick={() => handleSelectChat(r)}
                                selected={room && r?.id === room?.id} // Highlight the selected chat
                                key={r.id || i}>
                                <ListItemText primary={r.title} />
                                <Tooltip arrow color='primary' placement='left' title=''>
                                    <IconButton onClick={(e) => handleMenuOpen(e, r)}>
                                        <MoreHoriz />
                                    </IconButton>
                                </Tooltip>
                            </ListItemButton>
                        ))}
                </List>
            </Box>

            {/* Context Menu */}
            <MuiMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                <MenuItem onClick={() => menuRoom && handleEditChat(menuRoom)}>
                    Edit
                </MenuItem>
                <MenuItem onClick={() => menuRoom && handleDeleteChat(menuRoom)}>
                    Delete
                </MenuItem>
            </MuiMenu>
        </Drawer>
    );
};

export default Menu;
