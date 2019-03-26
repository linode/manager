import * as React from 'react';
import { compose } from 'recompose';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Button from 'src/components/core/Button';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

type ClassNames = 'helperText' | 'confirmationDialog';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  helperText: {
    marginBottom: theme.spacing.unit * 3
  },
  confirmationDialog: {
    paddingBottom: 0,
    marginBottom: 0
  }
});

interface Props {
  keys: Linode.ObjectStorageKey | null;
  isOpen: boolean;
  close: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ObjectStorageKeyDisplayDialog: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, isOpen, close, keys } = props;

  const confirmationDialogActions = (
    <Button type="secondary" onClick={close} data-qa-close-dialog>
      OK
    </Button>
  );

  // This should never happen, but just in case.
  if (!keys) {
    return null;
  }

  return (
    <ConfirmationDialog
      title="Object Storage Keys"
      actions={confirmationDialogActions}
      open={isOpen}
      onClose={close}
      className={classes.confirmationDialog}
    >
      <Typography variant="body1" className={classes.helperText}>
        Your Object Storage keys have been created. Store these credentials.
        They won't be shown again.
      </Typography>

      <Typography>
        <b>Access Key:</b>
      </Typography>
      <Notice
        spacingTop={16}
        typeProps={{ variant: 'body1' }}
        warning
        text={keys.access_key}
        breakWords
      />

      <Typography>
        <b>Secret Key:</b>
      </Typography>
      <Notice
        spacingTop={16}
        typeProps={{ variant: 'body1' }}
        warning
        text={keys.secret_key}
        breakWords
      />
    </ConfirmationDialog>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(styled);

export default enhanced(ObjectStorageKeyDisplayDialog);
