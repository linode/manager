import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import Info from 'src/assets/icons/info.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import SelectionCard from 'src/components/SelectionCard';
import { APP_ROOT } from 'src/constants';

const useStyles = makeStyles((theme: Theme) => ({
  flatImagePanelSelections: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
    padding: `${theme.spacing(1)}px 0`,
  },
  selectionCard: {
    mixBlendMode: theme.name === 'darkTheme' ? 'initial' : 'darken',
    '& .cardBaseIcon': {
      width: 40,
      paddingRight: 0,
      justifyContent: 'flex-start',
    },
  },
  info: {
    display: 'flex',
    justifyContent: 'flex-end',
    color: theme.palette.primary.main,
    paddingLeft: 0,
    maxWidth: 40,
    '& svg': {
      width: 19,
      height: 19,
    },
  },
}));

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
  userDefinedFields: UserDefinedField[];
  availableImages: string[];
  disabled: boolean;
  checked: boolean;
}

export const SelectionCardWrapper: React.FC<Props> = (props) => {
  const {
    iconUrl,
    id,
    checked,
    label,
    userDefinedFields,
    availableImages,
    disabled,
    handleClick,
    openDrawer,
  } = props;
  /**
   * '' is the default value for a stackscript's logo_url;
   * display a fallback image in this case, to avoid broken image icons
   */
  const classes = useStyles();

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
    openDrawer(label);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      openDrawer(label);
    }
  };

  const renderIcon =
    iconUrl === ''
      ? () => <span className="fl-tux" />
      : () => <img src={`${APP_ROOT}/${iconUrl}`} alt={`${label} logo`} />;

  const renderVariant = () => (
    <Grid item className={classes.info} xs={2}>
      <Info
        role="button"
        aria-label={`Info for "${label}"`}
        onClick={handleInfoClick}
        onKeyDown={handleKeyPress}
        tabIndex={0}
      />
    </Grid>
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
      className={classes.selectionCard}
    />
  );
};

export default SelectionCardWrapper;
