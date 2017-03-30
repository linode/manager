import React, { PropTypes } from 'react';
import moment from 'moment';

import { Card, CardImageHeader } from '~/components/cards';

function paragraphs(text) {
  const ps = text.split('\n');

  if (ps.length === 1) {
    return text;
  }

  const elements = [];
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];

    if (p === '') {
      elements.push(<br key={i} />);
    } else if (p.indexOf('    ') === 0) {
      /* TODO: more precise code formatting.
      const afterToEnd = _.slice(ps, i);
      const lastPreLine = _.findIndex(afterToEnd, p => p.indexOf('    ') !== 0);
      const safeLastPreLine = lastPreLine === -1 ? afterToEnd.length : lastPreLine;
      const preLines = _.slice(afterToEnd, 0, safeLastPreLine);
      const pre = preLines.join('\n');
      elements.push(<pre key={i}>{pre}</pre>);

      // Skip past rest of pre chunk
      i += safeLastPreLine;
      */

      return <pre>{text}</pre>;
    } else {
      elements.push(<p key={i}>{p}</p>);
    }
  }

  return (
    <span>{elements}</span>
  );
}

export default function TicketReply(props) {
  const createdBy = props.reply[`${props.createdField}_by`];
  const created = moment.utc(props.reply[props.createdField]).fromNow();
  const header = <CardImageHeader title={createdBy} subtitle={created} />;

  const description = paragraphs(props.reply.description);

  return (
    <Card header={header} className="TicketReply">
      {description}
    </Card>
  );
}
