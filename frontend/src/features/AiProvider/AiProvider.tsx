import { Box, Container } from '@mui/material';
import ProviderSelector from './components/ProviderSelector';
import Chat from './components/Chat';

const AiProvider = () => {
    return (
        <Container>
            <Box display='flex'>
                <ProviderSelector />
            </Box>
            <Box>
                <Chat />
            </Box>
        </Container>
    );
};

export default AiProvider;
