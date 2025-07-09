import { Chip, InfoOutlinedIcon, SvgIcon } from '@linode/ui';
import { IconButton } from '@mui/material';
import * as React from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';

import { getMarketplaceAppLabel } from './utilities';

interface Props {
  /**
   * Whether or not the app is selected
   */
  checked: boolean;
  /**
   * The path to the app icon
   * @example "/assets/postgresqlmarketplaceocc.svg"
   */
  iconUrl: string;
  /**
   * The label of the app
   */
  label: string;
  /**
   * A function called when the "info" icon button is pressed
   */
  onOpenDetailsDrawer: () => void;
  /**
   * A function called when the card is clicked
   */
  onSelect: () => void;
}

export const AppSelectionCard = (props: Props) => {
  const { checked, iconUrl, label, onOpenDetailsDrawer, onSelect } = props;

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onOpenDetailsDrawer();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.key === 'Enter' || e.key === ' ') {
      onOpenDetailsDrawer();
    }
  };

  const displayLabel = getMarketplaceAppLabel(label);

  const renderIcon =
    iconUrl === ''
      ? () => <span className="fl-tux" />
      : () => <img alt={`${label} logo`} src={iconUrl} />;

  const renderVariant = () => (
    <IconButton
      aria-label={`Info for "${displayLabel}"`}
      data-qa-selection-card-info={displayLabel}
      onClick={handleInfoClick}
      onKeyDown={handleKeyPress}
    >
      <SvgIcon
        component={InfoOutlinedIcon}
        data-testid="tooltip-info-icon"
        viewBox="0 0 20 20"
      />
    </IconButton>
  );

  const headingDecoration = label.includes('Cluster') ? (
    <Chip label="CLUSTER" size="small" />
  ) : undefined;

  return (
    <SelectionCard
      checked={checked}
      heading={displayLabel}
      headingDecoration={headingDecoration}
      onClick={onSelect}
      renderIcon={renderIcon}
      renderVariant={renderVariant}
      subheadings={['']}
      sxCardBaseIcon={{
        minWidth: 50,
      }}
    />
  );
};
