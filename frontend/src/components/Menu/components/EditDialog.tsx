import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ChatRoom, useUpdateChatRoomMutation } from '../../../services/api';

interface EditDialogProps {
    isOpen: boolean;
    room: ChatRoom | null;
    onClose: () => void;
}

const EditDialog: React.FC<EditDialogProps> = ({ isOpen, room, onClose }) => {
    const [updateRoom, { isLoading }] = useUpdateChatRoomMutation();
    const [error, setError] = useState<string | null>(null);

    const validationSchema = yup.object({
        title: yup.string().required('Title is required'),
    });

    const formik = useFormik({
        initialValues: {
            title: room?.title || '',
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (room?.id) {
                    await updateRoom({ id: room.id, title: values.title }).unwrap();
                    onClose();
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                const message =
                    err?.data?.message ||
                    'An error occurred while updating the chat room.';
                setError(message);
            }
        },
    });

    return (
        <>
            <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth='sm'>
                <DialogTitle>Edit Chat Room</DialogTitle>
                <DialogContent>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            autoFocus
                            margin='dense'
                            name='title'
                            label='Chat Room Title'
                            type='text'
                            fullWidth
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            error={formik.touched.title && Boolean(formik.errors.title)}
                            helperText={formik.touched.title && formik.errors.title}
                            disabled={isLoading}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color='primary' disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={formik.submitForm}
                        color='primary'
                        variant='contained'
                        disabled={isLoading}
                        startIcon={isLoading && <CircularProgress size={20} />}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Snackbar */}
            <Snackbar
                open={Boolean(error)}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert
                    onClose={() => setError(null)}
                    severity='error'
                    variant='filled'
                    sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
};

export default EditDialog;
