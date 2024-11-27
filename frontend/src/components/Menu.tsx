import React, { useState } from 'react';
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
    Divider,
    ListItemIcon,
} from '@mui/material';
import {
    MoreVert,
    Chat as ChatIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import {
    ChatRoom,
    useDeleteChatRoomMutation,
    useGetChatroomsQuery,
} from '../services/api';

const drawerWidth = 240;

interface MenuProps {
    room: ChatRoom | null;
    handleNewRoom: () => void;
    handleSelectRoom: (room: ChatRoom | null) => void;
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
}

const Menu: React.FC<MenuProps> = ({
    room,
    handleNewRoom,
    handleSelectRoom,
    mobileOpen,
    handleDrawerToggle,
}) => {
    const { data: chats, isSuccess } = useGetChatroomsQuery();
    const [deleteRoom] = useDeleteChatRoomMutation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuRoom, setMenuRoom] = useState<ChatRoom | null>(null);

    const handleMenuOpen = (
        event: React.MouseEvent<HTMLElement>,
        selectedRoom: ChatRoom
    ) => {
        event.stopPropagation(); // Prevent click from triggering parent handlers
        setAnchorEl(event.currentTarget);
        setMenuRoom(selectedRoom);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuRoom(null);
    };

    const handleEditChat = (room: ChatRoom) => {
        handleMenuClose();
        handleSelectRoom(null);
    };

    const handleDeleteChat = async (room: ChatRoom) => {
        if (room.id) {
            await deleteRoom(room.id);
            handleSelectRoom(null);
        }
        handleMenuClose();
    };

    const drawerContent = (
        <Box sx={{ overflow: 'auto' }}>
            {/* Drawer Header */}
            <Box sx={{ p: 2 }}>
                <Typography variant='h6' noWrap>
                    Navi AI Assignment
                </Typography>
            </Box>
            <Divider />
            {/* New Chat Button */}
            <Box sx={{ p: 2 }}>
                <Button
                    variant='contained'
                    fullWidth
                    size='medium'
                    onClick={handleNewRoom}>
                    New Chat
                </Button>
            </Box>
            <Divider />
            {/* Chat List */}
            <List>
                {isSuccess &&
                    chats.map((r) => (
                        <ListItemButton
                            key={r.id}
                            selected={room?.id === r.id}
                            onClick={() => handleSelectRoom(r)}>
                            <ListItemIcon>
                                <ChatIcon color='action' />
                            </ListItemIcon>
                            <ListItemText primary={r.title} />
                            <Tooltip title='Options' arrow>
                                <IconButton
                                    edge='end'
                                    onClick={(e) => handleMenuOpen(e, r)}>
                                    <MoreVert />
                                </IconButton>
                            </Tooltip>
                        </ListItemButton>
                    ))}
            </List>
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
                    <ListItemIcon>
                        <EditIcon fontSize='small' />
                    </ListItemIcon>
                    Edit
                </MenuItem>
                <MenuItem onClick={() => menuRoom && handleDeleteChat(menuRoom)}>
                    <ListItemIcon>
                        <DeleteIcon fontSize='small' />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </MuiMenu>
        </Box>
    );

    return (
        <Box
            component='nav'
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label='mailbox folders'>
            <Drawer
                variant='temporary'
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                    },
                }}>
                {drawerContent}
            </Drawer>

            <Drawer
                variant='permanent'
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                    },
                }}
                open>
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Menu;
