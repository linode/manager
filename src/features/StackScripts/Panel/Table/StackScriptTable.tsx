import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { compose } from 'ramda';
import * as React from 'react';

import TableBody from '@material-ui/core/TableBody';

import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';

import { getCommunityStackscripts, getStackScriptsByUser }
  from '../../SelectStackScriptPanel/stackScriptUtils';

import TableHeader from './TableHeader';
import StackScriptTableRow from './TableRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  type: 'linode' | 'own' | 'community'
}

type CombinedProps = Props
  & PaginationProps<Linode.StackScript.Response>
  & WithStyles<ClassNames>;

class StackScriptTable extends React.Component<CombinedProps, {}> {
  componentDidMount() {
    this.props.request();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.type !== this.props.type) {
      /**
       * handle page change handles the request as well
       * so no need to run this.props.request()
       * Also set loading state back to true
       */
      this.props.handlePageChange(1, true);
    }
  }

  render() {
    const {
      page,
      pageSize,
      count,
      handlePageSizeChange,
      handlePageChange,
      handleOrderChange,
      data: stackScripts,
      loading,
      error,
      order,
      orderBy
    } = this.props;

    return (
      <React.Fragment>
        <Table aria-label="List of StackScripts">
          <TableHeader
            sortOrder={order}
            currentFilter={orderBy}
            handleClick={handleOrderChange}
          />
          <TableBody>
            <StackScriptTableRow
              stackScript={{
                loading,
                error,
                stackScripts
              }}
            />
          </TableBody>
        </Table>
        {!loading &&
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
          />
        }
      </React.Fragment>
    );
  }
}

const whichRequest = (type: 'linode' | 'own' | 'community') => {
  if (type === 'linode') {
    return (params: any, filters: any) => getStackScriptsByUser('linode', params, filters)
  }

  if (type === 'own') {
    return (params: any, filters: any) => getStackScriptsByUser('mmckenna', params, filters)
  }

  else {
    return (params: any, filters: any) => getCommunityStackscripts('mmckenna', params, filters)
  }
}

const updatedRequest = (ownProps: Props, params: any, filters: any) =>
  whichRequest(ownProps.type)(params, filters)
    .then(response => response);

const paginated = Pagey(updatedRequest);

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose(
  paginated,
  styled
)

export default enhanced(StackScriptTable);
