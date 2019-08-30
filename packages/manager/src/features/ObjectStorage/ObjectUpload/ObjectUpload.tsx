import axios from 'axios';
import * as classNames from 'classnames';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { makeStyles, Theme } from 'src/components/core/styles';
import { getObjectURL } from 'src/services/objectStorage/objects';
import LinearProgress from 'src/components/core/LinearProgress';

// const Axios = axios({});

const A = axios.create({});

const useStyles = makeStyles((theme: Theme) => ({
  dropzone: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  },
  active: {
    borderColor: '#2196f3'
  },
  accept: {
    borderColor: '#00e676'
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
            onUploadProgress: progressEvent => {
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
    isDragReject
  } = useDropzone({ onDrop });

  const className = React.useMemo(
    () =>
      classNames({
        [classes.active]: isDragActive,
        [classes.accept]: isDragAccept,
        [classes.reject]: isDragReject
      }),
    [isDragActive, isDragAccept, isDragReject]
  );

  console.log(completed);

  return (
    <>
      <div {...getRootProps({ className: `${classes.dropzone} ${className}` })}>
        <input {...getInputProps({ accept: 'application/json' })} />
        <p>You can browse your device to upload files or drop them here.</p>
      </div>
      {completed !== 0 && completed !== 100 && (
        <LinearProgress variant="determinate" value={completed} />
      )}
    </>
  );
};

export default ObjectUpload;
