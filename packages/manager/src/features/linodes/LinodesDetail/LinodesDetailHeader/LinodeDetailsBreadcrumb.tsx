import { APIError } from '@linode/api-v4/lib/types';
import { last } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb, { BreadcrumbProps } from 'src/components/Breadcrumb';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
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

type ClassNames = 'breadcrumb' | 'controls' | 'launchButton' | 'docs';

const styles = (theme: Theme) =>
  createStyles({
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
    },
    docs: {
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
        flexBasis: '100%',
        justifyContent: 'flex-end',
        '&.MuiGrid-item': {
          paddingTop: 0
        }
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

const LinodeControls: React.FC<CombinedProps> = props => {
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
      container
      className="m0"
      alignItems="center"
      justify="space-between"
      data-qa-linode={linode.label}
    >
      <Grid item className="px0">
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
      <Grid item className={`px0 ${classes.docs}`}>
        <DocumentationButton href="https://www.linode.com/docs/platform/billing-and-support/linode-beginners-guide/" />
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
