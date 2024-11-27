import React from 'react';
import { Box, Skeleton } from '@mui/material';

const LoadingMessageSkeleton: React.FC = () => (
    <Box sx={{ display: 'flex', mb: 2 }}>
        {/* Avatar Skeleton */}
        <Box sx={{ mr: 2 }}>
            <Skeleton variant='circular' width={40} height={40} />
        </Box>
        {/* Message Skeleton */}
        <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant='rectangular' height={20} width='80%' sx={{ mb: 1 }} />
            <Skeleton variant='rectangular' height={20} width='90%' sx={{ mb: 1 }} />
            <Skeleton variant='rectangular' height={20} width='75%' />
        </Box>
    </Box>
);

export default LoadingMessageSkeleton;
