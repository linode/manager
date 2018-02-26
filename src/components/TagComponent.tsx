import * as React from 'react';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Chip from 'material-ui/Chip';

type CSSClasses = 'root';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {
    borderRadius: '4px',
    height: '20px',
    marginRight: '7px',
  },
});

interface Props {
  label: string;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

const TagComponent: React.SFC<PropsWithStyles> = (props) => {
  return (<Chip className={props.classes.root} label={props.label} />);
};


export default withStyles(styles, { withTheme: true })<Props>(TagComponent);
