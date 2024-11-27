import React, { useState } from 'react';
import {
    List,
    ListItemButton,
    ListItemText,
    IconButton,
    Tooltip,
    Menu as MuiMenu,
    MenuItem,
    ListItemIcon,
} from '@mui/material';
import {
    Chat as ChatIcon,
    MoreVert,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { ChatRoom, useDeleteChatRoomMutation } from '../../../services/api';

interface ChatListProps {
    chats: ChatRoom[] | undefined;
    isSuccess: boolean;
    selectedRoom: ChatRoom | null;
    handleSelectRoom: (room: ChatRoom | null) => void;
    onEditRoom: (room: ChatRoom) => void;
}

const ChatList: React.FC<ChatListProps> = ({
    chats,
    isSuccess,
    selectedRoom,
    handleSelectRoom,
    onEditRoom,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuRoom, setMenuRoom] = useState<ChatRoom | null>(null);
    const [deleteRoom] = useDeleteChatRoomMutation();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, room: ChatRoom) => {
        setAnchorEl(event.currentTarget);
        setMenuRoom(room);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuRoom(null);
    };

    const handleDeleteChat = async (room: ChatRoom) => {
        if (room.id) {
            await deleteRoom(room.id);
        }
        handleSelectRoom(null);
        handleMenuClose();
    };

    return (
        <>
            <List>
                {isSuccess &&
                    chats?.map((chat) => (
                        <ListItemButton
                            key={chat.id}
                            selected={selectedRoom?.id === chat.id}
                            onClick={() => handleSelectRoom(chat)}>
                            <ListItemIcon>
                                <ChatIcon color='action' />
                            </ListItemIcon>
                            <ListItemText primary={chat.title} />
                            <Tooltip title='Options' arrow>
                                <IconButton
                                    edge='end'
                                    onClick={(e) => handleMenuOpen(e, chat)}>
                                    <MoreVert />
                                </IconButton>
                            </Tooltip>
                        </ListItemButton>
                    ))}
            </List>

            <MuiMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}>
                <MenuItem onClick={() => menuRoom && onEditRoom(menuRoom)}>
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
        </>
    );
};

export default ChatList;
