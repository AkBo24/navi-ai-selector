import { Container, Typography } from '@mui/material';
import * as yup from 'yup';

const UserSchema = yup.object({
    username: yup.string().required('Required Field').length(150).default(''),
    password: yup.string().required('Required Field').default(''),
});

const Login = () => {
    console.log(UserSchema.default);

    return (
        <Container>
            <Typography variant='h5'>Login</Typography>
        </Container>
    );
};

export default Login;
