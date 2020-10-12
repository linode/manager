import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import LinodeMultiSelect from 'src/components/LinodeMultiSelect';
import useVlans from 'src/hooks/useVlans';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

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
  const [error, setError] = React.useState<string | undefined>(undefined);
  const { connectVlan } = useVlans();

  const handleSubmit = () => {
    setSubmitting(true);
    connectVlan(vlanID, selectedLinodes)
      .then(() => {
        setSubmitting(false);
        onClose();
      })
      .catch(error => {
        setSubmitting(false);
        setError(
          getAPIErrorOrDefault(error, 'Unable to attach to VLAN')[0].reason
        );
      });
  };

  return (
    <Drawer title="Attach a Linode" open={isOpen}>
      {error && <Notice error text={error} />}
      <LinodeMultiSelect
        filteredLinodes={linodes}
        handleChange={(selected: number[]) => setSelectedLinodes(selected)}
        allowedRegions={[region]}
      />
      <ActionsPanel>
        <Button
          buttonType="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          data-testid="submit-attach-vlan-form"
        >
          {' '}
          Attach
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

export default React.memo(AttachVLANDrawer);
