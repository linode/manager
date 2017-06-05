import React, { PropTypes } from 'react';

import { ConfirmModalBody } from '../modals';


export default function InternalError(props) {
  return (
    <ConfirmModalBody
      noCancel
      onOk={props.returnHome}
      buttonText="Refresh"
    >
      <p>
        Something went wrong. Check your internet connection, try refreshing the page,
        or return <a href="/">home</a>.
      </p>
      <p>
        <small>
          If you think you've discovered a bug in the application and would like to report
          it, check <a href="https://github.com/linode/manager/blob/master/CONTRIBUTING.md#reporting-bugs" target="_blank" rel="nofollow noopener noreferrer">here</a> for instructions.
        </small>
      </p>
    </ConfirmModalBody>
  );
}
