import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const community: PartialEventMap = {
  community_like: {
    notification: (e) =>
      e.entity?.label ? (
        <>
          A post on <EventMessageLink action={e.action} entity={e.entity} /> has
          been <strong>liked</strong>.
        </>
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
          <EventMessageLink action={e.action} entity={e.entity} />.
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
          <EventMessageLink action={e.action} entity={e.entity} />.
        </>
      ) : (
        <>
          A <strong>reply</strong> has been posted to your question.
        </>
      ),
  },
};
