import { LinodeType } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import { makeStyles } from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import ViewAllLink from 'src/components/ViewAllLink';
import withLinodes, { StateProps } from 'src/containers/withLinodes.container';
import LinodeRowHeadCell from 'src/features/linodes/LinodesLanding/LinodeRow/LinodeRowHeadCell';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { ApplicationState } from 'src/store';
import { ShallowExtendedLinode } from 'src/store/linodes/types';
import formatDate from 'src/utilities/formatDate';
import DashboardCard from '../DashboardCard';

const useStyles = makeStyles(() => ({
  root: {
    marginTop: 0
  },
  linodeWrapper: {
    display: 'inline-flex',
    width: 'auto'
  },
  labelCol: {
    width: '60%'
  },
  moreCol: {
    width: '20%'
  },
  actionsCol: {
    width: '10%'
  },
  wrapHeader: {
    whiteSpace: 'nowrap'
  }
}));

interface ConnectedProps {
  types: LinodeType[];
}

type CombinedProps = ConnectedProps & WithTypesProps & StateProps;

const LinodesDashboardCard: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { _loading } = useReduxLoad(['linodes', 'images']);

  const renderAction = () => {
    return props.linodesData.length > 5 ? (
      <ViewAllLink
        text="View All"
        link={'/linodes'}
        count={props.linodesData.length}
      />
    ) : null;
  };

  const renderContent = () => {
    const { linodesLoading, linodesError, linodesData } = props;
    if (linodesLoading || _loading) {
      return renderLoading();
    }

    if (linodesError) {
      return renderErrors(linodesError);
    }

    if (linodesData.length > 0) {
      return renderData(linodesData);
    }

    return renderEmpty();
  };

  const renderLoading = () => {
    return <TableRowLoading colSpan={3} />;
  };

  const renderErrors = (errors: APIError[]) => {
    let errorText: string | JSX.Element = pathOr(
      'Unable to load Linodes.',
      [0, 'reason'],
      errors
    );

    if (
      typeof errorText === 'string' &&
      errorText.toLowerCase() === 'this linode has been suspended'
    ) {
      errorText = (
        <React.Fragment>
          One or more of your Linodes is suspended. Please{' '}
          <Link to="/support/tickets">open a support ticket </Link>
          if you have questions.
        </React.Fragment>
      );
    }

    return <TableRowError colSpan={3} message={errorText} />;
  };

  const renderEmpty = () => <TableRowEmptyState colSpan={3} />;

  const renderData = (data: ShallowExtendedLinode[]) => {
    return data.map(linode => {
      const { id, label, region } = linode;
      return (
        <TableRow
          key={label}
          ariaLabel={`Linode ${label}`}
          rowLink={`/linodes/${id}`}
          data-qa-linode
        >
          <LinodeRowHeadCell
            loading={false}
            recentEvent={linode._recentEvent}
            backups={linode.backups}
            id={linode.id}
            ipv4={linode.ipv4}
            ipv6={linode.ipv6 || ''}
            label={linode.label}
            region={linode.region}
            status={linode.status}
            displayStatus={linode._displayStatus || ''}
            tags={linode.tags}
            mostRecentBackup={linode.backups.last_successful}
            disk={linode.specs.disk}
            vcpus={linode.specs.vcpus}
            memory={linode.specs.memory}
            type={linode.type}
            image={linode.image}
            width={75}
            maintenance={
              linode._maintenance?.when
                ? formatDate(linode._maintenance.when)
                : ''
            }
            isDashboard
          />
          <Hidden xsDown>
            <TableCell className={classes.moreCol} data-qa-linode-region>
              <RegionIndicator region={region} />
            </TableCell>
          </Hidden>
        </TableRow>
      );
    });
  };

  return (
    <DashboardCard
      title="Linodes"
      headerAction={renderAction}
      className={classes.root}
      alignHeader="flex-start"
    >
      <Paper>
        <Table>
          <TableBody>{renderContent()}</TableBody>
        </Table>
      </Paper>
    </DashboardCard>
  );
};

interface WithTypesProps {
  typesData: LinodeType[];
}

const withTypes = connect((state: ApplicationState) => ({
  typesData: state.__resources.types.entities
}));

const enhanced = recompose<CombinedProps, {}>(withLinodes(), withTypes);

export default enhanced(LinodesDashboardCard) as React.ComponentType<{}>;
