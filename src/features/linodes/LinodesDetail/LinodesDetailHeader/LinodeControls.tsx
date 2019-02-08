import { last, pathOr } from 'ramda';
import * as React from 'react';
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
import linodeDetailContext from '../context';
import LinodePowerControl from '../LinodePowerControl';

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

type CombinedProps = WithStyles<ClassNames>;

interface ConfigDrawerState {
  open: boolean;
  configs: Linode.Config[];
  error?: string;
  selected?: number;
  action?: (id: number) => void;
}

interface EditableLabelState {
  label: string;
  errorText: string;
}

const Thingy: React.StatelessComponent<CombinedProps> = props => {
  const { classes } = props;
  const { linode, updateLinode } = React.useContext(linodeDetailContext);

  const [configDrawerState, setConfigDrawerState] = React.useState<
    ConfigDrawerState
  >({
    action: (id: number) => null,
    configs: [],
    error: undefined,
    open: false,
    selected: undefined
  });

  /** Config Drawer Handlers */
  const openConfigDrawer = (
    configs: Linode.Config[],
    action: (id: number) => void
  ) => {
    setConfigDrawerState({
      action,
      configs,
      open: true,
      selected: configs[0].id
    });
  };

  const closeConfigDrawer = () => {
    setConfigDrawerState({
      action: (id: number) => null,
      configs: [],
      error: undefined,
      open: false,
      selected: undefined
    });
  };

  const selectConfig = (id: number) => {
    setConfigDrawerState(prevState => ({
      ...configDrawerState,
      selected: id
    }));
  };

  const submitConfigChoice = () => {
    const { action, selected } = configDrawerState;
    if (selected && action) {
      action(selected);
      closeConfigDrawer();
    }
  };

  /** Editable Label */
  const [editableTextState, setEditableTextState] = React.useState<
    EditableLabelState
  >({
    label: '',
    errorText: ''
  });

  const handleSubmitLabelChange = (label: string) => {
    return updateLinode({ label })
      .then(updatedLinode => {
        setEditableTextState({
          label: updatedLinode.label,
          errorText: ''
        });
      })
      .catch(err => {
        const errors: Linode.ApiFieldError[] = pathOr(
          [],
          ['response', 'data', 'errors'],
          err
        );
        const errorStrings: string[] = errors.map(e => e.reason);
        setEditableTextState({
          label: linode.label,
          errorText: errorStrings[0]
        });
        scrollErrorIntoView();
        return Promise.reject(errorStrings[0]);
      });
  };

  const resetLabelState = () => {
    setEditableTextState({
      ...editableTextState,
      label: linode.label,
      errorText: ''
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
            onCancel: resetLabelState,
            errorText: editableTextState.errorText
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
        onClose={closeConfigDrawer}
        onSubmit={submitConfigChoice}
        onChange={selectConfig}
        open={configDrawerState.open}
        configs={configDrawerState.configs}
        selected={String(configDrawerState.selected)}
        error={configDrawerState.error}
      />
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(Thingy);
