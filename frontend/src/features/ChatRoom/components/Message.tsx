import React from 'react';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import { Fade } from '@mui/material';

const Message: React.FC<{ message: { role: string; content: string } }> = ({
    message,
}) => {
    const isUser = message.role === 'user';

    return (
        <Fade in timeout={300}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    marginBottom: 2,
                }}>
                {/* Avatar */}
                <Avatar
                    sx={{
                        backgroundColor: isUser ? 'green' : 'blue',
                        marginLeft: isUser ? 2 : 0,
                        marginRight: isUser ? 0 : 2,
                    }}>
                    {isUser ? 'U' : 'A'}
                </Avatar>

                {/* Message Bubble */}
                <Paper
                    elevation={1}
                    sx={{
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: isUser ? 'green.100' : 'blue.100',
                        color: isUser ? 'green.900' : 'blue.900',
                        maxWidth: '70%',
                    }}>
                    <Typography>{message.content}</Typography>
                </Paper>
            </Box>
        </Fade>
    );
};

export default Message;
