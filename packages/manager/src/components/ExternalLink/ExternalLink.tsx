import { sanitizeUrl } from '@braintree/sanitize-url';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import Arrow from 'src/assets/icons/diagonalArrow.svg';

const useStyles = makeStyles<void, 'icon'>()(
  (theme: Theme, _params, classes) => ({
    absoluteIcon: {
      [`& .${classes.icon}`]: {
        bottom: 2,
        left: 'initial',
        opacity: 0,
        position: 'absolute',
        right: 0,
      },
      display: 'inline',
      paddingRight: 26,
      position: 'relative',
    },
    black: {
      color: theme.palette.text.primary,
    },
    fixedIcon: {
      display: 'inline-block',
      fontSize: '0.8em',
    },
    icon: {
      color: theme.palette.primary.main,
      height: 14,
      left: theme.spacing(1),
      opacity: 0,
      position: 'relative',
      width: 14,
    },
    root: {
      '&:hover': {
        [`& .${classes.icon}`]: {
          opacity: 1,
        },
      },
      alignItems: 'baseline',
      color:
        theme.name === 'dark' ? theme.textColors.linkActiveLight : undefined,
      display: 'inline-flex',
    },
  })
);

interface Props {
  absoluteIcon?: boolean;
  black?: boolean;
  className?: string;
  fixedIcon?: boolean;
  hideIcon?: boolean;
  link: string;
  onClick?: () => void;
  text: string;
}

const ExternalLink = (props: Props) => {
  const { classes, cx } = useStyles();
  const {
    absoluteIcon,
    black,
    className,
    fixedIcon,
    hideIcon,
    link,
    onClick,
    text,
  } = props;

  return (
    <a
      className={cx(
        classes.root,
        {
          [classes.absoluteIcon]: absoluteIcon,
          [classes.black]: black,
        },
        className
      )}
      aria-describedby="external-site"
      data-qa-external-link
      href={sanitizeUrl(link)}
      onClick={onClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      {text}
      {!hideIcon &&
        (fixedIcon ? (
          <OpenInNew className={classes.fixedIcon} />
        ) : (
          <Arrow className={classes.icon} />
        ))}
    </a>
  );
};

export default ExternalLink;
