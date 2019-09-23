import * as React from 'react';
import { Link } from 'react-router-dom';
import MenuItem from 'src/components/core/MenuItem';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type CSSClasses =
  | 'root'
  | 'content'
  | 'link'
  | 'titleLink'
  | 'body'
  | 'iconWrapper';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes dash': {
      to: {
        'stroke-dashoffset': 0
      }
    },
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
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
        backgroundColor: theme.bg.offWhiteDT,
        color: theme.palette.text.primary
      }
    },
    iconWrapper: {
      width: 49,
      height: 49
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
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
    },
    link: {
      display: 'flex'
    }
  });

export interface MenuItems {
  title: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  linkTo?: string;
  body: string;
  ItemIcon: React.ComponentClass<any>;
  attr?: { [key: string]: any };
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
    const {
      classes,
      title,
      onClick,
      linkTo,
      body,
      ItemIcon,
      attr
    } = this.props;

    const menuItemContent = () => (
      <>
        <div className={classes.iconWrapper}>
          <ItemIcon />
        </div>
        <div className={classes.content}>
          <Typography variant="h3">{title}</Typography>
          <Typography variant="body1" className={classes.body}>
            {body}
          </Typography>
        </div>
      </>
    );

    return (
      <MenuItem
        onClick={onClick}
        className={classes.root}
        data-qa-add-new-menu={title}
        button
        component="li"
        aria-label={`Create ${title}`}
        {...attr}
      >
        {linkTo ? (
          <Link to={linkTo} className={classes.link}>
            {menuItemContent()}
          </Link>
        ) : (
          menuItemContent()
        )}
      </MenuItem>
    );
  }
}

const styled = withStyles(styles);

export default styled(AddNewMenuItem);
