import { styled } from '@mui/material';
import { Duration } from 'luxon';
import * as React from 'react';
import { DropzoneProps, useDropzone } from 'react-dropzone';

import { BarPercent } from 'src/components/BarPercent';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Typography } from 'src/components/Typography';
import { MAX_FILE_SIZE_IN_BYTES } from 'src/components/Uploaders/reducer';
import { readableBytes } from 'src/utilities/unitConversions';

import type { AxiosProgressEvent } from 'axios';

interface Props extends Partial<DropzoneProps> {
  /**
   * The progress of the image upload.
   */
  progress: AxiosProgressEvent | undefined;
}

/**
 * This component enables users to attach and upload images from a device.
 */
export const ImageUploader = React.memo((props: Props) => {
  const { progress, ...dropzoneProps } = props;
  const {
    acceptedFiles,
    getInputProps,
    getRootProps,
    isDragActive,
  } = useDropzone({
    accept: ['application/x-gzip', 'application/gzip'], // Uploaded files must be compressed using gzip.
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_IN_BYTES,
    ...dropzoneProps,
  });

  return (
    <Dropzone active={isDragActive} {...getRootProps()}>
      <input {...getInputProps()} />
      <Box display="flex" justifyContent="center">
        {acceptedFiles.length === 0 && (
          <Typography variant="subtitle2">
            You can browse your device to upload an image file or drop it here.
          </Typography>
        )}
        {acceptedFiles.map((file) => (
          <Typography key={file.name} variant="subtitle2">
            {file.name} ({readableBytes(file.size, { base10: true }).formatted})
          </Typography>
        ))}
      </Box>
      {progress && (
        <>
          <BarPercent max={1} rounded value={progress.progress ?? 0} />
          <Typography>
            {readableBytes(progress.rate ?? 0).formatted}/s {Duration.fromObject({ seconds: progress.estimated }).toHuman()}
          </Typography>
        </>
      )}
      {!dropzoneProps.disabled && (
        <Box display="flex" justifyContent="center">
          <Button buttonType="primary">Browse Files</Button>
        </Box>
      )}
    </Dropzone>
  );
});

const Dropzone = styled('div')<{ active: boolean }>(({ active, theme }) => ({
  borderColor: 'gray',
  borderStyle: 'dashed',
  borderWidth: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  justifyContent: 'center',
  paddingBottom: 32,
  paddingTop: 32,
  paddingLeft: 16,
  paddingRight: 16,
  ...(active && {
    backgroundColor: theme.palette.background.default,
    borderColor: theme.palette.primary.main,
  }),
}));
