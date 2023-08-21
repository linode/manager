import { styled } from '@mui/material/styles';
import * as React from 'react';

import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Country } from 'src/components/EnhancedSelect/variants/RegionSelect/utils';
import { Flag } from 'src/components/Flag';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';
import { useRegionsQuery } from 'src/queries/regions';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

interface Props {
  currentRegion: string;
  errorText?: string;
  handleSelectRegion: (id: string) => void;
  helperText?: string;
  selectedRegion: null | string;
}

export const ConfigureForm = React.memo((props: Props) => {
  const { currentRegion } = props;

  const { data: regions } = useRegionsQuery();

  const currentActualRegion = regions?.find((r) => r.id === currentRegion);

  const country =
    regions?.find((thisRegion) => thisRegion.id == currentRegion)?.country ??
    'us';

  return (
    <StyledPaper>
      <Typography variant="h3">Configure Migration</Typography>
      <Typography>Current Region</Typography>
      <StyledDiv>
        <Flag country={country as Lowercase<Country>} />
        <Typography>{`${getRegionCountryGroup(currentActualRegion)}: ${
          currentActualRegion?.label ?? currentRegion
        }`}</Typography>
      </StyledDiv>
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
    </StyledPaper>
  );
});

const StyledPaper = styled(Paper, { label: 'StyledPaper' })(({ theme }) => ({
  '& > p:first-of-type': {
    color: theme.color.label,
    fontFamily: theme.font.bold,
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(2),
  },
  marginTop: theme.spacing(4),
  padding: 0,
}));

const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(),
  marginBottom: theme.spacing(4),
}));
