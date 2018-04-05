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
| 'body'
| 'iconWrapper';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  '@keyframes dash': {
    to: {
      'stroke-dashoffset': 0,
    },
  },
  root: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    maxWidth: '350px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color .2s ease-in-out',
    '&:hover': {
      backgroundColor: LinodeTheme.bg.offWhite,
      '& .circle': {
        fill: theme.palette.primary.main,
        transition: 'fill .2s ease-in-out .2s',
      },
      '& .outerCircle': {
        stroke: '#2967B1',
        strokeDasharray: 1000,
        strokeDashoffset: 1000,
        animation: 'dash 2s linear forwards',
      },
      '& .insidePath *': {
        transition: 'fill .2s ease-in-out .2s, stroke .2s ease-in-out .2s',
        stroke: 'white',
      },
    },
  },
  iconWrapper: {
    width: 49,
    height: 49,
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
    fontSize: '1.18rem',
  },
  body: {
    marginTop: 3,
    fontSize: '.9rem',
    lineHeight: '1.1rem',
  },
});

export interface MenuItem {
  title: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  body: string;
  ItemIcon: React.ComponentClass<any>;
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
    const { classes, title, onClick, body, ItemIcon, index, count } = this.props;

    return (
      <React.Fragment>
        <li onClick={onClick} className={classes.root} data-qa-add-new-menu={title}>
          <div className={classes.iconWrapper}>
            <ItemIcon />
          </div>
          <div className={classes.content}>
            <Typography variant="subheading">
              <a
                href="javascript:void(0)"
                onClick={onClick}
                title={title}
                className={classes.titleLink}
              >
                {title}
              </a>
            </Typography>
            <Typography variant="body1" className={classes.body}>
              {body}
            </Typography>
          </div>
        </li>
        {index + 1 !== count && <Divider />}
      </React.Fragment>
    );
  }

}

export default withStyles(styles, { withTheme: true })<Props>(AddNewMenuItem);
