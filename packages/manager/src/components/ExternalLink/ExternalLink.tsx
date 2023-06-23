import * as React from 'react';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Arrow from 'src/assets/icons/diagonalArrow.svg';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { sanitizeUrl } from '@braintree/sanitize-url';

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
  link: string;
  text: string;
  className?: string;
  absoluteIcon?: boolean;
  black?: boolean;
  fixedIcon?: boolean;
  hideIcon?: boolean;
  onClick?: () => void;
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
      onClick={onClick}
      target="_blank"
      aria-describedby="external-site"
      rel="noopener noreferrer"
      href={sanitizeUrl(link)}
      className={cx(
        classes.root,
        {
          [classes.absoluteIcon]: absoluteIcon,
          [classes.black]: black,
        },
        className
      )}
      data-qa-external-link
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
