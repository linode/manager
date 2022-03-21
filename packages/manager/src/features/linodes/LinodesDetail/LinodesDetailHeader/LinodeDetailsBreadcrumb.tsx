import { APIError } from '@linode/api-v4/lib/types';
import { last } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb, { BreadcrumbProps } from 'src/components/Breadcrumb';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocsLink from 'src/components/DocsLink';
import Grid from 'src/components/Grid';
import useEditableLabelState from 'src/hooks/useEditableLabelState';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import {
  LinodeDetailContext,
  withLinodeDetailContext,
} from '../linodeDetailContext';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    textDecoration: 'none',
    [theme.breakpoints.down('sm')]: {
      paddingRight: `${theme.spacing()}px !important`,
    },
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(),
    },
  },
}));

interface Props {
  breadcrumbProps?: Partial<BreadcrumbProps>;
}

type CombinedProps = Props & LinodeDetailContext & RouteComponentProps<{}>;

const LinodeControls: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { linode, updateLinode, breadcrumbProps } = props;

  const {
    editableLabelError,
    setEditableLabelError,
    resetEditableLabel,
  } = useEditableLabelState();

  const disabled = linode._permissions === 'read_only';

  const handleSubmitLabelChange = (label: string) => {
    return updateLinode({ label })
      .then(() => {
        resetEditableLabel();
      })
      .catch((err) => {
        const errors: APIError[] = getAPIErrorOrDefault(
          err,
          'An error occurred while updating label',
          'label'
        );
        const errorStrings: string[] = errors.map((e) => e.reason);
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
      className={`${classes.root} m0`}
      container
      justifyContent="space-between"
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
                  errorText: editableLabelError,
                }
              : undefined
          }
          /* Override with any custom breadcrumb props that may have been passed in */
          {...breadcrumbProps}
        />
      </Grid>
      <Grid item className="px0" style={{ marginTop: 4 }}>
        <DocsLink
          href="https://www.linode.com/docs/platform/billing-and-support/linode-beginners-guide/"
          analyticsLabel="Linode Detail"
        />
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withRouter,
  withLinodeDetailContext(({ linode, updateLinode }) => ({
    linode,
    updateLinode,
    configs: linode._configs,
  }))
);

export default enhanced(LinodeControls);
