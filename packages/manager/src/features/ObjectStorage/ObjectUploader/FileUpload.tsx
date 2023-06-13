import * as React from 'react';
import CautionIcon from 'src/assets/icons/caution.svg';
import FileUploadComplete from 'src/assets/icons/fileUploadComplete.svg';
import Button from 'src/components/Button';
import { LinearProgress } from 'src/components/LinearProgress';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
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
      type: 'RESUME_UPLOAD',
      fileName: props.fileName,
    });

  const cancelOverwrite = () =>
    props.dispatch({
      type: 'CANCEL_OVERWRITE',
      fileName: props.fileName,
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
        variant="determinate"
        value={props.percentCompleted}
        classes={{
          root: classes.progressBar,
          barColorPrimary: classes.barColorPrimary,
        }}
        className={classes.progressBar}
      />
      <StyledContainer>
        <StyledLeftWrapper>
          <Typography
            variant="body1"
            className={cx({
              [classes.error]: props.error !== '',
            })}
          >
            {props.displayName}
          </Typography>
        </StyledLeftWrapper>
        <StyledRightWrapper>
          <StyledFileSizeTypography
            variant="body1"
            className={cx({
              [classes.error]: props.error !== '',
            })}
          >
            {readableBytes(props.sizeInBytes).formatted}
          </StyledFileSizeTypography>
          {props.percentCompleted === 100 ? (
            <FileUploadComplete
              className={classes.iconRight}
              height={22}
              width={22}
            />
          ) : props.error || props.overwriteNotice ? (
            <CautionIcon
              className={cx({
                [classes.iconRight]: true,
                [classes.error]: props.error !== '',
              })}
              height={22}
              width={22}
            />
          ) : (
            <StyledUploadPending height={22} width={22} />
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
    <Tooltip title={TooltipTitle} placement="bottom">
      {Content}
    </Tooltip>
  ) : (
    Content
  );
});
