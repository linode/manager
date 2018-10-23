import * as React from 'react';
import { storiesOf } from '@storybook/react';

import Button from 'src/components/Button';
import { default as MDivider } from '@material-ui/core/Divider';
import ThemeDecorator from '../utilities/storybookDecorators';
import Typography from '@material-ui/core/Typography';

const Divider = () => <MDivider style={{ marginBottom: '8px', marginTop: '8px' }} />;

storiesOf('Typography', module)
.addDecorator(ThemeDecorator)
.add('Headings', () => (
    <React.Fragment>
        <Typography component="h2" variant="display4" gutterBottom>
            Display4
        </Typography>
        <Typography variant="display3" gutterBottom>
            Display3
        </Typography>
        <Typography variant="display2" gutterBottom>
            Display2
        </Typography>
        <Typography variant="display1" gutterBottom>
            Display1
        </Typography>
        <Typography variant="headline" gutterBottom>
            Headline
        </Typography>
        <Typography variant="title" gutterBottom>
            Title
        </Typography>
        <Typography variant="subheading" gutterBottom>
            Subheading. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
        </Typography>
    </React.Fragment>
))

storiesOf('Typography', module) 
.addDecorator(ThemeDecorator)
.add('Text', () => (
    <React.Fragment>
        <Typography variant="body2" gutterBottom>
       Body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
        </Typography>
        <Divider />
        <Typography variant="body1" gutterBottom>
        Body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
            unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
            dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Divider />
        <Typography variant="caption" gutterBottom>
        Caption.
        </Typography>
        <Divider />
        <Typography variant="button" gutterBottom>
            Button
        </Typography>
        <Divider />
        <Typography gutterBottom>
        Base typography component example, no variant applied. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
            unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
            dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Divider />
    </React.Fragment>
));

storiesOf('Typography', module) 
.addDecorator(ThemeDecorator)
.add('Buttons', () => (
    <React.Fragment>
        <Button type="primary" data-qa-button="primary">Primary</Button>
        <Divider />
        <Button type="secondary" data-qa-button="secondary">Secondary</Button>
        <Divider />
        <Button type="cancel" data-qa-button="cancel">Cancel</Button>
        <Divider />
        <Button type="remove" data-qa-button="remove"/>
        <Divider />
    </React.Fragment>
));

