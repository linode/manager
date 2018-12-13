import { clamp, compose, map, prop, reverse, slice, sortBy, when } from 'ramda';
import { connect, MapStateToProps } from 'react-redux';
import { withStateHandlers } from 'recompose';
import { Order } from 'src/components/Pagey';


export type PaginatedLinodes = PaginationProps & DataProps;

interface PaginationProps {
  orderBy: 'label';
  order: Order;
  page: number;
  pageSize: number;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleOrderChange: (orderBy: string, order: Order) => void;
}

const withPagination = withStateHandlers(
  {
    orderBy: 'label',
    order: 'asc',
    page: 1,
    pageSize: 25,
  },
  {
    handlePageChange: (state) => (page: number) => ({ ...state, page }),
    handlePageSizeChange: (state) => (pageSize: number) => ({ ...state, pageSize }),
    handleOrderChange: (state) => (orderBy: string, order: Order) => ({ ...state, orderBy, order, }),
  }
);

interface DataProps {
  linodesCount: number;
  linodesData: Linode.Linode[];
  linodesRequestError?: Linode.ApiFieldError[];
  linodesRequestLoading: boolean;
  linodesWithoutBackups: Linode.Linode[];
}

const mapStateToProps: MapStateToProps<DataProps, PaginationProps, ApplicationState> = (state, ownProps) => {
  const { order, orderBy, page, pageSize } = ownProps;
  const { entities, error, loading } = state.__resources.linodes;
  const notifications = state.notifications.data;
  const events = state.events.events
    .filter(e => !e._initial)
    .filter(e => e.entity && e.entity.type === 'linode')
    .filter(e => isWhitelistedAction(e.action))
    .filter(e => isWhitelistedStatus(e.status));


  const x = compose(
    enhanceLinodes(notifications, events),
    createDiplayPage(page, pageSize),
    orderList<Linode.Linode>(order, orderBy),
  )(entities);

  return {
    linodesRequestLoading: loading,
    linodesRequestError: error,
    linodesCount: entities.length,
    linodesData: x,
    linodesWithoutBackups: entities.filter(l => !l.backups.enabled),
  }
};

const orderList: <T>(order: Order, orderBy: keyof T) => (list: T[]) => T[] = (order, orderBy) => (list) => {

  return compose<any, any, any>(
    when(() => order === 'desc', reverse),
    sortBy(prop(orderBy as string)), /** I spent a long, long time trying to type this. */
  )(list);
};


const createDiplayPage: <T extends any>(page: number, pageSize: number) => (list: T[]) => T[] = (page, pageSize) => (list) => {
  const count = list.length;
  if (count === 0) { return list; }

  const pages = Math.ceil(count / pageSize);
  const currentPage = clamp(1, pages, page);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, count - 1);

  return slice(startIndex, endIndex + 1, list);
};


const enhanceLinodes = (notifications: Linode.Notification[] = [], events: Linode.Event[] = []) => (linodes: Linode.Linode[] = []) => compose(
  map<Linode.Linode[], Linode.Linode[]>(
    compose(
      addNotificationToLinode(notifications),
      addEventToLinode(events),
    ),
  )
)(linodes);


const getNotificationMessageByEntityId = (id: number, notifications: Linode.Notification[]): undefined | string => {
  const found = notifications.find((n) => n.entity !== null && n.entity.id === id);
  return found ? found.message : undefined;
}

const addNotificationToLinode = (notifications: Linode.Notification[] = []) => (linode: Linode.Linode) => ({
  ...linode,
  notification: getNotificationMessageByEntityId(linode.id, notifications)
});

const addEventToLinode = (events: Linode.Event[] = []) => (linode: Linode.Linode): Linode.Linode & { recentEvent?: Linode.Event } => {
  const eventsForLinodes = events
    /** The first two checks are redundant based on usage, but TS will complain. */
    .filter(e => e.entity && e.entity.type === 'linode' && e.entity.id === linode.id);

  return ({ ...linode, recentEvent: eventsForLinodes[0] })
}

const isWhitelistedAction = (v: string) => [
  'linode_boot',
  'linode_create', // needed because creating from a backup doesn't auto boot the linode
  'backups_restore',
  'linode_reboot',
  'linode_shutdown',
  'linode_snapshot',
  'linode_rebuild',
  'linode_resize',
  'linode_migrate',
  'linode_clone',
].includes(v);

const isWhitelistedStatus = (v: string) => [
  'started',
  'finished',
  'scheduled',
  'failed',
].includes(v);

export default compose(
  withPagination,
  connect(mapStateToProps),
)
