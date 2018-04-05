import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';
import InputLabel from 'material-ui/Input/InputLabel';
import RadioGroup from 'material-ui/Radio/RadioGroup';
import FormControl from 'material-ui/Form/FormControl';
import FormControlLabel from 'material-ui/Form/FormControlLabel';

import ActionsPanel from 'src/components/ActionsPanel';
import Radio from 'src/components/Radio';
import Drawer from 'src/components/Drawer';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface LinodeConfigSelectionDrawerCallback {
  (id: number): void;
}

interface Props {
  onClose: () => void;
  onSubmit: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  open: boolean;
  configs: Linode.Config[];
  selected?: string;
  error?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeConfigSelectionDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    onClose, onSubmit, onChange, open, configs, selected, error,
  } = props;

  const hasError = Boolean(error);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Select a Linode Configuration"
    >
      <FormControl fullWidth>
        <InputLabel
          htmlFor="config"
          disableAnimation
          shrink={true}
          error={hasError}
        >
          Config
      </InputLabel>
        <RadioGroup
          aria-label="config"
          name="config"
          value={selected}
          onChange={onChange}
        >
          {
            configs.map(config =>
              <FormControlLabel
                key={config.id}
                value={String(config.id)}
                label={config.label}
                control={<Radio />}
              />)
          }
        </RadioGroup>
      </FormControl>
      <ActionsPanel>
        <Button variant="raised" color="primary" onClick={onSubmit}>
          Submit
        </Button>
        <Button onClick={onClose}>Cancel</Button>
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
