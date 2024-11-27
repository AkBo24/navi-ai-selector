import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    CircularProgress,
    Chip,
    Alert,
    Snackbar,
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
import FormikTextField from '../../components/FormikTextField';
import Loading from './components/Loading';

const schema = yup.object().shape({
    content: yup.string(),
});

const ChatRoom: React.FC<{
    roomId: string;
    initialContent?: string;
    clearInitialContent: () => void;
}> = ({ roomId, initialContent, clearInitialContent }) => {
    const { data: room, isSuccess, isLoading } = useGetChatRoomQuery(roomId);
    const { data: messages, isSuccess: isMessagesSuccess } =
        useGetChatRoomMessagesQuery(roomId);
    const [createCompletionStreaming] = useCreateCompletionStreamingMutation();
    const [isStreaming, setIsStreaming] = useState(false);
    const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);
    const [streamingError, setStreamingError] = useState<string | undefined>();

    // Reference to messages container for auto-scrolling
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages update
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Initiate Streaming
        if (isSuccess && initialContent && !hasSentInitialMessage) {
            const sendInitialMessage = async () => {
                try {
                    setIsStreaming(true);
                    await createCompletionStreaming({
                        model: room.model_id,
                        provider: room.provider,
                        systemPrompt: room.system_prompt,
                        content: initialContent,
                        id: room.id,
                    });
                    setHasSentInitialMessage(true);
                    clearInitialContent(); // Prevent duplicating the first message if we came from a new chat
                } catch (error) {
                    console.error('Streaming error:', error);
                    setStreamingError('Error reading message');
                } finally {
                    setIsStreaming(false);
                }
            };

            sendInitialMessage();
        }
    }, [
        isSuccess,
        initialContent,
        hasSentInitialMessage,
        createCompletionStreaming,
        clearInitialContent,
    ]);

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
            setStreamingError('Error sending message');
        } finally {
            setIsStreaming(false);
        }
    };

    return isLoading ? (
        <Loading />
    ) : (
        isSuccess && (
            <>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Chat Header */}
                    <Paper
                        elevation={3}
                        sx={{ padding: 2, borderBottom: '1px solid #ddd' }}>
                        <Box>
                            <Typography variant='h5'>{room.title}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, marginTop: 1 }}>
                                <Chip
                                    label={`Provider: ${room.provider}`}
                                    color='primary'
                                />
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
                                    m.role !== 'system' && (
                                        <Message key={idx} message={m} />
                                    )
                            )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Chat Input */}
                    <Formik
                        initialValues={{ content: '' }}
                        validationSchema={schema}
                        onSubmit={handleSubmit}>
                        {({ handleChange, handleSubmit }) => (
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
                                <FormikTextField
                                    name='content'
                                    variant='outlined'
                                    label=''
                                    onChange={handleChange}
                                    placeholder='Type your message...'
                                    fullWidth
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                    sx={{ marginRight: 1 }}
                                    size='small'
                                    disabled={isStreaming}
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
                {/* Error Snackbar */}
                <Snackbar
                    open={Boolean(streamingError)}
                    autoHideDuration={6000}
                    onClose={() => setStreamingError(undefined)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert
                        onClose={() => setStreamingError(undefined)}
                        severity='error'
                        variant='filled'
                        sx={{ width: '100%' }}>
                        {streamingError}
                    </Alert>
                </Snackbar>
            </>
        )
    );
};

export default ChatRoom;
