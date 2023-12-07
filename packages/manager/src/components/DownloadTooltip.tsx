import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import FileDownload from 'src/assets/icons/download.svg';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import { downloadFile } from 'src/utilities/downloadFile';

interface Props {
  /**
   * Optional styles to be applied to the underlying button
   */
  className?: string;
  /**
   * Optional text to show beside the download icon
   */
  displayText?: string;
  /**
   * The filename of the downloaded file. `.txt` is automatically appended.
   */
  fileName: string;
  /**
   * Optional callback function that is called when the download button is clicked
   */
  onClickCallback?: () => void;
  /**
   * The text to be downloaded.
   * It is also used in the `name` and `aria-label` of the underlying button.
   */
  text: string;
}

const useStyles = makeStyles()((theme: Theme) => ({
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

export const DownloadTooltip = (props: Props) => {
  const { classes, cx } = useStyles();

  const { className, displayText, fileName, onClickCallback, text } = props;

  const handleIconClick = () => {
    downloadFile(`${fileName}.txt`, text);
    if (onClickCallback) {
      onClickCallback();
    }
  };

  return (
    <Tooltip data-qa-copied placement="top" title="Download">
      <button
        className={cx(className, {
          [classes.flex]: Boolean(displayText),
          [classes.root]: true,
        })}
        aria-label={`Download ${text}`}
        name={text}
        onClick={handleIconClick}
        type="button"
      >
        <FileDownload />
        {displayText && (
          <Typography className={classes.displayText}>{displayText}</Typography>
        )}
      </button>
    </Tooltip>
  );
};
