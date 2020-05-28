import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

type ClassNames = 'helperText' | 'confirmationDialog';

const styles = (theme: Theme) =>
  createStyles({
    helperText: {
      marginBottom: theme.spacing(3)
    },
    confirmationDialog: {
      paddingBottom: 0,
      marginBottom: 0
    }
  });

interface Props {
  objectStorageKey: ObjectStorageKey | null;
  isOpen: boolean;
  close: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const AccessKeyDisplayDialog: React.FC<CombinedProps> = props => {
  const { classes, objectStorageKey, isOpen, close } = props;

  // This should never happen, but just in case.
  if (!objectStorageKey) {
    return null;
  }

  return (
    <ConfirmationDialog
      title="Access Keys"
      actions={
        <Button buttonType="secondary" onClick={close} data-qa-close-dialog>
          OK
        </Button>
      }
      open={isOpen}
      onClose={close}
      className={classes.confirmationDialog}
    >
      <Typography variant="body1" className={classes.helperText}>
        Your keys have been generated. For security purposes, we can only
        display your Secret Key once, after which it can’t be recovered.{' '}
        <strong>Be sure to keep it in a safe place</strong>
      </Typography>

      <Typography>
        <b>Access Key:</b>
      </Typography>
      <Notice
        spacingTop={16}
        typeProps={{ variant: 'body1' }}
        warning
        text={objectStorageKey.access_key}
        breakWords
      />

      <Typography>
        <b>Secret Key:</b>
      </Typography>
      <Notice
        spacingTop={16}
        typeProps={{ variant: 'body1' }}
        warning
        text={objectStorageKey.secret_key}
        breakWords
      />
    </ConfirmationDialog>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(styled);

export default enhanced(AccessKeyDisplayDialog);
