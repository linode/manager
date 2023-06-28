import * as React from 'react';
import Button from '@mui/material/Button';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';

const useStyles = makeStyles<void, 'icon' | 'buttonTitle'>()(
  (theme: Theme, _params, classes) => ({
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
        [`& .${classes.icon}`]: {
          ...theme.animateCircleIcon,
        },
        '& svg .outerCircle': {
          fill: theme.palette.primary.main,
          transition: 'fill .2s ease-in-out .2s',
        },
        [`& .${classes.buttonTitle}`]: {
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
  })
);

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

export const Tile = (props: Props) => {
  const { className, title, description, link, icon, errorText } = props;
  const { classes, cx } = useStyles();

  const renderLink = () => {
    if (typeof link === 'function') {
      return (
        <Button
          onClick={link}
          className={cx({
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

  return (
    <div
      className={cx(
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
      {icon ? (
        <span className={classes.icon} data-qa-tile-icon>
          {icon}
        </span>
      ) : null}
      {errorText ? <Notice error={true} text={errorText} /> : null}
      <Typography variant="h3" className={classes.tileTitle} data-qa-tile-title>
        {link ? renderLink() : title}
      </Typography>
      {description ? (
        <Typography variant="body1" align="center" data-qa-tile-desc>
          {description}
        </Typography>
      ) : null}
    </div>
  );
};
