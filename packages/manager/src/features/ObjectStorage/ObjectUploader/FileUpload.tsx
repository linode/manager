import * as React from 'react';
import CautionIcon from 'src/assets/icons/caution.svg';
import FileUploadIcon from 'src/assets/icons/fileUpload.svg';
import FileUploadComplete from 'src/assets/icons/fileUploadComplete.svg';
import UploadCaution from 'src/assets/icons/uploadCaution.svg';
import UploadPending from 'src/assets/icons/uploadPending.svg';
import LinearProgress from 'src/components/core/LinearProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
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
    right: 0,
    bottom: `-${theme.spacing(3)}px`,
    left: 0,
    textAlign: 'center',
    color: theme.color.red
  },
  '@keyframes rotate': {
    from: {
      transform: 'rotate(360deg)'
    },
    to: {
      transform: 'rotate(0deg)'
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
        <UploadCaution width={28} height={28} className={classes.iconLeft} />
      ) : (
        <FileUploadIcon width={28} height={28} className={classes.iconLeft} />
      )}

      <Typography variant="body1" className={classes.fileName}>
        {props.name}
      </Typography>

      <Typography variant="body1" className={classes.fileSize}>
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
          <CautionIcon width={22} height={22} className={classes.iconRight} />
          <Typography variant="body2" className={classes.errorText}>
            {props.error}
          </Typography>
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
