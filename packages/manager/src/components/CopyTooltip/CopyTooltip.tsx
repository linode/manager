import { Theme } from '@mui/material/styles';
import copy from 'copy-to-clipboard';
import * as React from 'react';
import FileCopy from 'src/assets/icons/copy.svg';
import ToolTip from 'src/components/core/Tooltip';
import { makeStyles } from 'tss-react/mui';

interface Props {
  text: string;
  className?: string;
  copyableText?: boolean;
  onClickCallback?: () => void;
}

const useStyles = makeStyles()((theme: Theme) => ({
  copyableTextBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.palette.text.primary,
    cursor: 'pointer',
    font: 'inherit',
    padding: 0,
  },
  flex: {
    display: 'flex',
    width: 'auto !important',
  },
  root: {
    '& svg': {
      color: theme.color.grey1,
      height: 20,
      margin: 0,
      position: 'relative',
      transition: theme.transitions.create(['color']),
      width: 20,
    },
    '& svg:hover': {
      color: theme.palette.primary.main,
    },
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 4,
    color: theme.color.grey1,
    cursor: 'pointer',
    padding: 4,
    position: 'relative',
    transition: theme.transitions.create(['background-color']),
  },
}));

export const CopyTooltip = (props: Props) => {
  const { classes, cx } = useStyles();
  const [copied, setCopied] = React.useState<boolean>(false);

  const { className, copyableText, onClickCallback, text } = props;

  const handleIconClick = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
    copy(text);
    if (onClickCallback) {
      onClickCallback();
    }
  };

  return (
    <ToolTip title={copied ? 'Copied!' : 'Copy'} placement="top" data-qa-copied>
      <button
        aria-label={`Copy ${text} to clipboard`}
        name={text}
        type="button"
        onClick={handleIconClick}
        className={cx(classes.root, className, {
          [classes.copyableTextBtn]: copyableText,
        })}
        data-qa-copy-btn
      >
        {copyableText ? text : <FileCopy />}
      </button>
    </ToolTip>
  );
};
