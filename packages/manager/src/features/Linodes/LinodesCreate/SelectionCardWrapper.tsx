import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import Info from 'src/assets/icons/info.svg';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { APP_ROOT } from 'src/constants';

interface Props {
  availableImages: string[];
  checked: boolean;
  clusterLabel: string;
  disabled: boolean;
  handleClick: (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  iconUrl: string;
  id: number;
  label: string;
  labelDecoration?: JSX.Element;
  openDrawer: (stackScriptLabel: string) => void;
  userDefinedFields: UserDefinedField[];
}

export const SelectionCardWrapper = (props: Props) => {
  const theme = useTheme();
  const {
    availableImages,
    checked,
    clusterLabel,
    disabled,
    handleClick,
    iconUrl,
    id,
    label,
    labelDecoration,
    openDrawer,
    userDefinedFields,
  } = props;
  /**
   * '' is the default value for a stackscript's logo_url;
   * display a fallback image in this case, to avoid broken image icons
   */

  const handleSelectApp = () =>
    handleClick(
      id,
      label,
      '' /** username doesn't matter since we're not displaying it */,
      availableImages,
      userDefinedFields
    );

  const handleInfoClick = (e: React.MouseEvent<any>) => {
    e.stopPropagation();
    e.preventDefault();
    openDrawer(clusterLabel ?? label);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      openDrawer(clusterLabel ?? label);
    }
  };

  const renderIcon =
    iconUrl === ''
      ? () => <span className="fl-tux" />
      : () => <img alt={`${label} logo`} src={`${APP_ROOT}/${iconUrl}`} />;

  const renderVariant = () => (
    <InfoGrid xs={2}>
      <Info
        aria-label={`Info for "${label}"`}
        onClick={handleInfoClick}
        onKeyDown={handleKeyPress}
        role="button"
        tabIndex={0}
      />
    </InfoGrid>
  );

  return (
    <SelectionCard
      sxCardBaseIcon={{
        justifyContent: 'flex-start',
        paddingRight: 0,
        width: 40,
      }}
      sxGrid={{
        mixBlendMode: theme.name === 'dark' ? 'initial' : 'darken',
      }}
      checked={checked}
      data-qa-selection-card
      disabled={disabled}
      heading={label}
      headingDecoration={labelDecoration}
      id={`app-${String(id)}`}
      key={id}
      onClick={handleSelectApp}
      renderIcon={renderIcon}
      renderVariant={renderVariant}
      subheadings={['']}
    />
  );
};

const InfoGrid = styled(Grid, {
  label: 'InfoGrid',
})(({ theme }) => ({
  '& svg': {
    height: '19px',
    width: '19px',
  },
  color: theme.palette.primary.main,
  display: 'flex',
  justifyContent: 'flex-end',
  maxWidth: 40,
  padding: theme.spacing(1),
  paddingLeft: 0,
}));
