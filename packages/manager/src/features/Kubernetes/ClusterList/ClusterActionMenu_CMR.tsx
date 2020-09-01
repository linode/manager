import { getKubeConfig } from '@linode/api-v4/lib/kubernetes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { RouteComponentProps, withRouter, useHistory } from 'react-router-dom';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import { reportException } from 'src/exceptionReporting';
import { downloadFile } from 'src/utilities/downloadFile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';

const useStyles = makeStyles((theme: Theme) => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  link: {
    padding: '12px 10px',
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#3683dc',
      '& span': {
        color: theme.color.white
      }
    },
    '& span': {
      color: '#3683dc'
    }
  },
  action: {
    marginLeft: 10
  },
  button: {
    ...theme.applyLinkStyles,
    height: '100%',
    minWidth: 'auto',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: '#3683dc',
      color: theme.color.white
    },
    '&[disabled]': {
      color: '#cdd0d5',
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit'
      }
    }
  }
}));

interface Props {
  clusterId: number;
  clusterLabel: string;
  openDialog: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithSnackbarProps;

export const ClusterActionMenu: React.FunctionComponent<CombinedProps> = props => {
  const classes = useStyles();
  const history = useHistory();

  const { clusterId, clusterLabel, enqueueSnackbar, openDialog } = props;

  const createActions = () => {
    return (): Action[] => {
      const actions = [
        {
          title: 'Details',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push({
              pathname: `/kubernetes/clusters/${clusterId}`
            });
            e.preventDefault();
          }
        },
        {
          title: 'Download kubeconfig',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            e.stopPropagation();
            downloadKubeConfig();
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            openDialog();

            e.preventDefault();
          }
        }
      ];

      return actions;
    };
  };

  const downloadKubeConfig = () => {
    getKubeConfig(clusterId)
      .then(response => {
        // Convert to utf-8 from base64
        try {
          const decodedFile = window.atob(response.kubeconfig);
          downloadFile(`${clusterLabel}-kubeconfig.yaml`, decodedFile);
        } catch (e) {
          reportException(e, {
            'Encoded response': response.kubeconfig
          });
          enqueueSnackbar('Error parsing your kubeconfig file', {
            variant: 'error'
          });
          return;
        }
      })
      .catch(errorResponse => {
        const error = getErrorStringOrDefault(
          errorResponse,
          'Unable to download your kubeconfig'
        );
        enqueueSnackbar(error, { variant: 'error' });
      });
  };

  return (
    <div className={classes.inlineActions}>
      <Hidden smDown>
        <Link className={classes.link} to={`/kubernetes/clusters/${clusterId}`}>
          <span>Details</span>
        </Link>
        <Button
          className={classes.button}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            downloadKubeConfig();

            e.preventDefault();
          }}
        >
          Download kubeconfig
        </Button>
        <Button
          className={classes.button}
          onClick={() => {
            openDialog();
          }}
        >
          Delete
        </Button>
      </Hidden>

      <Hidden mdUp>
        <ActionMenu
          createActions={createActions()}
          ariaLabel={`Action menu for Cluster ${props.clusterLabel}`}
        />
      </Hidden>
    </div>
  );
};

const enhanced = compose<CombinedProps, Props>(withSnackbar, withRouter);

export default enhanced(ClusterActionMenu);
