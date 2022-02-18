import classNames from 'classnames';
import * as copy from 'copy-to-clipboard';
import * as React from 'react';
import FileCopy from 'src/assets/icons/copy.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

interface Props {
  text: string;
  className?: string;
  standAlone?: boolean;
  displayText?: string;
  onClickCallback?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes popUp': {
    from: {
      opacity: 0,
      top: -10,
      transform: 'scale(.1)',
    },
    to: {
      opacity: 1,
      top: -45,
      transform: 'scale(1)',
    },
  },
  root: {
    position: 'relative',
    padding: 4,
    backgroundColor: 'transparent',
    transition: theme.transitions.create(['background-color']),
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    color: theme.color.grey1,
    '& svg': {
      transition: theme.transitions.create(['color']),
      color: theme.color.grey1,
      margin: 0,
      position: 'relative',
      width: 20,
      height: 20,
    },
    '&:hover': {
      backgroundColor: theme.color.white,
    },
  },
  copied: {
    fontSize: '.85rem',
    left: -16,
    color: theme.palette.text.primary,
    padding: '6px 8px',
    backgroundColor: theme.color.white,
    position: 'absolute',
    boxShadow: `0 0 5px ${theme.color.boxShadow}`,
    transition: 'opacity .5s ease-in-out',
    animation: '$popUp 200ms ease-in-out forwards',
  },
  standAlone: {
    marginLeft: theme.spacing(1),
    '& svg': {
      width: 14,
    },
  },
  flex: {
    display: 'flex',
    width: 'auto !important',
  },
  displayText: {
    color: theme.cmrTextColors.linkActiveLight,
    marginLeft: 6,
  },
}));

export const CopyTooltip: React.FC<Props> = (props) => {
  const classes = useStyles();
  const [copied, setCopied] = React.useState<boolean>(false);

  const { text, className, standAlone, displayText, onClickCallback } = props;

  const handleIconClick = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
    copy(text);
    if (onClickCallback) {
      onClickCallback();
    }
  };

  return (
    <button
      aria-label={`Copy ${text} to clipboard`}
      name={text}
      type="button"
      onClick={handleIconClick}
      className={classNames(className, {
        [classes.root]: true,
        [classes.standAlone]: standAlone,
        [classes.flex]: Boolean(displayText),
      })}
    >
      {copied && (
        <span className={classes.copied} data-qa-copied>
          Copied!
        </span>
      )}
      <FileCopy />
      {displayText && (
        <Typography className={classes.displayText}>{displayText}</Typography>
      )}
    </button>
  );
};

export default CopyTooltip;
