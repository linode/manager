import { default as MDivider } from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Placeholder from 'src/components/Placeholder';

const Divider = () => <MDivider style={{ marginBottom: '8px', marginTop: '8px' }} />;

storiesOf('Typography', module)
.add('Headings', () => (
    <React.Fragment>
        <Typography variant="headline" gutterBottom>
            Primary Heading
        </Typography>
        <Typography variant="body1" gutterBottom>
            Implemented using the 'headline' variant. Utilized for page-level headings and high-level typographical components, such as editable text and breadcrumbs.
        </Typography>
        <Divider />
        <Typography variant="title" gutterBottom>
            Secondary Heading
        </Typography>
        <Typography variant="body1" gutterBottom>
            Implemented using the 'title' variant. Utilized for section-level headings, such as drawers, some table headers and panel sections.
        </Typography>
        <Divider />
        <Typography variant="subheading" gutterBottom>
            Tertiary Heading
        </Typography>
        <Typography variant="body1" gutterBottom>
            Implemented using the 'subheading' variant. Utilized for sub-section headings.
        </Typography>
        <Divider />
        <Typography variant="display2" gutterBottom>
            Display2
        </Typography>
        <Typography variant="body1" gutterBottom>
            This is part of MUI. It is utilized for the empty linode list state.
        </Typography>
        <Divider />
        <Placeholder
        title="Placeholder/Null Heading"
        copy="This is a separate component utilized for null state headings."
        />
        <Divider />
        <Typography component="h2" variant="display4" gutterBottom>
            Display4
        </Typography>
        <Typography variant="body1" gutterBottom>
            This is part of MUI. Manager does not presently utilize this variant.
        </Typography>
        <Divider />
        <Typography variant="display3" gutterBottom>
            Display3
        </Typography>
        <Typography variant="body1" gutterBottom>
            This is part of MUI. Manager does not presently utilize this variant.
        </Typography>
        <Divider />
        <Typography variant="display1" gutterBottom>
            Display1
        </Typography>
        <Typography variant="body1" gutterBottom>
            This is part of MUI. Manager does not presently utilize this variant.
        </Typography>
    </React.Fragment>
))

storiesOf('Typography', module)
.add('Text', () => (
    <React.Fragment>
        <Typography variant="body2" gutterBottom>
            Body2. Implemented using the 'body2' variant.
            Styles are identical for both body variants since there are
            2 defined by MUI but Manager only has 1 body style. Utilized for general body text, messaging, descriptions, and helper info.
        </Typography>
        <Divider />
        <Typography variant="body1" gutterBottom>
            Body1. Implemented using the 'body1' variant.
            Styles are identical for both body variants since there are
            2 defined by MUI but Manager only has 1 body style. Utilized for general body text, messaging, descriptions, and helper info.
        </Typography>
        <Divider />
        <Typography variant="caption" gutterBottom>
            Caption. Implemented using the 'caption' variant. Utilized for helper info on some form elements (ex. password strength indicator) and secondary descriptions (ex. search result items).
        </Typography>
        <Divider />
        <Typography gutterBottom>
            Base typography component example, no variant applied. Utilized wherever typography component is declared without a specific variant.
        </Typography>
        <Divider />
        <Typography variant="button" gutterBottom>
            Button. Implemented using the 'button' variant. This is part of MUI. Manager does not presently utilize this variant.
        </Typography>
        <Divider />
    </React.Fragment>
));
