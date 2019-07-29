import * as moment from 'moment';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { ExtendedEvent } from 'src/store/events/event.helpers';
import createLinkHandlerForNotification from 'src/utilities/getEventsActionLinkStrings';
import UserEventsListItem, {
  Props as UserEventsListItemProps
} from './UserEventsListItem';

interface Props {
  events?: Linode.Event[];
  closeMenu: (e: any) => void;
}

type CombinedProps = Props & RouteComponentProps<void>;

export const UserEventsList: React.StatelessComponent<
  CombinedProps
> = props => {
  const { events, closeMenu } = props;

  return (
    <React.Fragment>
      {(events as ExtendedEvent[])
        .reduce((result, event): UserEventsListItemProps[] => {
          const title = eventMessageGenerator(event);
          let content = `${moment(`${event.created}Z`).fromNow()}`;

          if (event.username) {
            content += ` by ${event.username}`;
          }

          const success = event.status !== 'failed' && !event.seen;
          const error = event.status === 'failed';
          const failedImage =
            event.action === 'disk_imagize' && event.status === 'failed';

          const helperText = failedImage
            ? 'This likely happened because your disk content was larger than the 2048 MB limit, or you attempted to imagize a raw or custom formatted disk.'
            : '';

          const _linkPath = createLinkHandlerForNotification(
            event.action,
            event.entity,
            event._deleted
          );

          /**
           * Events without a link path either refer to a deleted
           * entity or else don't have an entity/anywhere to point.
           */
          const onClick = _linkPath
            ? /**
               * @todo hack alert: This is a temporary fix for a regression where community posts/likes,
               * which are the only events that have an external link target, were not linking correctly.
               * The root of the problem is that getEventsActionLinkStrings assumes that all events will
               * link to a path within the Manager, and so is used to pass a url string to <Link to= .../>
               */
              _linkPath.match(/community/i)
              ? (e: any) => {
                  window.open(_linkPath, '_blank');
                  closeMenu(e);
                }
              : (e: any) => {
                  closeMenu(e);
                }
            : undefined;

          const linkPath =
            _linkPath && _linkPath.match(/community/i)
              ? props.location.pathname
              : _linkPath;

          return title
            ? [
                ...result,
                {
                  title,
                  content,
                  success,
                  error,
                  onClick,
                  linkPath,
                  helperText
                }
              ]
            : result;
        }, [])
        .map((reducedProps: UserEventsListItemProps, key: number) => (
          <UserEventsListItem key={key} {...reducedProps} />
        ))}
    </React.Fragment>
  );
};

UserEventsList.defaultProps = {
  events: []
};

const enhanced = compose<CombinedProps, Props>(withRouter);

export default enhanced(UserEventsList);
