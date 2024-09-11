import React from 'react';

import { SMTPRestrictionText } from '../SMTPRestrictionText';

export const SMTP = () => {
  return <SMTPRestrictionText>{({ text }) => text}</SMTPRestrictionText>;
};
