import { Box, Typography } from '@mui/material';
import {
    Prompt,
    Role,
    useCreateCompletionMutation,
    type ChatRoom,
} from '../../services/api';
import { Formik } from 'formik';
import Message from './components/Message';
import * as yup from 'yup';
import FormikTextField from '../../components/FormikTextField';

const schema = yup.object().shape({
    content: yup.string().required('Required'),
});

const ChatRoom: React.FC<{ room: ChatRoom }> = ({
    room: { title, messages, system_prompt, model_id, provider, id },
}) => {
    const [createCompletion] = useCreateCompletionMutation();
    const prompt: Omit<Prompt, 'content'> = {
        model: model_id,
        provider,
        systemPrompt: system_prompt,
    };
    console.log(messages);

    const handleSubmit = (
        values: { content: string },
        { resetForm }: { resetForm: () => void }
    ) => {
        console.log('Submitted:', values);

        createCompletion({
            ...prompt,
            content: values.content,
            id,
        });
        resetForm();
    };

    return (
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
                    {title}
                </Typography>
                {messages.map((m) => m.role != 'system' && <Message message={m} />)}
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
    );
};

export default ChatRoom;
