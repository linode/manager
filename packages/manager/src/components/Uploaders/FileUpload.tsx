import { Button, Tooltip, Typography } from '@linode/ui';
import { readableBytes } from '@linode/utilities';
import * as React from 'react';

import CautionIcon from 'src/assets/icons/caution.svg';
import FileUploadComplete from 'src/assets/icons/fileUploadComplete.svg';
import { LinearProgress } from 'src/components/LinearProgress';

import {
  StyledActionsContainer,
  StyledContainer,
  StyledFileSizeTypography,
  StyledLeftWrapper,
  StyledRightWrapper,
  StyledRootContainer,
  StyledUploadPendingIcon,
  useStyles,
} from './FileUpload.styles';

import type { ObjectUploaderAction } from './reducer';

export interface FileUploadProps {
  dispatch: React.Dispatch<ObjectUploaderAction>;
  displayName: string;
  error?: string;
  fileName: string;
  overwriteNotice: boolean;
  percentCompleted: number;
  sizeInBytes: number;
  type?: string;
  url?: string;
}

/**
 * This component enables users to attach and upload files from a device.
 * - Include any file restrictions or limits in the helper text.
 * - Dragover effect and release capability occurs when a user drags a file or files directly onto the file upload box. This is called the “drop zone”.
 */
export const FileUpload = React.memo((props: FileUploadProps) => {
  const { classes, cx } = useStyles();

  const resumeUpload = () =>
    props.dispatch({
      fileName: props.fileName,
      type: 'RESUME_UPLOAD',
    });

  const cancelOverwrite = () =>
    props.dispatch({
      fileName: props.fileName,
      type: 'CANCEL_OVERWRITE',
    });

  const handleClickRow = () => {
    if (props.error) {
      resumeUpload();
    }
  };

  const Content = (
    <StyledRootContainer
      key={props.displayName}
      onClick={handleClickRow}
      onKeyPress={handleClickRow}
      role="button"
      tabIndex={0}
    >
      <LinearProgress
        classes={{
          barColorPrimary: classes.barColorPrimary,
          root: classes.progressBar,
        }}
        className={classes.progressBar}
        value={props.percentCompleted}
        variant="determinate"
      />
      <StyledContainer>
        <StyledLeftWrapper>
          <Typography
            className={cx({
              [classes.error]: props.error !== '',
            })}
            variant="body1"
          >
            {props.displayName}
          </Typography>
        </StyledLeftWrapper>
        <StyledRightWrapper>
          <StyledFileSizeTypography
            className={cx({
              [classes.error]: props.error !== '',
            })}
            variant="body1"
          >
            {readableBytes(props.sizeInBytes).formatted}
          </StyledFileSizeTypography>
          {props.percentCompleted === 100 ? (
            <FileUploadComplete
              className={classes.iconRight}
              data-qa-file-upload-success
              height={22}
              width={22}
            />
          ) : props.error || props.overwriteNotice ? (
            <CautionIcon
              className={cx({
                [classes.error]: props.error !== '',
                [classes.iconRight]: true,
              })}
              data-qa-file-upload-error
              height={22}
              width={22}
            />
          ) : (
            <StyledUploadPendingIcon
              data-qa-file-upload-pending
              height={22}
              width={22}
            />
          )}
        </StyledRightWrapper>
      </StyledContainer>

      {props.overwriteNotice && (
        <div className={classes.overwriteNotice}>
          <Typography variant="body1">
            This file already exists. Are you sure you want to overwrite it?
          </Typography>
          <StyledActionsContainer>
            <Button buttonType="secondary" onClick={cancelOverwrite}>
              Cancel
            </Button>
            <Button buttonType="primary" onClick={resumeUpload}>
              Replace
            </Button>
          </StyledActionsContainer>
        </div>
      )}
    </StyledRootContainer>
  );

  const errorText = `Error uploading ${
    props.type ?? 'object'
  }. Click to retry.`;

  const TooltipTitle = <div>{errorText}</div>;

  return props.error ? (
    <Tooltip placement="bottom" title={TooltipTitle}>
      {Content}
    </Tooltip>
  ) : (
    Content
  );
});
