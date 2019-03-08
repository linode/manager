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
import { CreateObjectStorageKeysRequest } from 'src/services/profile/objectStorageKeys';

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
  CreateObjectStorageKeysRequest &
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
  return (
    <Drawer title="Create an Object Storage Key" open={open} onClose={onClose}>
      {errors &&
        errors.map(error => (
          <Notice key={error.reason} text={error.reason} error data-qa-error />
        ))}
      <Typography>
        Generate an Object Storage key pair for use with an S3-compatible
        client.
      </Typography>

      <TextField
        label="Label"
        data-qa-add-label
        value={label}
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
