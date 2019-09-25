import * as classNames from 'classnames';
import { APIError } from 'linode-js-sdk/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import CloudUpload from 'src/assets/icons/cloudUpload.svg';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import { getObjectURL } from 'src/services/objectStorage/objects';
import { truncateMiddle } from 'src/utilities/truncate';
import { uploadObject } from '../requests';
import FileUpload from './FileUpload';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.up('lg')]: {
      position: 'sticky',
      top: theme.spacing(3),
      height: `calc(100vh - (160px + ${theme.spacing(20)}px))`,
      marginLeft: theme.spacing(4)
    }
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
    marginTop: theme.spacing(2),
    borderWidth: 1,
    borderRadius: 6,
    borderColor: theme.palette.primary.main,
    borderStyle: 'dashed',
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    outline: 'none',
    height: '100%',
    transition: theme.transitions.create(['border-color', 'background-color'])
  },
  copy: {
    color: theme.palette.primary.main,
    margin: '0 auto',
    [theme.breakpoints.up('lg')]: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(10)
    }
  },
  active: {
    // The `active` class active when a user is hovering over the dropzone.
    borderColor: theme.palette.primary.light,
    backgroundColor: theme.color.white,
    '& $uploadButton': {
      opacity: 0.5
    }
  },
  accept: {
    // The `accept` class active when a user is hovering over the dropzone
    // with files that will be accepted (based on file size, number of files).
    borderColor: theme.palette.primary.light
  },
  reject: {
    // The `reject` class active when a user is hovering over the dropzone
    // with files that will be rejected (based on file size, number of files).
    borderColor: theme.color.red
  },
  dropzoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    width: '100%',
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(2)
    },
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(8)
    }
  },
  fileUploads: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'flex-start'
  },
  uploadButton: {
    opacity: 1,
    transition: theme.transitions.create(['opacity']),
    [theme.breakpoints.only('lg')]: {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5)
    },
    [theme.breakpoints.down('lg')]: {
      marginTop: theme.spacing(2)
    }
  }
}));

interface Props {
  clusterId: string;
  bucketName: string;
  update: () => void;
  prefix: string;
}

type CombinedProps = Props & WithSnackbarProps;

const ObjectUploader: React.FC<CombinedProps> = props => {
  const { clusterId, bucketName, update, prefix } = props;

  const classes = useStyles();

  let timeout: ReturnType<typeof setTimeout>;
  React.useEffect(() => {
    return () => clearTimeout(timeout);
  }, []);

  // For the time being, these values are flat. When multiple file uploads
  // are possible, the data structure will change.
  const [completed, setCompleted] = React.useState<number | null>(null);
  const [sizeInBytes, setSizeInBytes] = React.useState<number | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [inProgress, setInProgress] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError | undefined>(undefined);

  const onUploadProgress = (progressEvent: ProgressEvent) => {
    setCompleted((progressEvent.loaded / progressEvent.total) * 100);
  };

  const handleError = () => {
    setError({ reason: 'Failed to upload object.' });
  };

  const onDrop = (files: File[]) => {
    // (TEMPORARY): Don't allow multi-file uploads.
    // (TEMPORARY): Don't allow uploads when there's already one in progress.
    if (files.length !== 1 || inProgress) {
      return;
    }

    const file = files[0];

    setInProgress(true);
    setCompleted(0);
    setSizeInBytes(file.size);
    setFileName(file.name);

    // We want to upload the object to the current "folder", so we prepend the
    // file name with the prefix.
    const fullObjectName = prefix + file.name;

    getObjectURL(clusterId, bucketName, fullObjectName, 'PUT', {
      content_type: file.type
    })
      .then(({ url }) => {
        uploadObject(url, file, onUploadProgress)
          .then(() => {
            // Update objects in table
            update();

            if (completed !== 100) {
              setCompleted(100);
            }

            // Display the file upload as being completed for a few seconds,
            // then remove it.
            timeout = setTimeout(() => {
              setInProgress(false);
            }, 2000);
          })
          .catch(handleError);
      })
      .catch(handleError);
  };

  const { width } = useWindowDimensions();

  // These max widths and breakpoints are based on trial-and-error.
  const truncationMaxWidth = width < 1920 ? 20 : 30;

  const onDropRejected = (files: File[]) => {
    // @todo: better error handling. This error message will go away when we
    // support multi-file uploads.
    props.enqueueSnackbar('Please upload one file at a time.', {
      variant: 'error'
    });
  };

  const {
    getInputProps,
    getRootProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open
  } = useDropzone({
    onDrop,
    onDropRejected,
    noClick: true,
    noKeyboard: true,
    multiple: false
  });

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
        <input {...getInputProps()} />

        {/* When we support multiple file uploads, this will be a map.*/}
        {inProgress && (
          <div className={classes.fileUploads}>
            <FileUpload
              name={truncateMiddle(fileName || '', truncationMaxWidth)}
              sizeInBytes={sizeInBytes || 0}
              percentCompleted={completed || 0}
              error={error}
            />
          </div>
        )}

        {!inProgress && (
          <div className={classes.dropzoneContent}>
            <Hidden xsDown>
              <CloudUpload />
            </Hidden>
            <Typography variant="subtitle2" className={classes.copy}>
              You can browse your device to upload files or drop them here.
            </Typography>
            <Button
              buttonType="primary"
              onClick={open}
              className={classes.uploadButton}
            >
              Browse Files
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default withSnackbar(ObjectUploader);
