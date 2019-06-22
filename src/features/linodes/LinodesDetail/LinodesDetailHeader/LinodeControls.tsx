import { last } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LinodeConfigSelectionDrawer from 'src/features/LinodeConfigSelectionDrawer';
import { lishLaunch } from 'src/features/Lish';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import {
  LinodeDetailContext,
  withLinodeDetailContext
} from '../linodeDetailContext';
import LinodePowerControl from '../LinodePowerControl';
import withConfigDrawerState, { ConfigDrawerProps } from './configDrawerState';
import withEditableLabelState, {
  EditableLabelProps
} from './editableLabelState';

type ClassNames = 'controls' | 'launchButton';

const styles = (theme: Theme) =>
  createStyles({
    controls: {
      marginTop: 9 - theme.spacing(1) / 2, // 4
      [theme.breakpoints.down('sm')]: {
        margin: 0,
        display: 'flex',
        flexBasis: '100%'
      }
    },
    launchButton: {
      lineHeight: 1,
      '&:hover': {
        backgroundColor: 'transparent',
        textDecoration: 'underline'
      },
      '&:focus > span:first-child': {
        outline: '1px dotted #999'
      }
    }
  });

type CombinedProps = LinodeDetailContext &
  ConfigDrawerProps &
  EditableLabelProps &
  WithStyles<ClassNames>;

const LinodeControls: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    linode,
    updateLinode,

    configDrawerAction,
    configDrawerError,
    configDrawerOpen,
    configDrawerSelected,
    closeConfigDrawer,
    openConfigDrawer,
    configDrawerSelectConfig,

    editableLabelError,
    resetEditableLabel,
    setEditableLabelError
  } = props;

  const disabled = linode._permissions === 'read_only';

  const submitConfigChoice = () => {
    if (configDrawerSelected && configDrawerAction) {
      configDrawerAction(configDrawerSelected);
      closeConfigDrawer();
    }
  };

  const handleSubmitLabelChange = (label: string) => {
    return updateLinode({ label })
      .then(updatedLinode => {
        resetEditableLabel();
      })
      .catch(err => {
        const errors: Linode.ApiFieldError[] = getAPIErrorOrDefault(
          err,
          'An error occurred while updating label',
          'label'
        );
        const errorStrings: string[] = errors.map(e => e.reason);
        setEditableLabelError(errorStrings[0]);
        scrollErrorIntoView();
        return Promise.reject(errorStrings[0]);
      });
  };

  const getLabelLink = (): string | undefined => {
    return last(location.pathname.split('/')) !== 'summary'
      ? 'summary'
      : undefined;
  };

  return (
    <Grid container justify="space-between" data-qa-linode={linode.label}>
      <Grid item>
        <Breadcrumb
          removeCrumbX={2}
          labelOptions={{ linkTo: getLabelLink() }}
          preserveLastCrumb
          onEditHandlers={
            !disabled
              ? {
                  editableTextTitle: linode.label,
                  onEdit: handleSubmitLabelChange,
                  onCancel: resetEditableLabel,
                  errorText: editableLabelError
                }
              : undefined
          }
        />
      </Grid>
      <Grid item className={classes.controls}>
        <Button
          onClick={() => lishLaunch(linode.id)}
          className={classes.launchButton}
          data-qa-launch-console
          disableFocusRipple={true}
          disableRipple={true}
          disabled={disabled}
        >
          Launch Console
        </Button>
        <LinodePowerControl
          status={linode.status}
          recentEvent={linode.recentEvent}
          id={linode.id}
          label={linode.label}
          noConfigs={linode._configs.length === 0}
          openConfigDrawer={openConfigDrawer}
          disabled={disabled}
        />
      </Grid>
      <LinodeConfigSelectionDrawer
        configs={linode._configs}
        onClose={closeConfigDrawer}
        onSubmit={submitConfigChoice}
        onChange={configDrawerSelectConfig}
        open={configDrawerOpen}
        selected={String(configDrawerSelected)}
        error={configDrawerError}
      />
    </Grid>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  withConfigDrawerState,
  withEditableLabelState,
  withLinodeDetailContext(({ linode, updateLinode }) => ({
    linode,
    updateLinode,
    configs: linode._configs
  })),
  styled
);

export default enhanced(LinodeControls);
