import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../utilities/storybookDecorators';
import Typography from '@material-ui/core/Typography';

storiesOf('Typography', module)
.addDecorator(ThemeDecorator)
.add('Display4', () => (
    <Typography component="h2" variant="display4">
        Display4
    </Typography>
))
.add('Display3', () => (
    <Typography variant="display3">
        Display3
    </Typography>
))
.add('Display2', () => (
    <Typography variant="display2">
        Display2
    </Typography>
))
.add('Display1', () => (
    <Typography variant="display1">
        Display1
    </Typography>
))
.add('Headline', () => (
    <Typography variant="headline">
        Headline
    </Typography>
))
.add('Title', () => (
    <Typography variant="title">
        Title
    </Typography>
))
.add('Subheading', () => (
    <Typography variant="subheading">
       Subheading. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
    </Typography>
))
.add('Body2', () => (
    <Typography variant="body2">
       Body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
    </Typography>
))
.add('Body1', () => (
    <Typography variant="body1">
       Body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
        unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
        dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
    </Typography>
))
.add('Caption', () => (
    <Typography variant="caption">
       Caption Text
    </Typography>
))
.add('Button', () => (
    <Typography variant="button">
        button text
    </Typography>
));
