import * as classNames from 'classnames';
import * as React from 'react';
import CautionIcon from 'src/assets/icons/caution.svg';
import FileUploadIcon from 'src/assets/icons/fileUpload.svg';
import FileUploadComplete from 'src/assets/icons/fileUploadComplete.svg';
import UploadCaution from 'src/assets/icons/uploadCaution.svg';
import UploadPending from 'src/assets/icons/uploadPending.svg';
import Button from 'src/components/Button';
import LinearProgress from 'src/components/core/LinearProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';
import { ObjectUploaderAction } from './reducer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    '&:last-child ': {
      '&$overwriteNotice': {
        borderBottom: 0,
        paddingBottom: theme.spacing(1)
      }
    }
  },
  progressBar: {
    height: theme.spacing(5.25),
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    backgroundColor: theme.bg.main,
    borderRadius: 4
  },
  barColorPrimary: {
    backgroundColor: theme.bg.lightBlue
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
    padding: theme.spacing(1)
  },
  leftWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(1)
  },
  rightWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  fileName: {},
  fileSize: {
    marginRight: theme.spacing(1)
  },
  iconLeft: {
    marginRight: theme.spacing(1),
    '& g': {
      stroke: theme.color.offBlack
    }
  },
  iconRight: {
    '& g': {
      stroke: theme.color.offBlack
    }
  },
  rotate: {
    animation: '$rotate 2s linear infinite'
  },
  errorText: {
    textDecoration: 'underline',
    cursor: 'pointer',
    right: theme.spacing(1),
    color: theme.color.red
  },
  '@keyframes rotate': {
    from: {
      transform: 'rotate(360deg)'
    },
    to: {
      transform: 'rotate(0deg)'
    }
  },
  tooltip: {},
  error: {
    color: theme.color.red,
    '& g': {
      stroke: theme.color.red
    }
  },
  overwriteNotice: {
    position: 'relative',
    zIndex: 10,
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    borderBottom: `1px solid ${theme.color.grey2}`
  },
  actions: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    '& button': {
      padding: theme.spacing(1.25),
      marginLeft: theme.spacing(1.25),
      marginRight: theme.spacing(1.25)
    }
  },
  errorState: {
    cursor: 'pointer'
  }
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

const FileUpload: React.FC<Props> = props => {
  const classes = useStyles();

  const resumeUpload = () =>
    props.dispatch({
      type: 'RESUME_UPLOAD',
      fileName: props.fileName
    });

  const cancelOverwrite = () =>
    props.dispatch({
      type: 'CANCEL_OVERWRITE',
      fileName: props.fileName
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
        [classes.errorState]: props.error
      })}
      key={props.displayName}
      onClick={handleClickRow}
    >
      <LinearProgress
        variant="determinate"
        value={props.percentCompleted}
        classes={{
          root: classes.progressBar,
          barColorPrimary: classes.barColorPrimary
        }}
        className={classes.progressBar}
      />
      <div className={classes.container}>
        <div className={classes.leftWrapper}>
          {props.error || props.overwriteNotice ? (
            <UploadCaution
              width={28}
              height={28}
              className={classNames({
                [classes.iconLeft]: true,
                [classes.error]: props.error
              })}
            />
          ) : (
            <FileUploadIcon
              width={28}
              height={28}
              className={classes.iconLeft}
            />
          )}

          <Typography
            variant="body1"
            className={classNames({
              [classes.fileName]: true,
              [classes.error]: props.error
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
              [classes.error]: props.error
            })}
          >
            {readableBytes(props.sizeInBytes).formatted}
          </Typography>
          {props.percentCompleted === 100 ? (
            <FileUploadComplete
              width={22}
              height={22}
              className={classes.iconRight}
            />
          ) : props.error || props.overwriteNotice ? (
            <>
              <span className={classes.tooltip}>
                <CautionIcon
                  width={22}
                  height={22}
                  className={classNames({
                    [classes.error]: props.error
                  })}
                />
              </span>
            </>
          ) : (
            <UploadPending
              width={22}
              height={22}
              className={`${classes.iconRight} ${classes.rotate}`}
            />
          )}
        </div>
      </div>

      {props.overwriteNotice && (
        <div className={classes.overwriteNotice}>
          <Typography variant="body1">
            <b>{truncateMiddle(props.fileName)}</b> already exists. Are you sure
            you want to overwrite it?
          </Typography>
          <div className={classes.actions}>
            <Button buttonType="cancel" superCompact onClick={cancelOverwrite}>
              Cancel
            </Button>
            <Button buttonType="primary" superCompact onClick={resumeUpload}>
              Overwrite
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
