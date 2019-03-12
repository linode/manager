import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { CreateObjectStorageKeyRequest } from 'src/services/profile/objectStorageKeys';
import { getErrorMap } from 'src/utilities/errorUtils';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

export interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  updateLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props &
  CreateObjectStorageKeyRequest &
  WithStyles<ClassNames>;

export const ObjectStorageDrawer: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    open,
    onClose,
    onSubmit,
    label,
    updateLabel,
    isLoading,
    errors
  } = props;

  const hasErrorFor = getErrorMap(['label'], errors);
  const generalError = hasErrorFor.none;
  return (
    <Drawer title="Create an Object Storage Key" open={open} onClose={onClose}>
      {generalError && (
        <Notice key={generalError} text={generalError} error data-qa-error />
      )}
      <Typography>
        Generate an Object Storage key pair for use with an S3-compatible
        client.
      </Typography>

      <TextField
        label="Label"
        data-qa-add-label
        value={label}
        error={!!hasErrorFor.label}
        errorText={hasErrorFor.label}
        onChange={updateLabel}
      />

      <ActionsPanel>
        <Button
          type="primary"
          onClick={onSubmit}
          loading={isLoading}
          data-qa-submit
        >
          Submit
        </Button>
        <Button
          onClick={onClose}
          data-qa-cancel
          type="secondary"
          className="cancel"
        >
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

const styled = withStyles(styles);

export default styled(ObjectStorageDrawer);
