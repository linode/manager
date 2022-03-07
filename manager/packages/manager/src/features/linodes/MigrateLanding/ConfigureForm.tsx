import { Region } from '@linode/api-v4/lib/regions';
import { pathOr } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RegionSelect, {
  flags,
} from 'src/components/EnhancedSelect/variants/RegionSelect';
import { dcDisplayNames } from 'src/constants';
import {
  formatRegion,
  getHumanReadableCountry,
} from 'src/utilities/formatRegion';

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
  allRegions: Region[];
  handleSelectRegion: (id: string) => void;
  selectedRegion: string | null;
  errorText?: string;
  helperText?: string;
}

type CombinedProps = Props;

const ConfigureForm: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { allRegions, currentRegion } = props;

  const country =
    allRegions.find((thisRegion) => thisRegion.id == currentRegion)?.country ??
    'us';

  return (
    <Paper className={classes.root}>
      <Typography variant="h3">Configure Migration</Typography>
      <Typography>Current Region</Typography>
      <div className={classes.currentRegion}>
        {pathOr(() => null, [country], flags)()}
        <Typography>{`${getHumanReadableCountry(
          props.currentRegion
        )}: ${formatRegion(currentRegion)}`}</Typography>
      </div>
      <RegionSelect
        regions={props.allRegions
          .filter((eachRegion) => eachRegion.id !== props.currentRegion)
          .map((eachRegion) => ({
            ...eachRegion,
            display: dcDisplayNames[eachRegion.id],
          }))}
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
