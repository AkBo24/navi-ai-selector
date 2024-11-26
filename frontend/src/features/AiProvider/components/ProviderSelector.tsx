import { Autocomplete, TextField } from '@mui/material';

const options = [
    {
        provider: 'Open AI',
        models: ['Model 1', 'Model 2'],
    },
    {
        provider: 'Anthropic',
        models: ['Model 1', 'Model 2'],
    },
];

const ProviderSelector = () => {
    return (
        <>
            <Autocomplete
                options={options.map(({ provider }) => provider)}
                renderInput={(params) => <TextField {...params} label='Provider' />}
                fullWidth
            />
            <Autocomplete
                options={options[0].models}
                renderInput={(params) => <TextField {...params} label='Model' />}
                fullWidth
            />
        </>
    );
};

export default ProviderSelector;
