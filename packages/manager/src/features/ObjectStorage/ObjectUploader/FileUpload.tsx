import * as classNames from 'classnames';
import * as React from 'react';
import CautionIcon from 'src/assets/icons/caution.svg';
import FileUploadIcon from 'src/assets/icons/fileUpload.svg';
import FileUploadComplete from 'src/assets/icons/fileUploadComplete.svg';
import UploadCaution from 'src/assets/icons/uploadCaution.svg';
import UploadPending from 'src/assets/icons/uploadPending.svg';
import LinearProgress from 'src/components/core/LinearProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import { readableBytes } from 'src/utilities/unitConversions';

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
  }
}));

interface Props {
  name: string;
  sizeInBytes: number;
  percentCompleted: number;
  error?: string;
}

const FileUpload: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <div className={classes.root} key={props.name}>
      <LinearProgress
        variant="determinate"
        value={props.percentCompleted}
        classes={{
          root: classes.progressBar,
          barColorPrimary: classes.barColorPrimary
        }}
        className={classes.progressBar}
      />

      {props.error ? (
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
        {props.name}
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
      ) : props.error ? (
        <>
          <Tooltip title={props.error} placement="left-start">
            <span className={classes.tooltip}>
              <CautionIcon width={22} height={22} className={classes.error} />
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
    </div>
  );
};
export default React.memo(FileUpload);
