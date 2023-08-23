import * as React from 'react';

import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Country } from 'src/components/EnhancedSelect/variants/RegionSelect/utils';
import { Flag } from 'src/components/Flag';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';
import {
  getLinodeRegionPrice,
  isLinodeTypeDifferentPriceInSelectedRegion,
} from 'src/utilities/pricing/linodes';

import {
  StyledDiv,
  StyledMigrationBox,
  StyledMigrationContainer,
  StyledPaper,
  StyledSpan,
} from './ConfigureForm.styles';
import { MigrationPricing } from './MigrationPricing';

import type { MigrationPricingProps } from './MigrationPricing';
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
  const {
    currentRegion,
    errorText,
    handleSelectRegion,
    helperText,
    linodeType,
    selectedRegion,
  } = props;

  const { data: regions } = useRegionsQuery();
  const { data: currentLinodeType } = useTypeQuery(
    linodeType || '',
    Boolean(linodeType)
  );

  const flags = useFlags();
  const { dcSpecificPricing } = flags;
  const currentActualRegion = regions?.find((r) => r.id === currentRegion);
  const country =
    regions?.find((thisRegion) => thisRegion.id == currentRegion)?.country ??
    'us';
  const shouldDisplayPriceComparison = Boolean(
    dcSpecificPricing &&
      selectedRegion &&
      isLinodeTypeDifferentPriceInSelectedRegion({
        regionA: currentRegion,
        regionB: selectedRegion,
        type: currentLinodeType,
      })
  );

  function useSelectedLinodePrice(
    selectedRegion: null | string,
    linodeType: string | undefined
  ) {
    const { data: selectLinodeType } = useTypeQuery(
      linodeType || '',
      Boolean(linodeType)
    );

    const [selectedRegionType, setSelectedRegionType] = React.useState<any>(
      undefined
    );
    const [selectedRegionPrice, setSelectedRegionPrice] = React.useState<any>(
      undefined
    );

    React.useEffect(() => {
      if (selectedRegion && selectLinodeType) {
        const newRegionPrice = getLinodeRegionPrice(
          selectLinodeType,
          selectedRegion
        );
        setSelectedRegionType(selectLinodeType);
        setSelectedRegionPrice(newRegionPrice);
      }
    }, [selectedRegion, selectLinodeType]);

    return { selectedRegionPrice, selectedRegionType };
  }

  const { selectedRegionPrice, selectedRegionType } = useSelectedLinodePrice(
    selectedRegion,
    linodeType || ''
  );
  const currentRegionPrice =
    currentLinodeType && getLinodeRegionPrice(currentLinodeType, currentRegion);

  const currentPrice: MigrationPricingProps = {
    backups: currentLinodeType?.addons.backups.price.monthly,
    hourly: currentRegionPrice?.hourly,
    monthly: currentRegionPrice?.monthly,
    panelType: 'current',
  };
  const newPrice: MigrationPricingProps = {
    backups: selectedRegionType?.addons.backups.price.monthly,
    hourly: selectedRegionPrice?.hourly,
    monthly: selectedRegionPrice?.monthly,
    panelType: 'new',
  };

  // console.log({ newPrice });

  return (
    <StyledPaper>
      <Typography variant="h3">Configure Migration</Typography>
      <StyledMigrationContainer>
        <StyledMigrationBox>
          <StyledSpan>Current Region</StyledSpan>
          <StyledDiv>
            <Flag country={country as Lowercase<Country>} />
            <Typography>{`${getRegionCountryGroup(currentActualRegion)}: ${
              currentActualRegion?.label ?? currentRegion
            }`}</Typography>
          </StyledDiv>
          {shouldDisplayPriceComparison && (
            <MigrationPricing {...currentPrice} />
          )}
        </StyledMigrationBox>

        <StyledMigrationBox>
          <RegionSelect
            regions={
              regions?.filter(
                (eachRegion) => eachRegion.id !== currentRegion
              ) ?? []
            }
            styles={{
              menuList: (base: any) => ({
                ...base,
                maxHeight: `30vh !important`,
              }),
            }}
            textFieldProps={{
              helperText,
            }}
            errorText={errorText}
            handleSelection={handleSelectRegion}
            label="New Region"
            menuPlacement="top"
            selectedID={selectedRegion}
          />
          {shouldDisplayPriceComparison && <MigrationPricing {...newPrice} />}
        </StyledMigrationBox>
      </StyledMigrationContainer>
    </StyledPaper>
  );
});
