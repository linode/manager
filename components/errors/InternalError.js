import PropTypes from 'prop-types';
import React from 'react';

import { ExternalLink } from '../buttons';
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
            it, check <ExternalLink to="https://github.com/linode/manager/blob/master/CONTRIBUTING.md#reporting-bugs">here</ExternalLink> for instructions.
          </small>
        </p>
      </div>
    </FormModalBody>
  );
}

InternalError.propTypes = {
  returnHome: PropTypes.func,
};
