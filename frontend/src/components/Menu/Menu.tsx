import React, { useState } from 'react';
import { Drawer, Box, Button, Divider } from '@mui/material';
import { ChatRoom, useGetChatroomsQuery } from '../../services/api';
import ChatList from './components/ChatList';
import DrawerHeader from './components/DrawerHeader';
import EditDialog from './components/EditDialog';

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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editRoom, setEditRoom] = useState<ChatRoom | null>(null);

    const handleEditChat = (room: ChatRoom) => {
        setEditRoom(room);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditRoom(null);
    };

    const drawerContent = (
        <Box sx={{ overflow: 'auto' }}>
            <DrawerHeader title='Navi AI Assignment' />
            <Divider />
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
            <ChatList
                chats={chats}
                isSuccess={isSuccess}
                selectedRoom={room}
                handleSelectRoom={handleSelectRoom}
                onEditRoom={handleEditChat}
            />
        </Box>
    );

    return (
        <>
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

            <EditDialog
                isOpen={isEditModalOpen}
                room={editRoom}
                onClose={handleCloseEditModal}
            />
        </>
    );
};

export default Menu;
