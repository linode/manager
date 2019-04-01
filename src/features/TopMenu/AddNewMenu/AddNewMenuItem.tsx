import MenuItem from '@material-ui/core/MenuItem';
import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type CSSClasses = 'root' | 'content' | 'titleLink' | 'body' | 'iconWrapper';

const styles: StyleRulesCallback = theme => ({
  '@keyframes dash': {
    to: {
      'stroke-dashoffset': 0
    }
  },
  root: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    borderBottom: `1px solid ${theme.palette.divider}`,
    maxWidth: '350px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color .2s ease-in-out',
    '& .circle': {
      fill: theme.bg.offWhiteDT
    },
    '& .outerCircle': {
      stroke: theme.bg.main
    },
    '&:hover, &:focus': {
      ...theme.animateCircleIcon,
      backgroundColor: theme.bg.offWhiteDT
    }
  },
  iconWrapper: {
    width: 49,
    height: 49
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2
  },
  titleLink: {
    textDecoration: 'none',
    color: theme.color.black,
    fontSize: '1.18rem'
  },
  body: {
    marginTop: 3,
    fontSize: '.9rem',
    lineHeight: '1.1rem'
  }
});

export interface MenuItems {
  title: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  body: string;
  ItemIcon: React.ComponentClass<any>;
}

interface Props extends MenuItems {
  index: number;
  count: number;
}

interface State {
  anchorEl?: HTMLElement;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

class AddNewMenuItem extends React.Component<PropsWithStyles, State> {
  render() {
    const { classes, title, onClick, body, ItemIcon } = this.props;

    return (
      <React.Fragment>
        <MenuItem
          onClick={onClick}
          className={classes.root}
          data-qa-add-new-menu={title}
          button
          component="li"
          aria-label={`Create ${title}`}
        >
          <div className={classes.iconWrapper}>
            <ItemIcon />
          </div>
          <div className={classes.content}>
            <Typography variant="h3">{title}</Typography>
            <Typography variant="body1" className={classes.body}>
              {body}
            </Typography>
          </div>
        </MenuItem>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(AddNewMenuItem);
