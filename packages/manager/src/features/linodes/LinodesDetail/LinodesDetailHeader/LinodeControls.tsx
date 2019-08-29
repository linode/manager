import { last } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb, { BreadcrumbProps } from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { lishLaunch } from 'src/features/Lish';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import {
  LinodeDetailContext,
  withLinodeDetailContext
} from '../linodeDetailContext';
import LinodePowerControl from '../LinodePowerControl';
import withEditableLabelState, {
  EditableLabelProps
} from './editableLabelState';

type ClassNames = 'breadCrumbs' | 'controls' | 'launchButton';

const styles = (theme: Theme) =>
  createStyles({
    breadCrumbs: {
      position: 'relative',
      top: -2,
      [theme.breakpoints.down('sm')]: {
        top: 10
      }
    },
    controls: {
      position: 'relative',
      marginTop: 9 - theme.spacing(1) / 2, // 4
      [theme.breakpoints.down('sm')]: {
        margin: 0,
        left: -8,
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

interface Props {
  breadcrumbProps?: Partial<BreadcrumbProps>;
}

type CombinedProps = Props &
  LinodeDetailContext &
  EditableLabelProps &
  RouteComponentProps<{}> &
  WithStyles<ClassNames>;

const LinodeControls: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    linode,
    updateLinode,
    editableLabelError,
    resetEditableLabel,
    setEditableLabelError,

    breadcrumbProps
  } = props;

  const disabled = linode._permissions === 'read_only';

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
    <Grid
      container
      justify="space-between"
      alignItems="flex-end"
      data-qa-linode={linode.label}
    >
      <Grid item>
        <Breadcrumb
          pathname={props.location.pathname}
          removeCrumbX={2}
          labelOptions={{ linkTo: getLabelLink() }}
          className={classes.breadCrumbs}
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
          /* Override with any custom breadcrumb props that may have been passed in */
          {...breadcrumbProps}
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
          linodeEvents={linode._events}
          id={linode.id}
          label={linode.label}
          disabled={disabled}
          linodeConfigs={linode._configs}
        />
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  withEditableLabelState,
  withRouter,
  withLinodeDetailContext(({ linode, updateLinode }) => ({
    linode,
    updateLinode,
    configs: linode._configs
  })),
  styled
);

export default enhanced(LinodeControls);
