import { Region } from '@linode/api-v4/lib/regions';
import { pathOr } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RegionSelect, {
  flags
} from 'src/components/EnhancedSelect/variants/RegionSelect';
import { dcDisplayNames } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
import {
  formatRegion,
  getHumanReadableCountry
} from 'src/utilities/formatRegion';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(4),
    '& > p:first-of-type': {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(1.5),
      fontSize: theme.spacing(2),
      fontFamily: theme.font.bold
    }
  },
  rootCMR: {
    padding: 0,
    '& > p:first-of-type': {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(1.5),
      fontSize: theme.spacing(2),
      fontFamily: theme.font.bold
    }
  },
  currentRegion: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& svg': {
      marginRight: theme.spacing()
    }
  },
  select: {
    marginTop: theme.spacing(2)
  }
}));

interface Props {
  currentRegion: string;
  allRegions: Region[];
  handleSelectRegion: (id: string) => void;
  selectedRegion: string | null;
  errorText?: string;
  helperText?: string;
}

type CombinedProps = Props;

const ConfigureForm: React.FC<CombinedProps> = props => {
  const { allRegions, currentRegion } = props;
  const classes = useStyles();
  const { cmr } = useFlags();

  const country =
    allRegions.find(thisRegion => thisRegion.id == currentRegion)?.country ??
    'us';

  return (
    <Paper className={cmr ? classes.rootCMR : classes.root}>
      <Typography variant="h3">Configure Migration</Typography>
      <Typography>Current Region:</Typography>
      <div className={classes.currentRegion}>
        {pathOr(() => null, [country], flags)()}
        <Typography>{`${getHumanReadableCountry(
          props.currentRegion
        )}: ${formatRegion(currentRegion)}`}</Typography>
      </div>
      <RegionSelect
        className={classes.select}
        regions={props.allRegions
          .filter(eachRegion => eachRegion.id !== props.currentRegion)
          .map(eachRegion => ({
            ...eachRegion,
            display: dcDisplayNames[eachRegion.id]
          }))}
        handleSelection={props.handleSelectRegion}
        selectedID={props.selectedRegion}
        errorText={props.errorText}
        textFieldProps={{
          helperText: props.helperText
        }}
        menuPlacement="top"
        styles={{
          menuList: (base: any) => ({ ...base, maxHeight: `30vh !important` })
        }}
        label="Select a Region"
      />
    </Paper>
  );
};

export default React.memo(ConfigureForm);
