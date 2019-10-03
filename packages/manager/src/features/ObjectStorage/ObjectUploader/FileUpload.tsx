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
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    position: 'relative',
    height: theme.spacing(5.25),
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5)
  },
  progressBar: {
    height: theme.spacing(5.25),
    position: 'absolute',
    width: '100%',
    backgroundColor: theme.bg.main,
    borderRadius: 4
  },
  barColorPrimary: {
    backgroundColor: theme.bg.lightBlue
  },
  fileName: {
    position: 'absolute',
    left: 28 + theme.spacing(2)
  },
  fileSize: {
    position: 'absolute',
    right: 28 + theme.spacing(2)
  },
  iconLeft: {
    position: 'absolute',
    left: theme.spacing(1),
    '& g': {
      stroke: theme.color.offBlack
    }
  },
  iconRight: {
    position: 'absolute',
    right: theme.spacing(1),
    '& g': {
      stroke: theme.color.offBlack
    }
  },
  rotate: {
    animation: '$rotate 2s linear infinite'
  },
  errorText: {
    position: 'absolute',
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
  tooltip: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1.25)
  },
  error: {
    color: theme.color.red,
    '& g': {
      stroke: theme.color.red
    }
  },
  overwriteNotice: {
    position: 'absolute',
    bottom: theme.spacing(-13),
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center'
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

  const confirmOverwrite = () =>
    props.dispatch({
      type: 'CONFIRM_OVERWRITE',
      fileName: props.fileName
    });

  const cancelOverwrite = () =>
    props.dispatch({
      type: 'CANCEL_OVERWRITE',
      fileName: props.fileName
    });

  return (
    <div className={classes.root} key={props.displayName}>
      <LinearProgress
        variant="determinate"
        value={props.percentCompleted}
        classes={{
          root: classes.progressBar,
          barColorPrimary: classes.barColorPrimary
        }}
        className={classes.progressBar}
      />

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
        <FileUploadIcon width={28} height={28} className={classes.iconLeft} />
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
          <Tooltip title={props.error} placement="left-start">
            <span className={classes.tooltip}>
              <CautionIcon
                width={22}
                height={22}
                className={classNames({
                  [classes.error]: props.error
                })}
              />
            </span>
          </Tooltip>
        </>
      ) : (
        <UploadPending
          width={22}
          height={22}
          className={`${classes.iconRight} ${classes.rotate}`}
        />
      )}

      {props.overwriteNotice && (
        <div className={classes.overwriteNotice}>
          <Typography variant="body1">
            {truncateMiddle(props.fileName)} already exists. Are you sure you
            want to overwrite it?
          </Typography>
          <div className={classes.actions}>
            <Button
              buttonType="secondary"
              superCompact
              onClick={cancelOverwrite}
            >
              Cancel
            </Button>
            <Button
              buttonType="primary"
              superCompact
              onClick={confirmOverwrite}
            >
              Overwrite
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default React.memo(FileUpload);
