import * as React from 'react';
import classNames from 'classnames';
import OpenInNew from '@material-ui/icons/OpenInNew';
import Arrow from 'src/assets/icons/diagonalArrow.svg';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color:
      theme.name === 'darkTheme' ? theme.textColors.linkActiveLight : undefined,
    display: 'inline-flex',
    alignItems: 'baseline',
    '&:hover': {
      '& $icon': {
        opacity: 1,
      },
    },
  },
  icon: {
    color: theme.palette.primary.main,
    position: 'relative',
    left: theme.spacing(1),
    opacity: 0,
    width: 14,
    height: 14,
  },
  absoluteIcon: {
    display: 'inline',
    position: 'relative',
    paddingRight: 26,
    '& $icon': {
      position: 'absolute',
      right: 0,
      bottom: 2,
      opacity: 0,
      left: 'initial',
    },
  },
  fixedIcon: {
    display: 'inline-block',
    fontSize: '0.8em',
  },
  black: {
    color: theme.palette.text.primary,
  },
}));

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

const ExternalLink: React.FC<Props> = (props) => {
  const classes = useStyles();
  const {
    link,
    text,
    className,
    absoluteIcon,
    black,
    fixedIcon,
    hideIcon,
    onClick,
  } = props;

  return (
    <a
      onClick={onClick}
      target="_blank"
      aria-describedby="external-site"
      rel="noopener noreferrer"
      href={link}
      className={classNames(
        {
          [classes.root]: true,
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
