import { Box, Container, TextField, Typography } from '@mui/material';

const messages = ['m1', 'm2'];

const Chat = () => {
    return (
        <Box display='flex' flexDirection='column'>
            <Box>
                {messages.map((m) => (
                    <Typography>{m}</Typography>
                ))}
            </Box>
            <TextField id='system-prompt' label='System Prompt' variant='outlined' />
            <TextField id='message' label='Message' variant='outlined' />
        </Box>
    );
};

export default Chat;
