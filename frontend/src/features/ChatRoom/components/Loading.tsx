import { Box, Paper, Skeleton } from '@mui/material';
import React from 'react';

const Loading = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Chat Header Skeleton */}
            <Paper
                elevation={3}
                sx={{ padding: 2, borderBottom: '1px solid #ddd', marginBottom: 2 }}>
                <Skeleton variant='text' width='60%' height={32} />
                <Skeleton
                    variant='rectangular'
                    width='80px'
                    height={24}
                    sx={{ marginTop: 1 }}
                />
                <Skeleton
                    variant='rectangular'
                    width='100px'
                    height={24}
                    sx={{ marginTop: 1 }}
                />
            </Paper>

            {/* Messages Skeleton */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    padding: 2,
                    backgroundColor: '#f7f9fc',
                }}>
                {[...Array(5)].map((_, index) => (
                    <Skeleton
                        key={index}
                        variant='rectangular'
                        width='80%'
                        height={24}
                        sx={{ marginBottom: 2 }}
                    />
                ))}
            </Box>

            {/* Chat Input Skeleton */}
            <Box
                sx={{
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderTop: '1px solid #ddd',
                    backgroundColor: '#fff',
                }}>
                <Skeleton variant='rectangular' width='90%' height={36} />
                <Skeleton
                    variant='circular'
                    width={36}
                    height={36}
                    sx={{ marginLeft: 1 }}
                />
            </Box>
        </Box>
    );
};

export default Loading;
