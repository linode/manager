import Close from '@material-ui/icons/Close';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'closeIcon' | 'selectedElement';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 2
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
  }
});

interface Props {
  selectedConfigs: Linode.Config[];
  selectedDisks: Linode.Disk[];
  handleSelectConfig: (id: number) => void;
  handleSelectDisk: (id: number) => void;
  clearAll: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const Configs: React.FC<CombinedProps> = props => {
  const {
    classes,
    selectedConfigs,
    selectedDisks,
    handleSelectConfig,
    handleSelectDisk,
    clearAll
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
      {selectedConfigs.map(eachConfig => {
        return (
          <div
            key={eachConfig.id}
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
        );
      })}
      {selectedDisks.map(eachDisk => {
        return (
          <div
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
          </div>
        );
      })}
    </Paper>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(styled);

export default enhanced(Configs);
