import { last, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LinodeConfigSelectionDrawer from 'src/features/LinodeConfigSelectionDrawer';
import { lishLaunch } from 'src/features/Lish';
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

type ClassNames = 'titleWrapper' | 'controls' | 'launchButton';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 5
  },
  controls: {
    marginTop: theme.spacing.unit,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      display: 'flex',
      flexBasis: '100%'
    }
  },
  launchButton: {
    padding: '12px 28px 14px 0',
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

const Thingy: React.StatelessComponent<CombinedProps> = props => {
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
        const errors: Linode.ApiFieldError[] = pathOr(
          [],
          ['response', 'data', 'errors'],
          err
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
    <Grid container justify="space-between">
      <Grid item className={classes.titleWrapper}>
        <Breadcrumb
          linkTo="/linodes"
          linkText="Linodes"
          labelTitle={linode.label}
          labelOptions={{ linkTo: getLabelLink() }}
          onEditHandlers={{
            onEdit: handleSubmitLabelChange,
            onCancel: resetEditableLabel,
            errorText: editableLabelError
          }}
        />
      </Grid>
      <Grid item className={classes.controls}>
        <Button
          onClick={() => lishLaunch(linode.id)}
          className={classes.launchButton}
          data-qa-launch-console
          disableFocusRipple={true}
          disableRipple={true}
        >
          Launch Console
        </Button>
        <LinodePowerControl
          status={linode.status}
          recentEvent={linode.recentEvent}
          id={linode.id}
          label={linode.label}
          openConfigDrawer={openConfigDrawer}
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
  styled,
  withConfigDrawerState,
  withEditableLabelState,
  withLinodeDetailContext(({ linode, updateLinode }) => ({
    linode,
    updateLinode
  }))
);

export default enhanced(Thingy);
