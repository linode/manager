import { createLongviewClient } from 'linode-js-sdk/lib/longview';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer, { DrawerProps } from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

import { getErrorMap } from 'src/utilities/errorUtils';

/* tslint:disable-next-line */
interface Props extends Omit<DrawerProps, 'onClose'> {
  onClose: () => void;
}

type CombinedProps = Props;

const AddClientDrawer: React.FC<CombinedProps> = props => {
  const [label, setLabel] = React.useState<string>('');
  const [isSubmitting, toggleSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError[] | undefined>(undefined);

  const submitForm = () => {
    toggleSubmitting(true);
    setError(undefined);

    createLongviewClient(label.trim())
      .then(response => {
        toggleSubmitting(false);
      })
      .catch((e: APIError[]) => {
        setError(e);
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

  const handleCloseDrawer = () => {
    props.onClose();
  };

  const errorMap = getErrorMap(['label'], error);

  return (
    <Drawer {...props} onClose={handleCloseDrawer}>
      {errorMap.none && <Notice error text={errorMap.none} />}
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
          loading={isSubmitting}
        >
          Create
        </Button>
        <Button onClick={handleCloseDrawer} buttonType="cancel" data-qa-cancel>
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

export default React.memo(AddClientDrawer);
