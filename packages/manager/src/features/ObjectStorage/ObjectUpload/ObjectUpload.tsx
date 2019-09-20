import * as classNames from 'classnames';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import CloudUpload from 'src/assets/icons/cloudUpload.svg';
import FileUpload from 'src/assets/icons/fileUpload.svg';
import FileUploadComplete from 'src/assets/icons/fileUploadComplete.svg';
import UploadPending from 'src/assets/icons/uploadPending.svg';
import Button from 'src/components/Button';
import LinearProgress from 'src/components/core/LinearProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { getObjectURL } from 'src/services/objectStorage/objects';
import { readableBytes } from 'src/utilities/unitConversions';
import { uploadObject } from '../requests';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'sticky',
    top: theme.spacing(3),
    height: `calc(100vh - 250px)`,
    marginLeft: theme.spacing(4)
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
    marginTop: theme.spacing(2),
    borderWidth: 2,
    borderRadius: 6,
    borderColor: theme.palette.primary.main,
    borderStyle: 'dashed',
    color: theme.palette.primary.main,
    outline: 'none',
    transition: 'border .24s ease-in-out',
    height: '100%'
  },
  copy: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    color: theme.palette.primary.main
  },
  active: {
    // @todo: What color to use here?
    borderColor: theme.palette.primary.dark
  },
  accept: {
    // @todo: What color to use here?
    borderColor: theme.palette.primary.light
  },
  reject: {
    borderColor: '#ff1744'
  },
  browseButton: {},
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: theme.spacing(4.5)
  },
  fileUploads: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'flex-start'
  }
}));

interface Props {
  clusterId: string;
  bucketName: string;
  update: () => void;
}

type CombinedProps = Props;

const ObjectUpload: React.FC<CombinedProps> = props => {
  const { clusterId, bucketName, update } = props;

  const classes = useStyles();

  const [completed, setCompleted] = React.useState(0);
  const [fileInProgress, setFileInProgress] = React.useState<File | null>(null);

  const onUploadProgress = (progressEvent: ProgressEvent) => {
    setCompleted((progressEvent.loaded / progressEvent.total) * 100);
  };

  const onDrop = (newFiles: File[]) => {
    const file = newFiles[0];
    setFileInProgress(file);

    getObjectURL(clusterId, bucketName, file.name, 'PUT', {
      content_type: file.type
    }).then(({ url }) => {
      uploadObject(url, file, onUploadProgress).then(() => update());
    });
  };

  const {
    getInputProps,
    getRootProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open
  } = useDropzone({ onDrop, noClick: true, noKeyboard: true });

  const className = React.useMemo(
    () =>
      classNames({
        [classes.active]: isDragActive,
        [classes.accept]: isDragAccept,
        [classes.reject]: isDragReject
      }),
    [isDragActive, isDragAccept, isDragReject]
  );

  return (
    <div className={classes.root}>
      <div {...getRootProps({ className: `${classes.dropzone} ${className}` })}>
        <input {...getInputProps({ accept: 'application/json' })} />
        {fileInProgress && completed !== 0 && completed !== 100 && (
          <div className={classes.fileUploads}>
            <File
              name={fileInProgress.name}
              sizeInBytes={fileInProgress.size}
              percentCompleted={completed}
            />
          </div>
        )}
        {!fileInProgress && (
          <div className={classes.container}>
            <CloudUpload />
            <Typography variant="subtitle2" className={classes.copy}>
              You can browse your device to upload files or drop them here.
            </Typography>
            <Button
              buttonType="primary"
              className={classes.browseButton}
              onClick={open}
            >
              Browse Files
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface FileProps {
  name: string;
  sizeInBytes: number;
  percentCompleted: number;
}

const useFileStyles = makeStyles((theme: Theme) => ({
  progressBox: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    height: theme.spacing(5.25),
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5)
  },
  progress: {
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
  uploadIcon: {
    position: 'absolute',
    left: theme.spacing(1),
    '& g': {
      // @todo @alban @kayla Color here?
      stroke: theme.color.offBlack
    }
  },
  completeIcon: {
    position: 'absolute',
    right: theme.spacing(1),
    '& g': {
      // @todo @alban @kayla Color here?
      stroke: theme.color.offBlack
    }
  },
  pendingIcon: {
    position: 'absolute',
    right: theme.spacing(1),
    '& g': {
      // @todo @alban @kayla Color here?
      stroke: theme.color.offBlack
    },
    animation: '$rotate 2s linear infinite'
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

const File: React.FC<FileProps> = props => {
  const classes = useFileStyles();

  return (
    <div className={classes.progressBox}>
      <LinearProgress
        variant="determinate"
        value={props.percentCompleted}
        classes={{
          root: classes.progress,
          barColorPrimary: classes.barColorPrimary
        }}
        className={classes.progress}
      />
      <FileUpload width={28} height={28} className={classes.uploadIcon} />
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
          className={classes.completeIcon}
        />
      ) : (
        <UploadPending width={22} height={22} className={classes.pendingIcon} />
      )}
    </div>
  );
};

export default ObjectUpload;
