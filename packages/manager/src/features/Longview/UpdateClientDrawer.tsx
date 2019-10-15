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
  updateClient: (id: number, label: string) => Promise<LongviewClient>;
  selectedID?: number;
  selectedLabel: string;
}

type CombinedProps = Props;

const UpdateClientDrawer: React.FC<CombinedProps> = props => {
  const { updateClient, onClose, selectedID, selectedLabel, ...rest } = props;

  const [label, setLabel] = React.useState<string>(selectedLabel);
  const [isSubmitting, toggleSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError[] | undefined>(undefined);

  const submitForm = (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    toggleSubmitting(true);
    setError(undefined);

    if (!selectedID) {
      return setError([
        {
          reason: 'Your label could not be updated. Please try again.'
        }
      ]);
    }

    /** just close the drawer if no edits have been made */
    if (label === selectedLabel) {
      return onClose();
    }

    updateClient(selectedID, label)
      .then(() => {
        toggleSubmitting(false);
        onClose();
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
      setLabel(selectedLabel);
    }
  }, [props.open]);

  const handleCloseDrawer = () => {
    onClose();
  };

  const errorMap = getErrorMap(['label'], error);

  return (
    <Drawer {...rest} onClose={handleCloseDrawer}>
      {errorMap.none && <Notice error text={errorMap.none} />}
      <form onSubmit={submitForm}>
        <TextField
          errorText={errorMap.label}
          aria-label="Updated name of this Longview Client"
          label="Label"
          placeholder="ex: my-longview-client"
          value={label}
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
            Update
          </Button>
          <Button
            onClick={handleCloseDrawer}
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

export default React.memo(UpdateClientDrawer);
