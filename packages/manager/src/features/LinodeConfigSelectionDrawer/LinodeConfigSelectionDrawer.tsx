import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import SelectionCard from 'src/components/SelectionCard';

export type LinodeConfigSelectionDrawerCallback = (id: number) => void;

interface Props {
  configs: Linode.Config[];
  onClose: () => void;
  onSubmit: () => void;
  onChange: (id: number) => void;
  open: boolean;
  selected?: string;
  error?: string;
}

type CombinedProps = Props;

const LinodeConfigSelectionDrawer: React.StatelessComponent<
  CombinedProps
> = props => {
  const { onClose, onSubmit, onChange, open, configs, selected } = props;

  return (
    <Drawer open={open} onClose={onClose} title="Select a Linode Configuration">
      <Grid container spacing={1} style={{ marginTop: 16 }}>
        {configs.map(config => (
          <SelectionCard
            key={config.id}
            heading={config.label}
            subheadings={[config.kernel]}
            onClick={() => onChange(config.id)}
            checked={selected === String(config.id)}
            variant="check"
          />
        ))}
      </Grid>
      <ActionsPanel>
        <Button buttonType="primary" onClick={onSubmit}>
          Submit
        </Button>
        <Button onClick={onClose} buttonType="secondary" className="cancel">
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

LinodeConfigSelectionDrawer.defaultProps = {
  selected: '',
  open: false,
  configs: []
};

export default LinodeConfigSelectionDrawer;
