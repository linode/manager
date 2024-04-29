import { IconButton } from '@mui/material';
import { decode } from 'he';
import * as React from 'react';

import Info from 'src/assets/icons/info.svg';
import { Chip } from 'src/components/Chip';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { APP_ROOT } from 'src/constants';

interface Props {
  checked: boolean;
  iconUrl: string;
  id: number;
  label: string;
  onOpenDetailsDrawer: () => void;
  onSelect: () => void;
}

export const AppSelectionCard = (props: Props) => {
  const { checked, iconUrl, id, label, onOpenDetailsDrawer, onSelect } = props;

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

  const renderIcon =
    iconUrl === ''
      ? () => <span className="fl-tux" />
      : () => <img alt={`${label} logo`} src={`${APP_ROOT}/${iconUrl}`} />;

  const renderVariant = () => (
    <IconButton
      aria-label={`Info for "${label}"`}
      onClick={handleInfoClick}
      onKeyDown={handleKeyPress}
    >
      <Info />
    </IconButton>
  );

  const headingDecoration = label.includes('Cluster') ? (
    <Chip label="CLUSTER" size="small" />
  ) : undefined;

  const displayLabel = decode(
    label
      .replace('Null One-Click', '')
      .replace('One-Click', '')
      .replace('Cluster', '')
  );

  return (
    <SelectionCard
      sxCardBaseIcon={{
        minWidth: 50,
      }}
      checked={checked}
      heading={displayLabel}
      headingDecoration={headingDecoration}
      id={`app-${String(id)}`}
      key={id}
      onClick={onSelect}
      renderIcon={renderIcon}
      renderVariant={renderVariant}
      subheadings={['']}
    />
  );
};
