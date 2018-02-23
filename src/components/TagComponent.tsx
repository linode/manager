import * as React from 'react';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRules,
} from 'material-ui/styles';
import Chip from 'material-ui/Chip';

const styles = (theme: Theme): StyleRules => ({
  root: {
    borderRadius: '4px',
    height: '20px',
    marginRight: '7px',
  },
});

interface Props {
  label: string;
}

type PropsWithStyles = Props & WithStyles<'root'>;

const TagComponent: React.SFC<PropsWithStyles> = (props) => {
  return (<Chip className={props.classes.root} label={props.label} />);
};


export default withStyles(styles, { withTheme: true })<Props>(TagComponent);
