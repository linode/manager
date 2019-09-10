import axios from 'axios';
import * as classNames from 'classnames';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import Button from 'src/components/Button';
import LinearProgress from 'src/components/core/LinearProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { getObjectURL } from 'src/services/objectStorage/objects';
import { readableBytes } from 'src/utilities/unitConversions';

const A = axios.create({});

const useStyles = makeStyles((theme: Theme) => ({
  dropzone: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(4.5),
    marginTop: theme.spacing(3),
    borderWidth: 2,
    borderRadius: 8,
    borderColor: theme.palette.primary.main,
    borderStyle: 'dashed',
    color: theme.palette.primary.main,
    outline: 'none',
    transition: 'border .24s ease-in-out',
    height: 120
  },
  copy: {
    color: theme.palette.primary.main
  },
  active: {
    borderColor: theme.palette.primary.light
  },
  accept: {
    // @todo: What color to use here?
    borderColor: theme.palette.primary.light
  },
  reject: {
    borderColor: '#ff1744'
  }
}));

interface Props {
  clusterId: string;
  bucketName: string;
  fn: () => void;
}

type CombinedProps = Props;

const ObjectUpload: React.FC<CombinedProps> = props => {
  const { clusterId, bucketName, fn } = props;

  const classes = useStyles();

  const [completed, setCompleted] = React.useState(0);
  const [fileInProgress, setFileInProgress] = React.useState<File | null>(null);

  const onDrop = (newFiles: File[]) => {
    const file = newFiles[0];
    setFileInProgress(file);

    getObjectURL(clusterId, bucketName, file.name, 'PUT', {
      content_type: file.type
    }).then(({ url }) => {
      const config = {
        method: 'PUT',
        data: file,
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent: ProgressEvent) => {
          setCompleted((progressEvent.loaded / progressEvent.total) * 100);
        },
        url
      };

      A.request(config)
        .then(res => {
          console.log(res);
          fn();
        })
        .catch(err => {
          console.log(err);
        });
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
    <>
      <div {...getRootProps({ className: `${classes.dropzone} ${className}` })}>
        <input {...getInputProps({ accept: 'application/json' })} />
        {fileInProgress && completed !== 0 && completed !== 100 && (
          <File
            name={fileInProgress.name}
            sizeInBytes={fileInProgress.size}
            percentCompleted={completed}
          />
        )}
        {!fileInProgress && (
          <>
            <Typography variant="subtitle1" className={classes.copy}>
              You can browse your device to upload files or drop them here.
            </Typography>
            <Button buttonType="primary" onClick={open}>
              Browse Files
            </Button>
          </>
        )}
      </div>
    </>
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
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    height: theme.spacing(5.25)
  },
  progress: {
    height: theme.spacing(5.25),
    position: 'absolute',
    width: '100%',
    backgroundColor: theme.bg.main
  },
  barColorPrimary: {
    backgroundColor: theme.bg.lightBlue
  },
  fileName: {
    position: 'absolute',
    left: theme.spacing(2)
  },
  fileSize: {
    position: 'absolute',
    right: theme.spacing(2)
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
      <Typography variant="body1" className={classes.fileName}>
        {props.name}
      </Typography>
      <Typography variant="body1" className={classes.fileSize}>
        {readableBytes(props.sizeInBytes).formatted}
      </Typography>
    </div>
  );
};

export default ObjectUpload;
