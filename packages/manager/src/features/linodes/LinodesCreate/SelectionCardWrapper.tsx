import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import Info from 'src/assets/icons/info.svg';
import { styled, useTheme } from '@mui/material/styles';
import Grid from 'src/components/Grid';
import SelectionCard from 'src/components/SelectionCard';
import { APP_ROOT } from 'src/constants';

interface Props {
  handleClick: (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  openDrawer: (stackScriptLabel: string) => void;
  iconUrl: string;
  id: number;
  label: string;
  clusterLabel: string;
  userDefinedFields: UserDefinedField[];
  availableImages: string[];
  disabled: boolean;
  checked: boolean;
  labelDecoration?: JSX.Element;
}

const InfoGrid = styled(Grid, {
  label: 'InfoGrid',
})(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  color: theme.palette.primary.main,
  padding: theme.spacing(1),
  paddingLeft: 0,
  maxWidth: 40,
  '& svg': {
    width: '19px',
    height: '19px',
  },
}));

export const SelectionCardWrapper: React.FC<Props> = (props) => {
  const theme = useTheme();
  const {
    iconUrl,
    id,
    checked,
    label,
    clusterLabel,
    userDefinedFields,
    availableImages,
    disabled,
    handleClick,
    openDrawer,
    labelDecoration,
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
      : () => <img src={`${APP_ROOT}/${iconUrl}`} alt={`${label} logo`} />;

  const renderVariant = () => (
    <InfoGrid xs={2}>
      <Info
        role="button"
        aria-label={`Info for "${label}"`}
        onClick={handleInfoClick}
        onKeyDown={handleKeyPress}
        tabIndex={0}
      />
    </InfoGrid>
  );

  return (
    <SelectionCard
      id={`app-${String(id)}`}
      key={id}
      checked={checked}
      onClick={handleSelectApp}
      renderIcon={renderIcon}
      renderVariant={renderVariant}
      heading={label}
      subheadings={['']}
      data-qa-selection-card
      disabled={disabled}
      sxGrid={{
        mixBlendMode: theme.name === 'dark' ? 'initial' : 'darken',
      }}
      headingDecoration={labelDecoration}
      sxCardBaseIcon={{
        justifyContent: 'flex-start',
        paddingRight: 0,
        width: 40,
      }}
    />
  );
};

export default SelectionCardWrapper;
