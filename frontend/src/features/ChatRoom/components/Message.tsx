import React from 'react';
import type { Message2 } from '../../../services/api';
import { Box, BoxProps, Typography } from '@mui/material';

const Message: React.FC<{ message: Message2 }> = ({ message }) => {
    const isUser = message.role === 'user';
    const options: BoxProps = {
        sx: {
            maxWidth: '70%',
            padding: 1,
            borderRadius: 1,
            backgroundColor: isUser ? 'green.100' : 'blue.100',
            color: isUser ? 'green' : 'blue.900',
            alignSelf: isUser ? 'flex-end' : '',
            marginBottom: 1,
            background: isUser ? 'wheat' : '',
        },
    };

    return (
        <Box {...options}>
            <Typography>{message.content}</Typography>
        </Box>
    );
};

export default Message;
