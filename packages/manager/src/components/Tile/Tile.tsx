import classNames from 'classnames';
import * as React from 'react';
import Button from 'src/components/core/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';

type ClassNames =
  | 'root'
  | 'card'
  | 'clickableTile'
  | 'icon'
  | 'tileTitle'
  | 'buttonTitle';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes dash': {
      to: {
        'stroke-dashoffset': 0,
      },
    },
    root: {},
    card: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: theme.color.white,
      padding: theme.spacing(4),
      border: `1px solid ${theme.color.grey2}`,
      height: '100%',
    },
    clickableTile: {
      position: 'relative',
      transition: 'border-color 225ms ease-in-out',
      cursor: 'pointer',
      '&:hover': {
        '& $icon': {
          ...theme.animateCircleIcon,
        },
        '& svg .outerCircle': {
          fill: theme.palette.primary.main,
          transition: 'fill .2s ease-in-out .2s',
        },
        '& $buttonTitle': {
          color: theme.color.black,
          textDecoration: 'underline',
        },
      },
      '& .tile-link::after': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
      },
    },
    tileTitle: {
      fontSize: '1.2rem',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      textAlign: 'center',
    },
    icon: {
      margin: '0 auto 16px',
      display: 'block',
      '& .outerCircle': {
        fill: theme.bg.offWhite,
        stroke: theme.bg.main,
      },
      '& .insidePath': {
        fill: 'none',
        stroke: '#3683DC',
        strokeWidth: 1.25,
        strokeLinejoin: 'round',
      },
      '& svg': {
        width: 70,
        height: 70,
      },
    },
    buttonTitle: {
      padding: 0,
      fontSize: '1.2rem',
      cursor: 'pointer',
      color: theme.color.black,
      '&:hover': {
        color: theme.color.black,
        textDecoration: 'underline',
      },
    },
  });

type onClickFn = (
  e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
) => void;

interface Props {
  title: string;
  description?: string;
  link?: string | onClickFn;
  className?: string;
  icon?: JSX.Element;
  errorText?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class Tile extends React.Component<CombinedProps> {
  renderLink = () => {
    const { link, title, classes } = this.props;

    if (typeof link === 'function') {
      return (
        <Button
          onClick={link}
          className={classNames({
            [classes.buttonTitle]: true,
          })}
        >
          {title}
        </Button>
      );
    } else if (link) {
      return (
        <Link to={link} className="black tile-link">
          {title}
        </Link>
      );
    } else {
      return null;
    }
  };

  render() {
    const {
      classes,
      className,
      title,
      description,
      link,
      icon,
      errorText,
    } = this.props;

    return (
      <div
        className={classNames(
          {
            [classes.card]: true,
            [classes.clickableTile]: link !== undefined,
          },
          className
        )}
        data-qa-tile={title}
        onClick={typeof link === 'function' ? link : undefined}
        onKeyDown={typeof link === 'function' ? link : undefined}
        role="link"
        tabIndex={0}
      >
        {icon && (
          <span className={classes.icon} data-qa-tile-icon>
            {icon}
          </span>
        )}
        {errorText && <Notice error={true} text={errorText} />}
        <Typography
          variant="h3"
          className={classes.tileTitle}
          data-qa-tile-title
        >
          {link ? this.renderLink() : title}
        </Typography>
        {description && (
          <Typography variant="body1" align="center" data-qa-tile-desc>
            {description}
          </Typography>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(Tile);
