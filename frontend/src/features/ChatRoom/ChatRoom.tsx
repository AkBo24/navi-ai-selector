import { Box, Typography } from '@mui/material';
import type { ChatRoom } from '../../services/api';
import Message from './components/Message';

const ChatRoom: React.FC<{ room: ChatRoom }> = ({ room: { title, messages } }) => {
    return (
        <Box
            sx={{
                flexGrow: 1,
                overflow: 'auto',
                border: '1px solid #ccc',
                borderRadius: 1,
                p: 2,
            }}>
            <Typography variant='h4' sx={{ mb: 2 }}>
                {title}
            </Typography>
            {messages.map((m) => (
                <Message message={m} />
            ))}
        </Box>
    );
};

export default ChatRoom;
