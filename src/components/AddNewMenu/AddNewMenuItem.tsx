import * as React from 'react';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';

type CSSClasses = 'root';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    maxWidth: '315px',
    cursor: 'pointer',
  },
});

export interface MenuItem {
  title: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  body: string;
}

interface Props extends MenuItem {
  index: number;
  count: number;
}

interface State {
  anchorEl?: HTMLElement;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

class AddNewMenuItem extends React.Component<PropsWithStyles, State> {
  render() {
    const { classes, title, onClick, body, index, count } = this.props;

    return (
      <React.Fragment>
        <div onClick={onClick} className={classes.root}>
          <Typography><a href="#">{title}</a></Typography>
          <Typography>{body}</Typography>
        </div>
        {index + 1 !== count && <Divider />}
      </React.Fragment>
    );
  }

}

export default withStyles(styles, { withTheme: true })<Props>(AddNewMenuItem);
