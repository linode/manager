import { Config } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';

export type LinodeConfigSelectionDrawerCallback = (id: number) => void;

interface Props {
  error?: APIError[];
  isOpen: boolean;
  linodeConfigs: Config[];
  loading: boolean;
  onClose: () => void;
  onSelectConfig: (configID: number) => void;
  onSubmit: () => void;
  selectedConfigID?: number;
}

type CombinedProps = Props;

const LinodeConfigSelectionDrawer: React.FC<CombinedProps> = (props) => {
  const {
    isOpen,
    linodeConfigs,
    onClose,
    onSelectConfig,
    onSubmit,
    selectedConfigID,
  } = props;

  return (
    <Drawer
      onClose={onClose}
      open={isOpen}
      title="Select a Linode Configuration"
    >
      {props.error && <Notice error>{props.error[0].reason}</Notice>}
      <Grid container spacing={1} style={{ marginTop: 16 }}>
        {linodeConfigs.map((config) => (
          <SelectionCard
            checked={selectedConfigID === config.id}
            heading={config.label}
            key={config.id}
            onClick={() => onSelectConfig(config.id)}
            subheadings={[config.kernel]}
          />
        ))}
      </Grid>
      <ActionsPanel>
        <Button buttonType="primary" loading={props.loading} onClick={onSubmit}>
          Submit
        </Button>
        <Button buttonType="secondary" className="cancel" onClick={onClose}>
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

export default LinodeConfigSelectionDrawer;
