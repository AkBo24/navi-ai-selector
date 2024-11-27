import React, { useState } from 'react';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Container,
    Paper,
    Snackbar,
    TextField,
    Typography,
    CircularProgress,
} from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import FormikTextField from '../components/FormikTextField';
import {
    ChatRoom,
    Prompt,
    useCreateCompletionMutation,
    useGetProvidersQuery,
    useLazyGetModelsQuery,
} from '../services/api';

const schema = yup.object().shape({
    provider: yup
        .string()
        .oneOf(['Anthropic', 'OpenAI'])
        .required('Provider is required'),
    model: yup.string().required('Model is required'),
    systemPrompt: yup.string().required('System Prompt is required'),
    content: yup.string().required('Message is required'),
});

const NewChat: React.FC<{ handleSelectRoom: (room: ChatRoom | null) => void }> = ({
    handleSelectRoom,
}) => {
    const {
        data: providers,
        isSuccess: isProvidersSuccess,
        isLoading: isProvidersLoading,
    } = useGetProvidersQuery();

    const [createCompletion, { isLoading: isCreating }] = useCreateCompletionMutation();
    const [getModels, { isFetching: isModelsFetching }] = useLazyGetModelsQuery();
    const [models, setModels] = useState<string[]>([]);
    const [completionError, setCompletionError] = useState<string | undefined>();

    const handleSubmit = async (
        values: Prompt,
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        try {
            const { data, error } = await createCompletion(values);

            if (error) {
                let errorMessage = 'An unknown error occurred';

                if ('data' in error && typeof error.data === 'object') {
                    const errorData = error.data || {};
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

            if (data && 'chatroom' in data) {
                handleSelectRoom(data.chatroom);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setCompletionError('An unexpected error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Formik
                initialValues={{
                    provider: '',
                    model: '',
                    systemPrompt: '',
                    content: '',
                }}
                validationSchema={schema}
                onSubmit={handleSubmit}>
                {({
                    values,
                    errors,
                    touched,
                    setFieldValue,
                    submitForm,
                    isSubmitting,
                }) => (
                    <Container>
                        <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
                            <Typography variant='h5' component='h1' gutterBottom>
                                Start a New Chat
                            </Typography>
                            <Box display='flex' flexDirection='column' gap={2}>
                                <Autocomplete
                                    options={isProvidersSuccess ? providers : []}
                                    getOptionLabel={(option) => option || ''}
                                    value={values.provider || null}
                                    onChange={async (e, value) => {
                                        // Get the models when the provider is updated
                                        setFieldValue('provider', value || '');
                                        setFieldValue('model', '');
                                        setModels([]);
                                        if (value) {
                                            const { data } = await getModels(value);
                                            if (data) {
                                                setModels(data);
                                            }
                                        }
                                    }}
                                    renderInput={(params) => {
                                        params.InputProps.endAdornment = (
                                            <>
                                                {isProvidersLoading ? (
                                                    <CircularProgress size={20} />
                                                ) : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        );
                                        return (
                                            <TextField
                                                {...params}
                                                label='Provider'
                                                error={
                                                    touched.provider &&
                                                    Boolean(errors.provider)
                                                }
                                                helperText={
                                                    touched.provider && errors.provider
                                                }
                                            />
                                        );
                                    }}
                                    loading={isProvidersLoading}
                                    noOptionsText={
                                        isProvidersLoading
                                            ? 'Loading providers...'
                                            : 'No providers found'
                                    }
                                />

                                {/* Model Selection */}
                                <Autocomplete
                                    options={models}
                                    getOptionLabel={(option) => option || ''}
                                    value={values.model || null}
                                    onChange={(e, value) =>
                                        setFieldValue('model', value || '')
                                    }
                                    renderInput={(params) => {
                                        // Add the loading spinner to the end adornment
                                        params.InputProps.endAdornment = (
                                            <>
                                                {isModelsFetching ? (
                                                    <CircularProgress size={20} />
                                                ) : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        );
                                        return (
                                            <TextField
                                                {...params}
                                                label='Model'
                                                error={
                                                    touched.model && Boolean(errors.model)
                                                }
                                                helperText={touched.model && errors.model}
                                            />
                                        );
                                    }}
                                    disabled={isModelsFetching}
                                    loading={isModelsFetching}
                                    noOptionsText={
                                        isModelsFetching
                                            ? 'Loading models...'
                                            : 'No models found'
                                    }
                                />

                                <FormikTextField
                                    name='systemPrompt'
                                    label='System Prompt'
                                    variant='outlined'
                                    multiline
                                    minRows={3}
                                    placeholder='e.g., You are a helpful assistant.'
                                />

                                <FormikTextField
                                    name='content'
                                    label='Message'
                                    variant='outlined'
                                    multiline
                                    minRows={3}
                                    placeholder='Type your message here...'
                                />

                                <Button
                                    type='submit'
                                    variant='contained'
                                    color='primary'
                                    onClick={submitForm}
                                    disabled={isSubmitting || isCreating}
                                    endIcon={
                                        isSubmitting || isCreating ? (
                                            <CircularProgress size={20} />
                                        ) : null
                                    }>
                                    Send
                                </Button>
                            </Box>
                        </Paper>
                    </Container>
                )}
            </Formik>

            {/* Error Snackbar */}
            <Snackbar
                open={Boolean(completionError)}
                autoHideDuration={6000}
                onClose={() => setCompletionError(undefined)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
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

export default NewChat;
