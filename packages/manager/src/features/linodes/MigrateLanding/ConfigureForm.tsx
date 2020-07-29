import { Region } from '@linode/api-v4/lib/regions';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import RegionSelect, {
  flags
} from 'src/components/EnhancedSelect/variants/RegionSelect';

import { dcDisplayNames } from 'src/constants';
import {
  formatRegion,
  getHumanReadableCountry
} from 'src/utilities/formatRegion';
import { useFlags } from 'src/hooks/useFlags';

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
  currentRegion: { region: string; countryCode: string };
  allRegions: Region[];
  handleSelectRegion: (id: string) => void;
  selectedRegion: string | null;
  errorText?: string;
}

type CombinedProps = Props;

const ConfigureForm: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { cmr } = useFlags();

  return (
    <Paper className={cmr ? classes.rootCMR : classes.root}>
      <Typography variant="h3">Configure Migration</Typography>
      <Typography>Current Region:</Typography>
      <div className={classes.currentRegion}>
        {pathOr(() => null, [props.currentRegion.countryCode], flags)()}
        <Typography>{`${getHumanReadableCountry(
          props.currentRegion.region
        )}: ${formatRegion(props.currentRegion.region)}`}</Typography>
      </div>
      <RegionSelect
        className={classes.select}
        regions={props.allRegions
          .filter(eachRegion => eachRegion.id !== props.currentRegion.region)
          .map(eachRegion => ({
            ...eachRegion,
            display: dcDisplayNames[eachRegion.id]
          }))}
        handleSelection={props.handleSelectRegion}
        selectedID={props.selectedRegion}
        errorText={props.errorText}
        menuPlacement="top"
        styles={{
          menuList: (base: any) => ({ ...base, maxHeight: `30vh !important` })
        }}
        label="Select a Region"
      />
    </Paper>
  );
};

export default compose<CombinedProps, Props>(React.memo)(ConfigureForm);
