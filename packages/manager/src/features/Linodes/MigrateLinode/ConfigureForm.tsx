import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Country } from 'src/components/EnhancedSelect/variants/RegionSelect/utils';
import { Flag } from 'src/components/Flag';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';
import { useRegionsQuery } from 'src/queries/regions';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

const useStyles = makeStyles((theme: Theme) => ({
  currentRegion: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(),
    marginBottom: theme.spacing(4),
  },
  root: {
    '& > p:first-of-type': {
      color: theme.color.label,
      fontFamily: theme.font.bold,
      marginBottom: theme.spacing(),
      marginTop: theme.spacing(2),
    },
    marginTop: theme.spacing(4),
    padding: 0,
  },
}));

interface Props {
  currentRegion: string;
  errorText?: string;
  handleSelectRegion: (id: string) => void;
  helperText?: string;
  selectedRegion: null | string;
}

const ConfigureForm = (props: Props) => {
  const classes = useStyles();
  const { currentRegion } = props;

  const { data: regions } = useRegionsQuery();

  const currentActualRegion = regions?.find((r) => r.id === currentRegion);

  const country =
    regions?.find((thisRegion) => thisRegion.id == currentRegion)?.country ??
    'us';

  return (
    <Paper className={classes.root}>
      <Typography variant="h3">Configure Migration</Typography>
      <Typography>Current Region</Typography>
      <div className={classes.currentRegion}>
        <Flag country={country as Lowercase<Country>} />
        <Typography>{`${getRegionCountryGroup(currentActualRegion)}: ${
          currentActualRegion?.label ?? currentRegion
        }`}</Typography>
      </div>
      <RegionSelect
        regions={
          regions?.filter(
            (eachRegion) => eachRegion.id !== props.currentRegion
          ) ?? []
        }
        styles={{
          menuList: (base: any) => ({ ...base, maxHeight: `30vh !important` }),
        }}
        textFieldProps={{
          helperText: props.helperText,
        }}
        errorText={props.errorText}
        handleSelection={props.handleSelectRegion}
        menuPlacement="top"
        selectedID={props.selectedRegion}
      />
    </Paper>
  );
};

export default React.memo(ConfigureForm);
