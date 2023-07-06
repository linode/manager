import classNames from 'classnames';
import { downloadFile } from 'src/utilities/downloadFile';
import * as React from 'react';
import FileDownload from 'src/assets/icons/download.svg';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { Tooltip } from 'src/components/Tooltip';

interface Props {
  /**
   * The text to be downloaded.
   * It is also used in the `name` and `aria-label` of the underlying button.
   */
  text: string;
  /**
   * Optional styles to be applied to the underlying button
   */
  className?: string;
  /**
   * Optional text to show beside the download icon
   */
  displayText?: string;
  /**
   * Optional callback function that is called when the download button is clicked
   */
  onClickCallback?: () => void;
  /**
   * The filename of the downloaded file. `.text` is automatically appended.
   */
  fileName: string;
}

const useStyles = makeStyles((theme: Theme) => ({
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
  flex: {
    display: 'flex',
    width: 'auto !important',
  },
  displayText: {
    color: theme.textColors.linkActiveLight,
    marginLeft: 6,
  },
}));

export const DownloadTooltip = (props: Props) => {
  const classes = useStyles();

  const { text, className, displayText, onClickCallback, fileName } = props;

  const handleIconClick = () => {
    downloadFile(`${fileName}.txt`, text);
    if (onClickCallback) {
      onClickCallback();
    }
  };

  return (
    <Tooltip title="Download" placement="top" data-qa-copied>
      <button
        aria-label={`Download ${text}`}
        name={text}
        type="button"
        onClick={handleIconClick}
        className={classNames(className, {
          [classes.root]: true,
          [classes.flex]: Boolean(displayText),
        })}
      >
        <FileDownload />
        {displayText && (
          <Typography className={classes.displayText}>{displayText}</Typography>
        )}
      </button>
    </Tooltip>
  );
};
