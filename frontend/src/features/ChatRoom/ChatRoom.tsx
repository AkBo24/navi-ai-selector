import { Box, Typography } from '@mui/material';
import {
    useCreateCompletionMutation,
    useGetChatRoomMessagesQuery,
    useGetChatRoomQuery,
    type ChatRoom,
} from '../../services/api';
import { Formik } from 'formik';
import Message from './components/Message';
import * as yup from 'yup';
import FormikTextField from '../../components/FormikTextField';

const schema = yup.object().shape({
    content: yup.string().required('Required'),
});

const ChatRoom: React.FC<{ roomId: string }> = ({ roomId }) => {
    const { data: room, isSuccess } = useGetChatRoomQuery(roomId);
    const { data: messages, isSuccess: isMessagesSuccess } =
        useGetChatRoomMessagesQuery(roomId);
    const [createCompletion] = useCreateCompletionMutation();
    // const prompt: Omit<Prompt, 'content'> = {
    //     model: model_id,
    //     provider,
    //     systemPrompt: system_prompt,
    // };

    const handleSubmit = (
        values: { content: string },
        { resetForm }: { resetForm: () => void }
    ) => {
        if (room == null) return;
        console.log('Submitted:', values);

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
            <>
                <Box
                    sx={{
                        flexGrow: 1,
                        overflow: 'auto',
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        p: 2,
                    }}>
                    <Typography variant='h4' sx={{ mb: 2 }}>
                        {room.title}
                    </Typography>
                    {isMessagesSuccess &&
                        messages.map(
                            (m) => m.role != 'system' && <Message message={m} />
                        )}
                </Box>
                <Formik
                    initialValues={{ content: '' }}
                    validationSchema={schema}
                    onSubmit={handleSubmit}>
                    {({ submitForm }) => (
                        <Box
                            component='form'
                            onSubmit={(e) => {
                                e.preventDefault();
                                submitForm();
                            }}>
                            <FormikTextField
                                name='content'
                                label='content'
                                variant='outlined'
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        submitForm();
                                    }
                                }}
                                fullWidth
                            />
                        </Box>
                    )}
                </Formik>
            </>
        )
    );
};

export default ChatRoom;
