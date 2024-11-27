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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
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
    useUpdateChatRoomMutation,
} from '../services/api';
import { useFormik } from 'formik';
import * as yup from 'yup';

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
    const [updateRoom] = useUpdateChatRoomMutation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuRoom, setMenuRoom] = useState<ChatRoom | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editRoom, setEditRoom] = useState<ChatRoom | null>(null);

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
        setEditRoom(room);
        setIsEditModalOpen(true);
    };

    const handleDeleteChat = async (room: ChatRoom) => {
        if (room.id) {
            await deleteRoom(room.id);
            // If the deleted room was selected, deselect it
            if (room?.id === room.id) {
                handleSelectRoom(null);
            }
        }
        handleMenuClose();
    };

    // Formik for the edit form
    const validationSchema = yup.object({
        title: yup.string().required('Title is required'),
    });

    const formik = useFormik({
        initialValues: {
            title: editRoom?.title || '',
        },
        enableReinitialize: true, // Reinitialize when editRoom changes
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            if (editRoom && editRoom.id) {
                await updateRoom({ id: editRoom.id, title: values.title });
                setIsEditModalOpen(false);
            }
        },
    });

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
        <>
            {/* Navigation Drawer */}
            <Box
                component='nav'
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label='mailbox folders'>
                {/* Temporary drawer for mobile */}
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
                {/* Permanent drawer for desktop */}
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

            {/* Edit Chat Room Modal */}
            <Dialog
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                fullWidth
                maxWidth='sm'>
                <DialogTitle>Edit Chat Room</DialogTitle>
                <DialogContent>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            autoFocus
                            margin='dense'
                            name='title'
                            label='Chat Room Title'
                            type='text'
                            fullWidth
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            error={formik.touched.title && Boolean(formik.errors.title)}
                            helperText={formik.touched.title && formik.errors.title}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditModalOpen(false)} color='primary'>
                        Cancel
                    </Button>
                    <Button
                        onClick={formik.submitForm}
                        color='primary'
                        variant='contained'>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Menu;
