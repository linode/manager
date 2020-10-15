import { Linode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import LinodeMultiSelect from 'src/components/LinodeMultiSelect';
import useLinodes from 'src/hooks/useLinodes';
import useVlans from 'src/hooks/useVlans';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vlanID: number;
  region: string;
  linodes: number[];
}

export const AttachVLANDrawer: React.FC<Props> = props => {
  const { isOpen, linodes, onClose, region, vlanID } = props;
  const [selectedLinodes, setSelectedLinodes] = React.useState<number[]>([]);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<APIError[]>([]);
  const { connectVlan } = useVlans();
  const {
    linodes: { itemsById: linodesData }
  } = useLinodes();

  React.useEffect(() => {
    if (isOpen) {
      setSelectedLinodes([]);
      setError([]);
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    setError([]);
    setSubmitting(true);
    connectVlan(vlanID, selectedLinodes)
      .then(() => {
        setSubmitting(false);
        onClose();
      })
      .catch(error => {
        setSubmitting(false);
        setError(getAPIErrorOrDefault(error, 'Error attaching Linode to VLAN'));
      });
  };

  const errorMap = getErrorMap(['linodes'], error);
  const generalError = interceptGeneralError(errorMap.none, linodesData);

  return (
    <Drawer title="Add a Linode" open={isOpen} onClose={onClose}>
      {generalError && <Notice error text={generalError} />}
      <LinodeMultiSelect
        filteredLinodes={linodes}
        handleChange={(selected: number[]) => setSelectedLinodes(selected)}
        allowedRegions={[region]}
        errorText={errorMap.linodes}
        helperText="Only Linodes in this VLAN's region are displayed."
      />
      <ActionsPanel>
        <Button
          buttonType="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          data-testid="submit-attach-vlan-form"
        >
          Attach
        </Button>
        <Button
          buttonType="secondary"
          onClick={onClose}
          data-testid="cancel-attach-vlan-form"
        >
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

export const interceptGeneralError = (
  error: string | undefined,
  linodesData: Record<string, Linode>
) => {
  if (!error) {
    return null;
  }
  const match = error.match(/linode with id ([0-9]+)/i);
  const linodeId = match ? match[1] : null;
  if (linodeId) {
    return `Linode ${linodesData[linodeId]?.label ??
      ''} has reached its interface limit.`;
  }
  return 'Unable to attach Linodes.';
};

export default React.memo(AttachVLANDrawer);
