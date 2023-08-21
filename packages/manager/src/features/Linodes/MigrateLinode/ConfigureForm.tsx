import { useTheme } from '@mui/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Country } from 'src/components/EnhancedSelect/variants/RegionSelect/utils';
import { Flag } from 'src/components/Flag';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import {
  StyledDiv,
  StyledFormLabel,
  StyledMigrationBox,
  StyledMigrationContainer,
  StyledPaper,
} from './ConfigureForm.styles';

import type { Linode } from '@linode/api-v4';

interface Props {
  currentRegion: string;
  errorText?: string;
  handleSelectRegion: (id: string) => void;
  helperText?: string;
  linodeType: Linode['type'];
  selectedRegion: null | string;
}

export const ConfigureForm = React.memo((props: Props) => {
  const { currentRegion, linodeType } = props;
  const theme = useTheme();
  const { data: regions } = useRegionsQuery();
  const { data: currentLinodeType } = useTypeQuery(
    linodeType || '',
    Boolean(linodeType)
  );
  const currentActualRegion = regions?.find((r) => r.id === currentRegion);
  const country =
    regions?.find((thisRegion) => thisRegion.id == currentRegion)?.country ??
    'us';
  const currentPrice = {
    backups: currentLinodeType?.addons?.backups?.price?.monthly,
    hourly: currentLinodeType?.price?.hourly,
    monthly: currentLinodeType?.price?.monthly,
  };
  const priceFontSize = `${theme.typography.body1.fontSize}`;

  return (
    <StyledPaper>
      <Typography variant="h3">Configure Migration</Typography>
      <StyledMigrationContainer>
        <StyledMigrationBox>
          <StyledFormLabel htmlFor={`current-region-${currentRegion}`}>
            Current Region
          </StyledFormLabel>
          <StyledDiv>
            <Flag country={country as Lowercase<Country>} />
            <Typography
              id={`current-region-${currentRegion}`}
            >{`${getRegionCountryGroup(currentActualRegion)}: ${
              currentActualRegion?.label ?? currentRegion
            }`}</Typography>
          </StyledDiv>
        </StyledMigrationBox>
        <StyledMigrationBox>
          <RegionSelect
            regions={
              regions?.filter(
                (eachRegion) => eachRegion.id !== props.currentRegion
              ) ?? []
            }
            styles={{
              menuList: (base: any) => ({
                ...base,
                maxHeight: `30vh !important`,
              }),
            }}
            textFieldProps={{
              helperText: props.helperText,
            }}
            errorText={props.errorText}
            handleSelection={props.handleSelectRegion}
            label="New Region"
            menuPlacement="top"
            selectedID={props.selectedRegion}
          />
        </StyledMigrationBox>
      </StyledMigrationContainer>
      <StyledMigrationContainer>
        <StyledMigrationBox>
          <StyledFormLabel htmlFor={`current-price`}>
            Current Price
          </StyledFormLabel>
          {currentPrice.monthly && currentPrice.hourly && currentPrice.backups && (
            <Box alignItems="baseline" display="inline-flex">
              <DisplayPrice
                fontSize={priceFontSize}
                interval="month"
                price={currentPrice.monthly}
              />
              ,&nbsp;
              <DisplayPrice
                fontSize={priceFontSize}
                interval="hour"
                price={currentPrice.hourly}
              />
              &nbsp;
              <Typography fontSize={priceFontSize} fontWeight="bold">
                | Backups&nbsp;
              </Typography>
              <DisplayPrice
                fontSize={priceFontSize}
                interval="month"
                price={currentPrice.backups}
              />
            </Box>
          )}
        </StyledMigrationBox>
        <StyledMigrationBox>
          <StyledFormLabel htmlFor={`new-price`}>New Price</StyledFormLabel>
        </StyledMigrationBox>
      </StyledMigrationContainer>
    </StyledPaper>
  );
});
