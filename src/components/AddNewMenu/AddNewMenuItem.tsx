import * as React from 'react';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import LinodeTheme from 'src/theme';

type CSSClasses = 'root' 
| 'content' 
| 'titleLink'
| 'body';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    maxWidth: '350px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: LinodeTheme.bg.offWhite,
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
  },
  titleLink: {
    textDecoration: 'none',
    color: 'black',
    fontSize: '1.1rem',
  },
  body: {
    marginTop: theme.spacing.unit / 2,
    lineHeight: '1.1rem',
  },
});

export interface MenuItem {
  title: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  body: string;
  icon: string;
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
    const { classes, title, onClick, body, icon, index, count } = this.props;

    return (
      <React.Fragment>
        <div onClick={onClick} className={classes.root}>
          <img src={icon} width="50" height="50" />
          <div className={classes.content}>
            <Typography variant="subheading">
              <a href="#" className={classes.titleLink}>{title}</a>
            </Typography>
            <Typography variant="body1" className={classes.body}>
              {body}
            </Typography>
          </div>
        </div>
        {index + 1 !== count && <Divider />}
      </React.Fragment>
    );
  }

}

export default withStyles(styles, { withTheme: true })<Props>(AddNewMenuItem);
