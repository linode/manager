import * as React from 'react';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Chip from 'material-ui/Chip';

type CSSClasses = 'label' | 'root';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => {
  return ({
    label: {
      paddingLeft: theme.spacing.unit * .5,
      paddingRight: theme.spacing.unit * .5,
    },
    root: {
      borderRadius: '3px',
      height: '24px',
    },
  });
};

interface Props {
  label: string;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

const TagComponent: React.SFC<PropsWithStyles> = (props) => {
  return <Chip
    className={props.classes.root}
    label={props.label}
    classes={{ label: props.classes.label }}
  />;
};


export default withStyles(styles, { withTheme: true })<Props>(TagComponent);
