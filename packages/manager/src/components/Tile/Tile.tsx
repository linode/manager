import Button from '@mui/material/Button';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';

const useStyles = makeStyles<void, 'buttonTitle' | 'icon'>()(
  (theme: Theme, _params, classes) => ({
    buttonTitle: {
      '&:hover': {
        color: theme.color.black,
        textDecoration: 'underline',
      },
      color: theme.color.black,
      cursor: 'pointer',
      fontSize: '1.2rem',
      padding: 0,
    },
    card: {
      alignItems: 'center',
      backgroundColor: theme.color.white,
      border: `1px solid ${theme.color.grey2}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: theme.spacing(4),
    },
    clickableTile: {
      '& .tile-link::after': {
        content: "''",
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%',
      },
      '&:hover': {
        '& svg .outerCircle': {
          fill: theme.palette.primary.main,
          transition: 'fill .2s ease-in-out .2s',
        },
        [`& .${classes.buttonTitle}`]: {
          color: theme.color.black,
          textDecoration: 'underline',
        },
        [`& .${classes.icon}`]: {
          ...theme.animateCircleIcon,
        },
      },
      cursor: 'pointer',
      position: 'relative',
      transition: 'border-color 225ms ease-in-out',
    },
    icon: {
      '& .insidePath': {
        fill: 'none',
        stroke: '#3683DC',
        strokeLinejoin: 'round',
        strokeWidth: 1.25,
      },
      '& .outerCircle': {
        fill: theme.bg.offWhite,
        stroke: theme.bg.main,
      },
      '& svg': {
        height: 70,
        width: 70,
      },
      display: 'block',
      margin: '0 auto 16px',
    },
    tileTitle: {
      fontSize: '1.2rem',
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
      textAlign: 'center',
    },
  })
);

type onClickFn = (
  e: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>
) => void;

interface Props {
  className?: string;
  description?: string;
  errorText?: string;
  icon?: JSX.Element;
  link?: onClickFn | string;
  title: string;
}

export const Tile = (props: Props) => {
  const { className, description, errorText, icon, link, title } = props;
  const { classes, cx } = useStyles();

  const renderLink = () => {
    if (typeof link === 'function') {
      return (
        <Button
          className={cx({
            [classes.buttonTitle]: true,
          })}
          onClick={link}
        >
          {title}
        </Button>
      );
    } else if (link) {
      return (
        <Link className="black tile-link" to={link}>
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
      {errorText ? <Notice text={errorText} variant="error" /> : null}
      <Typography className={classes.tileTitle} data-qa-tile-title variant="h3">
        {link ? renderLink() : title}
      </Typography>
      {description ? (
        <Typography align="center" data-qa-tile-desc variant="body1">
          {description}
        </Typography>
      ) : null}
    </div>
  );
};
