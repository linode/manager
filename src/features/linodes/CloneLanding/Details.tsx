import Close from '@material-ui/icons/Close';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Divider from 'src/components/core/Divider';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { formatRegion } from 'src/utilities';
import LinodeSelect from '../LinodeSelect';
import { ExtendedConfig } from './utilities';

type ClassNames =
  | 'root'
  | 'header'
  | 'clearButton'
  | 'list'
  | 'nestedList'
  | 'closeIcon'
  | 'divider'
  | 'submitButton';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 2
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.unit * 2
  },
  clearButton: {
    top: -(theme.spacing.unit / 2)
  },
  list: {
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  nestedList: {
    marginLeft: theme.spacing.unit * 2,
    flexBasis: '100%'
  },
  closeIcon: {
    cursor: 'pointer'
  },
  divider: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    backgroundColor: theme.color.grey3
  },
  submitButton: {
    marginTop: theme.spacing.unit * 3
  }
});

interface Props {
  selectedConfigs: ExtendedConfig[];
  selectedDisks: Linode.Disk[];
  selectedLinode: number | null;
  region: string;
  handleSelectConfig: (id: number) => void;
  handleSelectDisk: (id: number) => void;
  handleSelectLinode: (linodeId: number) => void;
  clearAll: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const Configs: React.FC<CombinedProps> = props => {
  const {
    classes,
    selectedConfigs,
    selectedDisks,
    selectedLinode,
    region,
    handleSelectConfig,
    handleSelectDisk,
    handleSelectLinode,
    clearAll
  } = props;

  return (
    <Paper className={classes.root}>
      <header className={classes.header}>
        <Typography variant="h2">Selected</Typography>
        <Button
          className={classes.clearButton}
          type="secondary"
          onClick={clearAll}
          superCompact
        >
          Clear
        </Button>
      </header>
      <List>
        {selectedConfigs.map(eachConfig => {
          return (
            <ListItem
              key={eachConfig.id}
              className={classes.list}
              disableGutters
              dense
            >
              <Typography variant="h3">{eachConfig.label}</Typography>
              <a
                onClick={() => handleSelectConfig(eachConfig.id)}
                className={classes.closeIcon}
                data-qa-inline-delete
              >
                <Close />
              </a>
              <List className={classes.nestedList}>
                {eachConfig.associatedDisks.map(eachDisk => {
                  return (
                    <ListItem key={eachDisk.label} disableGutters dense>
                      <Typography>{eachDisk.label}</Typography>
                    </ListItem>
                  );
                })}
              </List>
            </ListItem>
          );
        })}
      </List>
      <List>
        {selectedDisks.map(eachDisk => {
          return (
            <ListItem
              key={eachDisk.id}
              className={classes.list}
              disableGutters
              dense
            >
              <Typography variant="h3">{eachDisk.label}</Typography>
              <a
                onClick={() => handleSelectDisk(eachDisk.id)}
                className={classes.closeIcon}
                data-qa-inline-delete
              >
                <Close />
              </a>
            </ListItem>
          );
        })}
      </List>

      {(selectedConfigs.length > 0 || selectedDisks.length > 0) && (
        <Divider className={classes.divider} />
      )}

      <Typography>Current Datacenter: {formatRegion(region)}</Typography>

      {/* @todo: This LinodeSelect needs to be subdivided by region */}
      <LinodeSelect
        label="Destination"
        selectedLinode={selectedLinode}
        handleChange={linode => handleSelectLinode(linode.id)}
        updateFor={[selectedLinode, classes]}
      />

      <Button
        className={classes.submitButton}
        type="primary"
        onClick={() => alert(`Clone`)}
      >
        Clone
      </Button>
    </Paper>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(styled);

export default enhanced(Configs);
