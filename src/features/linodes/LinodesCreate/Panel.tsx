import * as React from 'react';

import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

type ClassNames = 'root' | 'flatImagePanel';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  flatImagePanel: {
    padding: theme.spacing.unit * 3
  },
  root: {}
});

interface Props {
  error?: string;
  title?: string;
  className?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Panel: React.StatelessComponent<CombinedProps> = props => {
  const { classes, children, error, title } = props;
  return (
    <Paper
      className={`${classes.flatImagePanel} ${props.className}`}
      data-qa-tp="Select Image"
    >
      {error && <Notice text={error} error />}
      <Typography role="header" variant="h2" data-qa-tp="Select Image">
        {title || 'Select an Image'}
      </Typography>
      {children}
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(Panel);
