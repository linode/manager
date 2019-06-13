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
import Notice from 'src/components/Notice';
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
  | 'submitButton'
  | 'labelOuter';

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
    cursor: 'pointer',
    position: 'relative',
    top: -4
  },
  divider: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    backgroundColor: theme.color.grey3
  },
  submitButton: {
    marginTop: theme.spacing.unit * 3
  },
  labelOuter: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%'
  }
});

interface Props {
  selectedConfigs: ExtendedConfig[];
  selectedDisks: Linode.Disk[];
  selectedLinode: number | null;
  region: string;
  isSubmitting: boolean;
  currentLinodeId: number;
  errorMap?: Record<string, string | undefined>;
  handleToggleConfig: (id: number) => void;
  handleToggleDisk: (id: number) => void;
  handleSelectLinode: (linodeId: number) => void;
  handleClone: () => void;
  clearAll: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const Configs: React.FC<CombinedProps> = props => {
  const {
    classes,
    currentLinodeId,
    selectedConfigs,
    selectedDisks,
    selectedLinode,
    region,
    isSubmitting,
    errorMap,
    handleToggleConfig,
    handleToggleDisk,
    handleSelectLinode,
    handleClone,
    clearAll
  } = props;

  // These errors come back from from the API under the "disk_size" field
  // when duplicating a disk on the same Linode.
  const linodeError = errorMap && errorMap.disk_size;

  /**
   * Don't include the current Linode in the LinodeSelect component if:
   * 1) There is a selected config (because you can't duplicate configs on the same Linode).
   * 2) There's more than one disk selected (because you can't duplicate multiple configs at once on the same Linode).
   */
  const shouldExcludeCurrentLinode =
    selectedConfigs.length > 0 || selectedDisks.length > 1;

  // Disable the "Clone" button if there is no selected Linode,
  // or if there are no selected configs or disks, or if the selected Linode should be excluded.
  const isCloneButtonDisabled =
    (selectedConfigs.length === 0 && selectedDisks.length === 0) ||
    !selectedLinode ||
    (shouldExcludeCurrentLinode && selectedLinode === currentLinodeId);

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

      {errorMap && errorMap.none && <Notice error text={errorMap.none} />}

      <List>
        {selectedConfigs.map(eachConfig => {
          return (
            <ListItem
              key={eachConfig.id}
              className={classes.list}
              disableGutters
              dense
            >
              <div className={classes.labelOuter}>
                <Typography variant="h3">{eachConfig.label}</Typography>
                <a
                  onClick={() => handleToggleConfig(eachConfig.id)}
                  className={classes.closeIcon}
                  data-qa-inline-delete
                >
                  <Close />
                </a>
              </div>
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
                onClick={() => handleToggleDisk(eachDisk.id)}
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

      {/* @todo: This LinodeSelect needs to be grouped by region */}
      <LinodeSelect
        label="Destination"
        generalError={linodeError}
        selectedLinode={selectedLinode}
        handleChange={linode => handleSelectLinode(linode.id)}
        excludedLinodes={
          shouldExcludeCurrentLinode ? [currentLinodeId] : undefined
        }
        updateFor={[
          selectedLinode,
          shouldExcludeCurrentLinode,
          errorMap,
          classes
        ]}
      />

      <Button
        className={classes.submitButton}
        disabled={isCloneButtonDisabled}
        type="primary"
        onClick={handleClone}
        loading={isSubmitting}
      >
        Clone
      </Button>
    </Paper>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(styled);

export default enhanced(Configs);
