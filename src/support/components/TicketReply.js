import React, { PropTypes } from 'react';
import moment from 'moment';

import { Card, CardImageHeader } from 'linode-components/cards';

export function getLineBreakCharacter(text) {
  // Check the longer one first because it contains the second one.
  const lineBreakCharacters = ['\r\n', '\n'];
  for (let i = 0; i < lineBreakCharacters.length; i++) {
    const lineBreakCharacter = lineBreakCharacters[i];
    if (text.indexOf(lineBreakCharacter) !== -1) {
      return lineBreakCharacter;
    }
  }

  return null;
}

export function stringToParagraphs(text) {
  const lineBreakCharacter = getLineBreakCharacter(text);
  const ps = text.split(lineBreakCharacter + lineBreakCharacter);

  if (!lineBreakCharacter) {
    return text;
  }

  const elements = [];
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];

    if (p === '') {
      elements.push(<br key={i} />);
    } else if (p.indexOf('    ') !== -1) {
      return <pre>{text}</pre>;
    } else {
      const linesInP = p.split(lineBreakCharacter).map((line, j) =>
        <span key={j}>{j > 0 ? <br /> : null}{line}</span>);
      elements.push(<p key={i}>{linesInP}</p>);
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

  const description = stringToParagraphs(props.reply.description);

  return (
    <Card header={header} className="TicketReply">
      {description}
    </Card>
  );
}

TicketReply.propTypes = {
  createdField: PropTypes.string.isRequired,
  reply: PropTypes.object.isRequired,
};
