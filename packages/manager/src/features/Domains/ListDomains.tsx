import { Domain } from 'linode-js-sdk/lib/domains';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import DomainTableRow from 'src/features/Domains/DomainTableRow';
import { Handlers } from './DomainActionMenu';

type ClassNames = 'root' | 'label';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    label: {
      paddingLeft: theme.spacing(3) + 41
    }
  });

interface Props extends Handlers {
  data: Domain[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ListDomains: React.StatelessComponent<CombinedProps> = props => {
  const { data, orderBy, order, handleOrderChange, classes } = props;
  return (
    <Paginate data={data} pageSize={25}>
      {({
        data: paginatedData,
        count,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize
      }) => (
        <React.Fragment>
          <Paper>
            <Table removeLabelonMobile aria-label="List of your Domains">
              <TableHead>
                <TableRow>
                  <TableSortCell
                    active={orderBy === 'domain'}
                    label="domain"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-domain-name-header={order}
                    className={classes.label}
                  >
                    Domain
                  </TableSortCell>
                  <TableSortCell
                    data-qa-domain-type-header={order}
                    active={orderBy === 'type'}
                    label="type"
                    direction={order}
                    handleClick={handleOrderChange}
                  >
                    Type
                  </TableSortCell>
                  <TableSortCell
                    data-qa-domain-type-header={order}
                    active={orderBy === 'status'}
                    label="status"
                    direction={order}
                    handleClick={handleOrderChange}
                  >
                    Status
                  </TableSortCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <RenderData
                  data={paginatedData}
                  onCheck={props.onCheck}
                  onClone={props.onClone}
                  onEdit={props.onEdit}
                  onRemove={props.onRemove}
                  onDisableOrEnable={props.onDisableOrEnable}
                />
              </TableBody>
            </Table>
          </Paper>
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
            eventCategory="domains landing"
          />
        </React.Fragment>
      )}
    </Paginate>
  );
};

interface RenderDataProps extends Handlers {
  data: Domain[];
}

const RenderData: React.StatelessComponent<RenderDataProps> = props => {
  const { data, onCheck, onClone, onEdit, onRemove, onDisableOrEnable } = props;

  return (
    <>
      {data.map(domain => (
        <DomainTableRow
          domain={domain.domain}
          id={domain.id}
          key={domain.domain}
          onClone={onClone}
          onEdit={onEdit}
          onRemove={onRemove}
          type={domain.type}
          status={domain.status}
          onDisableOrEnable={onDisableOrEnable}
          onCheck={onCheck}
        />
      ))}
    </>
  );
};

const styled = withStyles(styles);

export default styled(ListDomains);
