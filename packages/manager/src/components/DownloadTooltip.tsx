import classNames from 'classnames';
import { downloadFile } from 'src/utilities/downloadFile';
import * as React from 'react';
import FileDownload from 'src/assets/icons/download.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
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

export const DownloadTooltip: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { text, className, displayText, onClickCallback, fileName } = props;

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
          [classes.root]: true,
          [classes.flex]: Boolean(displayText),
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
