import Close from '@material-ui/icons/Close';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import LinodeSelect from '../LinodeSelect';

type ClassNames =
  | 'root'
  | 'closeIcon'
  | 'selectedElement'
  | 'divider'
  | 'submitButton';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    '& ul': {
      listStyleType: 'none',
      paddingLeft: 0
    },
    '& li': {
      paddingTop: theme.spacing.unit / 2,
      paddingBottom: theme.spacing.unit / 2
    },
    '& ul .diskSublist': {
      paddingLeft: theme.spacing.unit * 2
    }
  },
  closeIcon: {
    cursor: 'pointer'
  },
  selectedElement: {
    marginTop: 0,
    width: 415,
    [theme.breakpoints.down('xs')]: {
      width: 165
    },
    '& > div ': {
      // backgroundColor: theme.bg.main,
      border: 0
    }
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
  selectedConfigs: Linode.Config[];
  selectedDisks: Linode.Disk[];
  selectedLinode: number | null;
  allDisks: Linode.Disk[];
  handleSelectConfig: (id: number) => void;
  handleSelectDisk: (id: number) => void;
  clearAll: () => void;
  handleSelectLinode: (linodeId: number) => void;
  formattedRegion: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const Configs: React.FC<CombinedProps> = props => {
  const {
    classes,
    selectedConfigs,
    selectedDisks,
    allDisks,
    handleSelectConfig,
    handleSelectDisk,
    clearAll,
    selectedLinode,
    handleSelectLinode,
    formattedRegion
  } = props;

  return (
    <Paper className={classes.root}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 32
        }}
      >
        <Typography variant="h2">Selected</Typography>
        <Button type="secondary" superCompact onClick={clearAll}>
          Clear
        </Button>
      </div>
      <ul>
        {selectedConfigs.map(eachConfig => {
          return (
            <li key={eachConfig.id}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}
              >
                <Typography variant="h3">{eachConfig.label}</Typography>
                <a
                  onClick={() => handleSelectConfig(eachConfig.id)}
                  className={classes.closeIcon}
                  data-qa-inline-delete
                >
                  <Close />
                </a>
              </div>
              <ul className="diskSublist">
                {getDisksForDisplay(eachConfig, allDisks).map(eachDisk => {
                  return (
                    <li key={eachDisk.label}>
                      <Typography>{eachDisk.label}</Typography>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
      <ul>
        {selectedDisks.map(eachDisk => {
          return (
            <li
              key={eachDisk.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h3">{eachDisk.label}</Typography>
              <a
                onClick={() => handleSelectDisk(eachDisk.id)}
                className={classes.closeIcon}
                data-qa-inline-delete
              >
                <Close />
              </a>
            </li>
          );
        })}
      </ul>

      {(selectedConfigs.length > 0 || selectedDisks.length > 0) && (
        <Divider className={classes.divider} />
      )}

      <Typography>Current Datacenter: {formattedRegion}</Typography>
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

const getDisksForDisplay = (
  config: Linode.Config,
  disks: Linode.Disk[]
): Linode.Disk[] => {
  const disksOnConfig: number[] = [];
  Object.keys(config.devices).forEach(key => {
    if (config.devices[key] && config.devices[key].disk_id) {
      disksOnConfig.push(config.devices[key].disk_id);
    }
  });
  return disks.filter(eachDisk => disksOnConfig.includes(eachDisk.id));
};
