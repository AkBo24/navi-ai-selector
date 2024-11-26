import { Autocomplete, TextField, Typography } from '@mui/material';
import { useGetProvidersQuery, useLazyGetModelsQuery } from '../../../services/api';
import { useState } from 'react';

const ProviderSelector = () => {
    const { data: providers, isSuccess } = useGetProvidersQuery();
    const [trigger] = useLazyGetModelsQuery();
    const [models, setModels] = useState<string[]>([]);

    return isSuccess ? (
        <>
            <Autocomplete
                options={providers}
                renderInput={(params) => <TextField {...params} label='Provider' />}
                fullWidth
                onChange={async () => {
                    const { data, isSuccess } = await trigger('OpenAi');
                    if (isSuccess) {
                        setModels(data);
                    }
                }}
            />
            <Autocomplete
                options={models}
                renderInput={(params) => <TextField {...params} label='Model' />}
                fullWidth
                noOptionsText='Choose a model'
            />
        </>
    ) : (
        <Typography>Loading</Typography>
    );
};

export default ProviderSelector;
