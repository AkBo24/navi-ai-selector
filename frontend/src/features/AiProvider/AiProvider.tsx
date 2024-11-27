import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Container,
    Snackbar,
    TextField,
} from '@mui/material';
import { useState } from 'react';
import {
    Prompt,
    useCreateCompletionMutation,
    useGetProvidersQuery,
    useLazyGetModelsQuery,
} from '../../services/api';
import { Formik } from 'formik';
import * as yup from 'yup';
import Message from './components/Message';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const schema = yup.object<Prompt>({
    provider: yup.string().oneOf(['Anthropic', 'OpenAI']).required('Required'),
    model: yup.string().required('Required'),
    systemPrompt: yup.string(),
    message: yup.string().required('Required'),
});

const AiProvider = () => {
    const { data: providers, isSuccess, isLoading } = useGetProvidersQuery();
    const [createCompletion] = useCreateCompletionMutation();
    const [trigger] = useLazyGetModelsQuery();
    const [models, setModels] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [completionError, setCompletionError] = useState<string | undefined>();

    const handleSubmit = async (values: Prompt) => {
        try {
            const { data, error } = await createCompletion(values);

            if (error) {
                // Extract and format error messages from FetchBaseQueryError
                const errorData = (error as FetchBaseQueryError)?.data;
                let errorMessage = 'An unknown error occurred';

                if (errorData && typeof errorData === 'object') {
                    // Iterate over all keys in the error data and concatenate messages
                    errorMessage = Object.entries(errorData)
                        .map(([field, messages]) =>
                            Array.isArray(messages)
                                ? `${field}: ${messages.join(', ')}`
                                : `${field}: ${messages}`
                        )
                        .join('\n');
                }

                setCompletionError(errorMessage);
                return;
            }
            // Update messages on successful response
            setMessages((prev) => [
                ...prev,
                { from: 'user', content: values.message },
                {
                    from: 'provider',
                    content:
                        values.provider === 'OpenAi'
                            ? data.choices[0].message.content
                            : data.content,
                },
            ]);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: unknown) {
            setCompletionError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <>
            <Formik
                onSubmit={handleSubmit}
                validationSchema={schema}
                initialValues={{
                    provider: '',
                    model: '',
                    systemPrompt: '',
                    message: '',
                }}>
                {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    setFieldValue,
                    submitForm,
                }) => (
                    <Container>
                        <Box display='flex' gap={2} mb={2}>
                            {/* Provider Autocomplete */}
                            <Autocomplete
                                options={isSuccess ? providers : []}
                                getOptionLabel={(option) => option || ''}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label='Provider'
                                        error={
                                            touched.provider && Boolean(errors.provider)
                                        }
                                        helperText={touched.provider && errors.provider}
                                    />
                                )}
                                fullWidth
                                onChange={async (e, value) => {
                                    if (!value) {
                                        setFieldValue('provider', '');
                                        setFieldValue('model', '');
                                        setModels([]);
                                    } else {
                                        setFieldValue('provider', value);
                                        const { data, isSuccess } = await trigger(value);
                                        if (isSuccess) {
                                            setModels(data);
                                            setFieldValue('model', '');
                                        }
                                    }
                                }}
                                loading={isLoading}
                                noOptionsText='No providers found'
                            />

                            {/* Model Autocomplete */}
                            <Autocomplete
                                options={models}
                                getOptionLabel={(option) => option || ''}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label='Model'
                                        error={touched.model && Boolean(errors.model)}
                                        helperText={touched.model && errors.model}
                                    />
                                )}
                                fullWidth
                                onChange={(e, value) => setFieldValue('model', value)}
                                noOptionsText='Choose a model'
                            />
                        </Box>

                        <Box
                            display='flex'
                            flexDirection='column'
                            sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
                            {messages.map((m, i) => (
                                <Message message={m} key={i} />
                            ))}
                        </Box>

                        <Box display='flex' flexDirection='column' gap={2}>
                            <TextField
                                id='system-prompt'
                                name='systemPrompt'
                                label='System Prompt'
                                variant='outlined'
                                value={values.systemPrompt}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                id='message'
                                name='message'
                                label='Message'
                                variant='outlined'
                                value={values.message}
                                onChange={handleChange}
                                error={touched.message && Boolean(errors.message)}
                                helperText={touched.message && errors.message}
                                fullWidth
                            />
                            <Button
                                type='submit'
                                variant='contained'
                                onClick={() => {
                                    if (Object.keys(errors).length === 0) submitForm();
                                }}>
                                Send
                            </Button>
                        </Box>
                    </Container>
                )}
            </Formik>

            {/* Snackbar for Error Display */}
            <Snackbar
                open={Boolean(completionError)}
                autoHideDuration={6000}
                onClose={() => setCompletionError(undefined)}>
                <Alert
                    onClose={() => setCompletionError(undefined)}
                    severity='error'
                    variant='filled'
                    sx={{ width: '100%' }}>
                    {completionError}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AiProvider;
