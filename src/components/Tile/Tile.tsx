import { WithStyles } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Notice from 'src/components/Notice';

type ClassNames = 'root' | 'card' | 'clickableTile' | 'icon' | 'tileTitle';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes dash': {
      to: {
        'stroke-dashoffset': 0
      }
    },
    root: {},
    card: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: theme.color.white,
      padding: theme.spacing(4),
      border: `1px solid ${theme.color.grey2}`,
      height: '100%'
    },
    clickableTile: {
      position: 'relative',
      transition: 'border-color 225ms ease-in-out',
      '&:hover': {
        '& $icon': {
          ...theme.animateCircleIcon
        },
        '& svg': {
          fill: theme.palette.primary.main,
          transition: 'fill .2s ease-in-out .2s'
        }
      },
      '& .tile-link::after': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0
      }
    },
    tileTitle: {
      fontSize: '1.2rem',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      textAlign: 'center'
    },
    icon: {
      margin: '0 auto 16px',
      display: 'block',
      '& .outerCircle': {
        stroke: theme.bg.main
      },
      '& .insidePath': {
        fill: 'none',
        stroke: '#3683DC',
        strokeWidth: 1.25,
        strokeLinejoin: 'round'
      },
      '& svg': {
        width: 70,
        height: 70,
        fill: theme.bg.offWhiteDT
      }
    }
  });

type onClickFn = (e: React.MouseEvent<HTMLElement>) => void;

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
    const { link, title } = this.props;

    if (typeof link === 'function') {
      return (
        <a href="javascript:;" onClick={link} className="black tile-link">
          {title}
        </a>
      );
    } else if (
      link &&
      (link.startsWith('http://') || link.startsWith('https://'))
    ) {
      return (
        <ExternalLink link={link} text={title} className="black tile-link" />
      );
    } else if (link && link.startsWith('/')) {
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
      errorText
    } = this.props;

    return (
      <div
        className={classNames(
          {
            [classes.card]: true,
            [classes.clickableTile]: link !== undefined
          },
          className
        )}
        data-qa-tile={title}
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
          <React.Fragment>{link ? this.renderLink() : title}</React.Fragment>
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
