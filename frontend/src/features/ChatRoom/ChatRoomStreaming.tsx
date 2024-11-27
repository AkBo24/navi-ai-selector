import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    CircularProgress,
    Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {
    useCreateCompletionStreamingMutation,
    useGetChatRoomMessagesQuery,
    useGetChatRoomQuery,
} from '../../services/api';
import { Formik } from 'formik';
import Message from './components/Message';
import * as yup from 'yup';

const schema = yup.object().shape({
    content: yup.string().required('Message cannot be empty'),
});

const ChatRoomStreaming: React.FC<{ roomId: string }> = ({ roomId }) => {
    const { data: room, isSuccess } = useGetChatRoomQuery(roomId);
    const { data: messages, isSuccess: isMessagesSuccess } =
        useGetChatRoomMessagesQuery(roomId);
    const [createCompletionStreaming] = useCreateCompletionStreamingMutation();
    const [isStreaming, setIsStreaming] = useState(false);

    // Reference to messages container for auto-scrolling
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages update
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (
        values: { content: string },
        { resetForm }: { resetForm: () => void }
    ) => {
        if (!room || !values.content) return;

        try {
            setIsStreaming(true);
            resetForm();

            await createCompletionStreaming({
                model: room.model_id,
                provider: room.provider,
                systemPrompt: room.system_prompt,
                content: values.content,
                id: room.id,
            });
        } catch (error) {
            console.error('Streaming error:', error);
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        isSuccess && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Paper elevation={3} sx={{ padding: 2, borderBottom: '1px solid #ddd' }}>
                    <Box>
                        <Typography variant='h5'>{room.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, marginTop: 1 }}>
                            <Chip label={`Provider: ${room.provider}`} color='primary' />
                            <Chip
                                label={`Model ID: ${room.model_id}`}
                                color='secondary'
                            />
                        </Box>
                    </Box>
                </Paper>

                {/* Chat Messages */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        padding: 2,
                        backgroundColor: '#f7f9fc',
                    }}>
                    {isMessagesSuccess &&
                        messages.map(
                            (m, idx) =>
                                m.role !== 'system' && <Message key={idx} message={m} />
                        )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Chat Input */}
                <Formik
                    initialValues={{ content: '' }}
                    validationSchema={schema}
                    onSubmit={handleSubmit}>
                    {({ values, handleChange, handleSubmit }) => (
                        <Box
                            component='form'
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                            sx={{
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center',
                                borderTop: '1px solid #ddd',
                                backgroundColor: '#fff',
                            }}>
                            <TextField
                                name='content'
                                value={values.content}
                                onChange={handleChange}
                                placeholder='Type your message...'
                                variant='outlined'
                                fullWidth
                                size='small'
                                disabled={isStreaming}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                sx={{ marginRight: 1 }}
                            />
                            <IconButton
                                type='submit'
                                color='primary'
                                disabled={isStreaming}>
                                {isStreaming ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <SendIcon />
                                )}
                            </IconButton>
                        </Box>
                    )}
                </Formik>
            </Box>
        )
    );
};

export default ChatRoomStreaming;
