import { useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

const Hello = () => {
    const [counter, setCounter] = React.useState(0);

    const queryClient = useQueryClient();

    const theme = useTheme();

    return <>
    <h1>Remote App</h1>
    <p>React version: {React.version}</p>
    <p>Query Client Cache: <pre>{JSON.stringify(queryClient.getQueriesData({}), null, 2)}</pre></p>
    <p>MUI Theme: <pre>{JSON.stringify(theme, null, 2)}</pre></p>
    <p>Count is: {counter}</p>
    <button onClick={() => setCounter(prev => prev + 1)}>+1</button>
    </>;
}

export default Hello;