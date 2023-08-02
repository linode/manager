import * as React from 'react';

import CautionIcon from 'src/assets/icons/caution.svg';
import FileUploadComplete from 'src/assets/icons/fileUploadComplete.svg';
import { Button } from 'src/components/Button/Button';
import { LinearProgress } from 'src/components/LinearProgress';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import { readableBytes } from 'src/utilities/unitConversions';

import {
  StyledActionsContainer,
  StyledContainer,
  StyledFileSizeTypography,
  StyledLeftWrapper,
  StyledRightWrapper,
  StyledRootContainer,
  StyledUploadPending,
  useStyles,
} from './FileUpload.styles';
import { ObjectUploaderAction } from './reducer';

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
            <StyledUploadPending
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
