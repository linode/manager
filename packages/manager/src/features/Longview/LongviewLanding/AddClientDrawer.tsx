import { LongviewClient } from 'linode-js-sdk/lib/longview';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer, { DrawerProps } from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

import { getErrorMap } from 'src/utilities/errorUtils';

interface Props extends Omit<DrawerProps, 'onClose'> {
  onClose: () => void;
  createClient: (label: string) => Promise<LongviewClient>;
}

type CombinedProps = Props;

const AddClientDrawer: React.FC<CombinedProps> = props => {
  const [label, setLabel] = React.useState<string>('');
  const [isSubmitting, toggleSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError[] | undefined>(undefined);

  const { createClient, onClose, ...rest } = props;

  const submitForm = (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    toggleSubmitting(true);
    setError(undefined);

    createClient(label.trim())
      .then(response => {
        toggleSubmitting(false);
        props.onClose();
      })
      .catch((err: APIError[]) => {
        setError(err);
        toggleSubmitting(false);
      });
  };

  React.useEffect(() => {
    if (props.open) {
      setError(undefined);
      toggleSubmitting(false);
      setLabel('');
    }
  }, [props.open]);

  const errorMap = getErrorMap(['label'], error);

  return (
    <Drawer {...rest} onClose={onClose}>
      {errorMap.none && <Notice error text={errorMap.none} />}
      <form onSubmit={submitForm}>
        <TextField
          errorText={errorMap.label}
          aria-label="Name of our new Longview client"
          label="Label"
          placeholder="ex: my-longview-client"
          required
          onChange={({ target: { value } }) => setLabel(value)}
          inputProps={{
            autoFocus: true
          }}
        />

        <ActionsPanel>
          <Button
            buttonType="primary"
            onClick={submitForm}
            data-qa-submit
            type="submit"
            loading={isSubmitting}
          >
            Create
          </Button>
          <Button
            onClick={onClose}
            buttonType="cancel"
            data-qa-cancel
          >
            Cancel
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

export default React.memo(AddClientDrawer);
