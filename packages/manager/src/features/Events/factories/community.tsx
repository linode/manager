import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const community: PartialEventMap<'community'> = {
  community_like: {
    notification: (e) =>
      e.entity?.label ? (
        <EventLink event={e} to="entity" />
      ) : (
        <>
          There has been a <strong>like</strong> on your community post.
        </>
      ),
  },
  community_mention: {
    notification: (e) =>
      e.entity?.label ? (
        <>
          You have been <strong>mentioned</strong> in a post on{' '}
          <EventLink event={e} to="entity" />.
        </>
      ) : (
        <>
          You have been <strong>mentioned</strong> in a community post.
        </>
      ),
  },
  community_question_reply: {
    notification: (e) =>
      e.entity?.label ? (
        <>
          A <strong>reply</strong> has been posted to your question on{' '}
          <EventLink event={e} to="entity" />.
        </>
      ) : (
        <>
          A <strong>reply</strong> has been posted to your question.
        </>
      ),
  },
};
