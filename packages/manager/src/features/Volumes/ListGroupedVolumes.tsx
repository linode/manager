import { Volume } from '@linode/api-v4/lib/volumes';
import { compose } from 'ramda';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import Paginate from 'src/components/Paginate';
import PaginationFooter, {
  MIN_PAGE_SIZE,
} from 'src/components/PaginationFooter';
import TableRow from 'src/components/TableRow';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { groupByTags, sortGroups } from 'src/utilities/groupByTags';
import RenderVolumeData, { RenderVolumeDataProps } from './RenderVolumeData';
import { ExtendedVolume } from './types';
import TableWrapper from './VolumeTableWrapper';

type ClassNames =
  | 'root'
  | 'tagGridRow'
  | 'tagHeaderRow'
  | 'tagHeader'
  | 'tagHeaderOuter'
  | 'paginationCell'
  | 'groupContainer';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    tagGridRow: {
      marginBottom: 20,
    },
    tagHeaderRow: {
      backgroundColor: theme.bg.main,
      height: 'auto',
      '& td': {
        // This is maintaining the spacing between groups because of how tables handle margin/padding. Adjust with care!
        padding: '20px 0 10px',
        borderBottom: 'none',
      },
    },
    groupContainer: {
      [theme.breakpoints.up('md')]: {
        '& $tagHeaderRow > td': {
          padding: '10px 0',
        },
      },
    },
    tagHeader: {
      marginBottom: 2,
    },
    tagHeaderOuter: {},
    paginationCell: {
      paddingTop: 2,
      '& div:first-child': {
        marginTop: 0,
      },
    },
  });
interface Props {
  data: ExtendedVolume[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
  renderProps: RenderVolumeDataProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ListGroupedVolumes: React.FC<CombinedProps> = (props) => {
  const {
    data,
    order,
    handleOrderChange,
    orderBy,
    classes,
    renderProps,
  } = props;

  const groupedVolumes = compose(sortGroups, groupByTags)(data);
  const tableWrapperProps = {
    handleOrderChange,
    order,
    orderBy,
    isVolumesLanding: renderProps.isVolumesLanding,
    dataLength: data.length,
  };

  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();

  return (
    <TableWrapper {...tableWrapperProps}>
      {groupedVolumes.map(([tag, volumes]: [string, Volume[]]) => {
        return (
          <React.Fragment key={tag}>
            <Paginate
              data={volumes}
              pageSize={infinitePageSize}
              pageSizeSetter={setInfinitePageSize}
            >
              {({
                data: paginatedData,
                handlePageChange,
                handlePageSizeChange,
                page,
                pageSize,
                count,
              }) => {
                return (
                  <TableBody
                    className={classes.groupContainer}
                    data-qa-tag-header={tag}
                  >
                    <TableRow className={classes.tagHeaderRow}>
                      <TableCell colSpan={7}>
                        <Typography
                          variant="h2"
                          component="h3"
                          className={classes.tagHeader}
                        >
                          {tag}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <RenderVolumeData data={paginatedData} {...renderProps} />
                    {count > MIN_PAGE_SIZE && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className={classes.paginationCell}
                        >
                          <PaginationFooter
                            count={count}
                            handlePageChange={handlePageChange}
                            handleSizeChange={handlePageSizeChange}
                            pageSize={pageSize}
                            page={page}
                            eventCategory={'volumes landing'}
                            showAll
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                );
              }}
            </Paginate>
          </React.Fragment>
        );
      })}
    </TableWrapper>
  );
};

const styled = withStyles(styles);

export default styled(ListGroupedVolumes);
