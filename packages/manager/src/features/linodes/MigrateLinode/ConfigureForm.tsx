import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import RegionSelect, {
  flags,
} from 'src/components/EnhancedSelect/variants/RegionSelect';
import { useRegionsQuery } from 'src/queries/regions';
import { getHumanReadableCountry } from 'src/utilities/formatRegion';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    padding: 0,
    '& > p:first-of-type': {
      color: theme.color.label,
      fontFamily: theme.font.bold,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(),
    },
  },
  currentRegion: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing(4),
    '& svg': {
      marginRight: theme.spacing(),
      marginLeft: 14,
    },
  },
}));

interface Props {
  currentRegion: string;
  handleSelectRegion: (id: string) => void;
  selectedRegion: string | null;
  errorText?: string;
  helperText?: string;
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
        {flags[country]?.()}
        <Typography>{`${getHumanReadableCountry(props.currentRegion)}: ${
          currentActualRegion?.label ?? currentRegion
        }`}</Typography>
      </div>
      <RegionSelect
        regions={
          regions?.filter(
            (eachRegion) => eachRegion.id !== props.currentRegion
          ) ?? []
        }
        handleSelection={props.handleSelectRegion}
        selectedID={props.selectedRegion}
        errorText={props.errorText}
        textFieldProps={{
          helperText: props.helperText,
        }}
        menuPlacement="top"
        styles={{
          menuList: (base: any) => ({ ...base, maxHeight: `30vh !important` }),
        }}
      />
    </Paper>
  );
};

export default React.memo(ConfigureForm);
