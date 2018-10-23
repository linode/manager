import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { default as MDivider } from '@material-ui/core/Divider';
import ThemeDecorator from '../utilities/storybookDecorators';
import TextField from './TextField';


const Divider = () => <MDivider style={{ marginBottom: '8px', marginTop: '8px' }} />;

storiesOf('Forms', module)
.addDecorator(ThemeDecorator)
.add('Form Examples', () => (
    <React.Fragment>
        <TextField
            label="Default"
            placeholder="Default"
        >
            Default Input
        </TextField>
        <TextField
            label="Email"
            placeholder="Email"
            inputType="email"
        >
            Email Input
        </TextField>
        <TextField
            label="Number"
            placeholder="Number"
            inputType="number"
        >
            Number Input
        </TextField>
        <TextField
            label="Tel"
            placeholder="Telephone"
            inputType="tel"
        >
            Telephone Input
        </TextField>
        <TextField
            label="Textarea"
            placeholder="Textarea"
            multiline={true}
            rows={3}
        >
            Textarea
        </TextField>
    </React.Fragment>
));

