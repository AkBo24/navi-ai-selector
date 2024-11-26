import { Container, Typography } from '@mui/material';
import { useCheckAuthQuery } from './services/api';
import AiProvider from './features/AiProvider/AiProvider';

function App() {
    const { data: isAuthenticated } = useCheckAuthQuery();
    console.log(isAuthenticated);

    return (
        <Container maxWidth='sm'>
            <Typography variant='h3'>Navi AI Project</Typography>
            {/* TODO: Implment Login */}
            <AiProvider />
        </Container>
    );
}

export default App;
