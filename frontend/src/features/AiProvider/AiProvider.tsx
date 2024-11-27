import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Container,
    Snackbar,
    TextField,
} from '@mui/material';
import React, { useState } from 'react';
import {
    ChatRoom,
    Prompt,
    useCreateCompletionMutation,
    useGetProvidersQuery,
    useLazyGetModelsQuery,
} from '../../services/api';
import { Formik } from 'formik';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import * as yup from 'yup';
import FormikTextField from '../../components/FormikTextField';

const schema = yup.object<Prompt>({
    provider: yup.string().oneOf(['Anthropic', 'OpenAI']).required('Required'),
    model: yup.string().required('Required'),
    systemPrompt: yup.string().required('Required'),
    content: yup.string().required('Required'),
});

const AiProvider: React.FC<{ handleSelectRoom: (room: ChatRoom) => void }> = ({
    handleSelectRoom,
}) => {
    const { data: providers, isSuccess, isLoading } = useGetProvidersQuery();
    const [createCompletion] = useCreateCompletionMutation();
    const [trigger] = useLazyGetModelsQuery();
    const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
    const [models, setModels] = useState<string[]>([]);
    const [completionError, setCompletionError] = useState<string | undefined>();

    const handleSubmit = async (values: Prompt) => {
        console.log(values);
        try {
            const { data, error } = await createCompletion(values);

            if (error) {
                // Extract and format error messages from FetchBaseQueryError
                const errorData = (error as FetchBaseQueryError)?.data;
                console.error(error);

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

            handleSelectRoom(data.chatroom);
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
                    content: '',
                }}>
                {({ values, errors, setFieldValue, submitForm }) => (
                    <Container>
                        <Box display='flex' gap={2} mb={2}>
                            <Autocomplete
                                options={isSuccess ? providers : []}
                                getOptionLabel={(option) => option || ''}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label='Provider'
                                        error={errors.provider != undefined}
                                        helperText={errors.provider}
                                    />
                                )}
                                fullWidth
                                onChange={async (e, value) => {
                                    console.log(`${value}`);
                                    if (!value) {
                                        setFieldValue('provider', '');
                                        setFieldValue('model', '');
                                        setModels([]);
                                    } else {
                                        setFieldValue('provider', value);
                                        setIsModelLoading(true);
                                        setFieldValue('model', '');
                                        const { data, isSuccess } = await trigger(value);
                                        if (isSuccess) {
                                            setModels(data);
                                            setIsModelLoading(false);
                                        }
                                    }
                                }}
                                loading={isLoading}
                                noOptionsText='No providers found'
                            />

                            <Autocomplete
                                options={models}
                                getOptionLabel={(option) => option || ''}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label='Model'
                                        error={errors.model != undefined}
                                        helperText={errors.model}
                                    />
                                )}
                                fullWidth
                                onChange={(e, value) => setFieldValue('model', value)}
                                noOptionsText='Choose a model'
                                disabled={isModelLoading}
                                value={values.model}
                            />
                        </Box>

                        <Box display='flex' flexDirection='column' gap={2}>
                            <FormikTextField
                                name='systemPrompt'
                                label='System Prompt'
                                variant='outlined'
                            />

                            <FormikTextField
                                name='content'
                                label='Message'
                                variant='outlined'
                            />

                            <Button
                                type='submit'
                                variant='contained'
                                onClick={submitForm}>
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
