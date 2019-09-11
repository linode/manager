import { Config } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SelectionCard from 'src/components/SelectionCard';

export type LinodeConfigSelectionDrawerCallback = (id: number) => void;

interface Props {
  linodeConfigs: Config[];
  onClose: () => void;
  onSubmit: () => void;
  onSelectConfig: (configID: number) => void;
  isOpen: boolean;
  selectedConfigID?: number;
  loading: boolean;
  error?: Linode.ApiFieldError[];
}

type CombinedProps = Props;

const LinodeConfigSelectionDrawer: React.FC<CombinedProps> = props => {
  const {
    onClose,
    onSubmit,
    onSelectConfig,
    isOpen,
    linodeConfigs,
    selectedConfigID
  } = props;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Select a Linode Configuration"
    >
      {props.error && <Notice error>{props.error[0].reason}</Notice>}
      <Grid container spacing={1} style={{ marginTop: 16 }}>
        {linodeConfigs.map(config => (
          <SelectionCard
            key={config.id}
            heading={config.label}
            subheadings={[config.kernel]}
            onClick={() => onSelectConfig(config.id)}
            checked={selectedConfigID === config.id}
            variant="check"
          />
        ))}
      </Grid>
      <ActionsPanel>
        <Button buttonType="primary" onClick={onSubmit} loading={props.loading}>
          Submit
        </Button>
        <Button onClick={onClose} buttonType="secondary" className="cancel">
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

export default LinodeConfigSelectionDrawer;
