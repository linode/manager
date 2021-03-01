import * as classNames from 'classnames';
import * as React from 'react';
import CautionIcon from 'src/assets/icons/caution.svg';
import FileUploadComplete from 'src/assets/icons/fileUploadComplete.svg';
import UploadPending from 'src/assets/icons/uploadPending.svg';
import Button from 'src/components/Button';
import LinearProgress from 'src/components/core/LinearProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import { readableBytes } from 'src/utilities/unitConversions';
import { ObjectUploaderAction } from './reducer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    position: 'relative',
    '&:last-child ': {
      '&$overwriteNotice': {
        borderBottom: 0,
        paddingBottom: theme.spacing(1),
      },
    },
  },
  errorState: {
    cursor: 'pointer',
  },
  progressBar: {
    backgroundColor: theme.cmrBGColors.bgApp,
    borderRadius: 3,
    height: theme.spacing(5.25),
    width: '100%',
    position: 'absolute',
    zIndex: 1,
  },
  barColorPrimary: {
    backgroundColor: theme.cmrBorderColors.borderBillingSummary,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(),
    position: 'relative',
    zIndex: 2,
  },
  leftWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(),
  },
  rightWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  iconRight: {
    color: theme.cmrTextColors.headlineStatic,
  },
  error: {
    color: theme.color.red,
    '& g': {
      stroke: theme.color.red,
    },
  },
  fileSize: {
    marginRight: theme.spacing(),
  },
  rotate: {
    animation: '$rotate 2s linear infinite',
  },
  '@keyframes rotate': {
    from: {
      transform: 'rotate(360deg)',
    },
    to: {
      transform: 'rotate(0deg)',
    },
  },
  overwriteNotice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.color.grey2}`,
    padding: theme.spacing(),
    paddingTop: 0,
    position: 'relative',
    zIndex: 10,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    '& button': {
      padding: theme.spacing(),
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
    '& button:last-child': {
      marginRight: 0,
    },
  },
}));

interface Props {
  displayName: string;
  fileName: string;
  sizeInBytes: number;
  percentCompleted: number;
  overwriteNotice: boolean;
  dispatch: React.Dispatch<ObjectUploaderAction>;
  error?: string;
  url?: string;
}

const FileUpload: React.FC<Props> = (props) => {
  const classes = useStyles();

  const resumeUpload = () =>
    props.dispatch({
      type: 'RESUME_UPLOAD',
      fileName: props.fileName,
    });

  const cancelOverwrite = () =>
    props.dispatch({
      type: 'CANCEL_OVERWRITE',
      fileName: props.fileName,
    });

  const handleClickRow = () => {
    if (props.error) {
      resumeUpload();
    }
  };

  const Content = (
    <div
      className={classNames({
        [classes.root]: true,
        [classes.errorState]: props.error,
      })}
      key={props.displayName}
      onClick={handleClickRow}
      onKeyPress={handleClickRow}
      role="button"
      tabIndex={0}
    >
      <LinearProgress
        variant="determinate"
        value={props.percentCompleted}
        classes={{
          root: classes.progressBar,
          barColorPrimary: classes.barColorPrimary,
        }}
        className={classes.progressBar}
      />
      <div className={classes.container}>
        <div className={classes.leftWrapper}>
          <Typography
            variant="body1"
            className={classNames({
              [classes.error]: props.error,
            })}
          >
            {props.displayName}
          </Typography>
        </div>
        <div className={classes.rightWrapper}>
          <Typography
            variant="body1"
            className={classNames({
              [classes.fileSize]: true,
              [classes.error]: props.error,
            })}
          >
            {readableBytes(props.sizeInBytes).formatted}
          </Typography>
          {props.percentCompleted === 100 ? (
            <FileUploadComplete
              className={classes.iconRight}
              height={22}
              width={22}
            />
          ) : props.error || props.overwriteNotice ? (
            <CautionIcon
              className={classNames({
                [classes.iconRight]: true,
                [classes.error]: props.error,
              })}
              height={22}
              width={22}
            />
          ) : (
            <UploadPending
              className={`${classes.iconRight} ${classes.rotate}`}
              height={22}
              width={22}
            />
          )}
        </div>
      </div>

      {props.overwriteNotice && (
        <div className={classes.overwriteNotice}>
          <Typography variant="body1">
            This file already exists. Are you sure you want to overwrite it?
          </Typography>
          <div className={classes.actions}>
            <Button buttonType="cancel" superCompact onClick={cancelOverwrite}>
              Cancel
            </Button>
            <Button buttonType="primary" superCompact onClick={resumeUpload}>
              Replace
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const TooltipTitle = <div>Error uploading object. Click to retry.</div>;

  return props.error ? (
    <Tooltip title={TooltipTitle} placement="bottom">
      {Content}
    </Tooltip>
  ) : (
    Content
  );
};
export default React.memo(FileUpload);
