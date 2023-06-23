import classNames from 'classnames';
import { downloadFile } from 'src/utilities/downloadFile';
import * as React from 'react';
import FileDownload from 'src/assets/icons/download.svg';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import ToolTip from 'src/components/core/Tooltip';

interface Props {
  text: string;
  className?: string;
  displayText?: string;
  onClickCallback?: () => void;
  fileName: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  displayText: {
    color: theme.textColors.linkActiveLight,
    marginLeft: 6,
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
    '&:hover': {
      backgroundColor: theme.color.white,
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

export const DownloadTooltip: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { className, displayText, fileName, onClickCallback, text } = props;

  const handleIconClick = () => {
    downloadFile(`${fileName}.txt`, text);
    if (onClickCallback) {
      onClickCallback();
    }
  };

  return (
    <ToolTip title="Download" placement="top" data-qa-copied>
      <button
        aria-label={`Download ${text}`}
        name={text}
        type="button"
        onClick={handleIconClick}
        className={classNames(className, {
          [classes.flex]: Boolean(displayText),
          [classes.root]: true,
        })}
      >
        <FileDownload />
        {displayText && (
          <Typography className={classes.displayText}>{displayText}</Typography>
        )}
      </button>
    </ToolTip>
  );
};

export default DownloadTooltip;
