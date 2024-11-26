import { Container, Typography } from '@mui/material';
import TodoList from './components/Todo/TodoList';
import { useCheckAuthQuery } from './services/api';
import Login from './components/Login/Login';

function App() {
    const { data: isAuthenticated, isError, isSuccess } = useCheckAuthQuery();
    console.log(isAuthenticated);

    return (
        <Container maxWidth='sm'>
            <Typography variant='h3' textAlign='center'>
                Todos
            </Typography>
            {isError && <Login />}
            {isSuccess && <TodoList />}
        </Container>
    );
}

export default App;
