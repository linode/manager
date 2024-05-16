import { styled } from '@mui/material';
import * as React from 'react';
import { DropzoneProps, useDropzone } from 'react-dropzone';
import { Box } from 'src/components/Box';

import { Button } from 'src/components/Button/Button';
import { Typography } from 'src/components/Typography';
import { MAX_FILE_SIZE_IN_BYTES } from 'src/components/Uploaders/reducer';

/**
 * This component enables users to attach and upload images from a device.
 */
export const ImageUploader = React.memo((props: Partial<DropzoneProps>) => {
  const {
    acceptedFiles,
    getInputProps,
    getRootProps,
    isDragAccept,
    isDragActive,
    isDragReject,
    open,
  } = useDropzone({
    accept: ['application/x-gzip', 'application/gzip'], // Uploaded files must be compressed using gzip.
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_IN_BYTES,
    ...props,
  });

  return (
    <Dropzone {...getRootProps()}>
      <input {...getInputProps()} />
      <Box display="flex" justifyContent="center">
        {acceptedFiles.map((file) => (
          <Typography key={file.name}>{file.name}</Typography>
        ))}
      </Box>
      <Box display="flex" justifyContent="center">
        <Button buttonType="primary">Browse</Button>
      </Box>
    </Dropzone>
  );
});

const Dropzone = styled('div')({
  borderColor: 'gray',
  borderStyle: 'dashed',
  borderWidth: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  justifyContent: 'center',
  padding: 24,
});
