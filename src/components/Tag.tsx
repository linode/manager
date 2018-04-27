import * as React from 'react';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Chip from 'material-ui/Chip';

type CSSClasses = 'label' | 'root';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => {
  return ({
    label: {
    },
    root: {
    },
  });
};

interface Props {
  label: string;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

const Tag: React.SFC<PropsWithStyles> = (props) => {
  return <Chip
    className={props.classes.root}
    label={props.label}
    classes={{ label: props.classes.label }}
  />;
};


export default withStyles(styles, { withTheme: true })<Props>(Tag);
