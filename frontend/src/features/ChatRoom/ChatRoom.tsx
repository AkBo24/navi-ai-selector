import React from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {
    useCreateCompletionMutation,
    useGetChatRoomMessagesQuery,
    useGetChatRoomQuery,
} from '../../services/api';
import { Formik } from 'formik';
import Message from './components/Message';
import * as yup from 'yup';

const schema = yup.object().shape({
    content: yup.string().required('Message cannot be empty'),
});

const ChatRoom: React.FC<{ roomId: string }> = ({ roomId }) => {
    const { data: room, isSuccess } = useGetChatRoomQuery(roomId);
    const { data: messages, isSuccess: isMessagesSuccess } =
        useGetChatRoomMessagesQuery(roomId);
    const [createCompletion, { isLoading }] = useCreateCompletionMutation();

    const handleSubmit = (
        values: { content: string },
        { resetForm }: { resetForm: () => void }
    ) => {
        if (!room || !values.content) return;

        createCompletion({
            model: room.model_id,
            provider: room.provider,
            systemPrompt: room.system_prompt,
            content: values.content,
            id: room.id,
        });
        resetForm();
    };

    return (
        isSuccess && (
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <Paper elevation={3} sx={{ padding: 2, borderBottom: '1px solid #ddd' }}>
                    <Typography variant='h5'>{room.title}</Typography>
                </Paper>

                {/* Chat Messages */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: 2,
                        backgroundColor: '#f7f9fc',
                    }}>
                    {isMessagesSuccess &&
                        messages.map(
                            (m, idx) =>
                                m.role !== 'system' && <Message key={idx} message={m} />
                        )}
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                sx={{ marginRight: 1 }}
                            />
                            <IconButton
                                type='submit'
                                color='primary'
                                disabled={isLoading}>
                                {isLoading ? (
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

export default ChatRoom;
