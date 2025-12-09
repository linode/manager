import React from 'react';

export const replaceNewlinesWithLineBreaks = (text: string) =>
  text.split('\n').map((text, i, lines) =>
    i === lines.length - 1 ? (
      text
    ) : (
      <React.Fragment key={i}>
        {text}
        <br />
      </React.Fragment>
    ),
  );
