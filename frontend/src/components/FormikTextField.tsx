import { TextField, TextFieldProps } from '@mui/material';
import { useField } from 'formik';

type FormikTextFieldProps = {
    name: string;
    label: string;
} & Omit<TextFieldProps, 'name' | 'label'>;

const FormikTextField = ({ name, label, ...props }: FormikTextFieldProps) => {
    const [field, meta] = useField(name);

    return (
        <TextField
            {...field}
            {...props}
            label={label}
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            fullWidth
        />
    );
};

export default FormikTextField;
