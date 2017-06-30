import React, { PropTypes } from 'react';

import { FormModalBody } from '../modals';


export default function InternalError(props) {
  return (
    <FormModalBody
      noCancel
      onSubmit={props.returnHome}
      buttonText="Refresh"
      analytics={{ title: 'Internal Error' }}
    >
      <div>
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
      </div>
    </FormModalBody>
  );
}

InternalError.propTypes = {
  returnHome: PropTypes.func,
};
