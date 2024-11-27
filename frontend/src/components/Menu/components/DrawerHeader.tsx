import React from 'react';
import { Box, Typography } from '@mui/material';

interface DrawerHeaderProps {
    title: string;
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ title }) => (
    <Box sx={{ p: 2 }}>
        <Typography variant='h6' noWrap>
            {title}
        </Typography>
    </Box>
);

export default DrawerHeader;
