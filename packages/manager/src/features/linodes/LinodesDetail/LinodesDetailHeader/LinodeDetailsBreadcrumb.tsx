import { APIError } from '@linode/api-v4/lib/types';
import * as classnames from 'classnames';
import { last } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb, { BreadcrumbProps } from 'src/components/Breadcrumb';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import {
  LinodeDetailContext,
  withLinodeDetailContext
} from '../linodeDetailContext';
import withEditableLabelState, {
  EditableLabelProps
} from './editableLabelState';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    textDecoration: 'none',
    [theme.breakpoints.down('sm')]: {
      paddingRight: `${theme.spacing()}px !important`
    },
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing()
    }
  },
  error: {
    [theme.breakpoints.down('xs')]: {
      paddingBottom: 20
    },
    // The docs button will wrap when the label is editing mode so do not add
    // padding when it wraps
    [theme.breakpoints.down(395)]: {
      paddingBottom: 0
    }
  },
  errorLong: {
    [theme.breakpoints.down(480)]: {
      paddingBottom: 40
    },
    // The docs button will wrap when the label is editing mode so do not add
    // padding when it wraps
    [theme.breakpoints.down(395)]: {
      paddingBottom: 0
    }
  }
}));

interface Props {
  breadcrumbProps?: Partial<BreadcrumbProps>;
}

type CombinedProps = Props &
  LinodeDetailContext &
  EditableLabelProps &
  RouteComponentProps<{}>;

const LinodeControls: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
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
        const errors: APIError[] = getAPIErrorOrDefault(
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
      ? `${linode.id}/summary`
      : undefined;
  };
  return (
    <Grid
      className={classnames({
        [classes.root]: true,
        [classes.error]: Boolean(editableLabelError),
        [classes.errorLong]: Boolean(editableLabelError.length > 60),
        m0: true
      })}
      container
      alignItems="center"
      justify="space-between"
      data-qa-linode={linode.label}
    >
      <Grid item className="p0">
        <Breadcrumb
          pathname={props.location.pathname}
          firstAndLastOnly
          labelOptions={{ linkTo: getLabelLink() }}
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
      <Grid item className="px0">
        <DocumentationButton href="https://www.linode.com/docs/platform/billing-and-support/linode-beginners-guide/" />
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withEditableLabelState,
  withRouter,
  withLinodeDetailContext(({ linode, updateLinode }) => ({
    linode,
    updateLinode,
    configs: linode._configs
  }))
);

export default enhanced(LinodeControls);
