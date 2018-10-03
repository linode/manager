import * as React from 'react';

import Button from '@material-ui/core/Button';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import SelectionCard from 'src/components/SelectionCard';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

export type LinodeConfigSelectionDrawerCallback = (id: number) => void;

interface Props {
  onClose: () => void;
  onSubmit: () => void;
  onChange: (id: number) => void;
  open: boolean;
  configs: Linode.Config[];
  selected?: string;
  error?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeConfigSelectionDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    onClose, onSubmit, onChange, open, configs, selected,
  } = props;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Select a Linode Configuration"
    >
      <Grid container spacing={8} style={{ marginTop: 16 }}>
    {
      configs.map(config =>
        <SelectionCard
          key={config.id}
          heading={config.label}
          subheadings={[config.kernel]}
          onClick={() => onChange(config.id)}
          checked={selected === String(config.id)}
        />,
      )
    }
      </Grid>
      <ActionsPanel>
        <Button
          variant="raised"
          color="primary"
          onClick={onSubmit}
        >
          Submit
        </Button>
        <Button
          onClick={onClose}
          variant="raised"
          color="secondary"
          className="cancel"
        >
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

LinodeConfigSelectionDrawer.defaultProps = {
  configs: [],
  selected: '',
  open: false,
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(LinodeConfigSelectionDrawer);
