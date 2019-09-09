import axios from 'axios';
import * as classNames from 'classnames';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import Button from 'src/components/Button';
import LinearProgress from 'src/components/core/LinearProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { getObjectURL } from 'src/services/objectStorage/objects';

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

interface ExtendedFile {
  file: File;
  uploadURL: string;
}

interface Props {
  clusterId: string;
  bucketName: string;
  fn: () => void;
}

type CombinedProps = Props;

const ObjectUpload: React.FC<CombinedProps> = props => {
  const { clusterId, bucketName, fn } = props;

  const classes = useStyles();

  const [acceptedFiles, setAcceptedFiles] = React.useState<ExtendedFile[]>([]);

  const [completed, setCompleted] = React.useState(0);

  const onDrop = (newFiles: File[]) => {
    const promises = newFiles.map(file =>
      getObjectURL(clusterId, bucketName, file.name, 'PUT', {
        content_type: file.type
      })
    );
    Promise.all(promises)
      .then(response => {
        const extendedFiles: ExtendedFile[] = response.map((res, idx) => {
          // Upload File

          const file = newFiles[idx];
          const config = {
            method: 'PUT',
            data: file,
            headers: {
              'Content-Type': file.type
            },
            onUploadProgress: (progressEvent: ProgressEvent) => {
              setCompleted((progressEvent.loaded / progressEvent.total) * 100);
            },
            url: res.url
          };

          A.request(config)
            .then(res => {
              console.log(res);
              fn();
            })
            .catch(err => {
              console.log(err);
            });

          return {
            file: newFiles[idx],
            uploadURL: res.url
          };
        });
        setAcceptedFiles(extendedFiles);
      })
      .catch(err => {
        console.log(err);
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
        <Typography variant="subtitle1" className={classes.copy}>
          You can browse your device to upload files or drop them here.
        </Typography>
        <Button buttonType="primary" onClick={open}>
          Browse Files
        </Button>
      </div>
      {completed !== 0 && completed !== 100 && (
        <LinearProgress variant="determinate" value={completed} />
      )}
    </>
  );
};

export default ObjectUpload;
