import * as React from 'react';
import { PlaceholderProps } from 'react-select/lib/components/Placeholder';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    position: 'absolute',
    left: '10px'
  },
});

interface Props extends PlaceholderProps<any> { }

type CombinedProps = Props & WithStyles<ClassNames>;

const SelectPlaceholder: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <Typography
      data-qa-enhanced-select
      className={props.classes.root}
      color="textSecondary"
      {...props.innerProps}
      data-qa-enhanced-select
    >
      {props.children}
    </Typography>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SelectPlaceholder);
