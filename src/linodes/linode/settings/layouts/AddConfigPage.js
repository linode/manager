import React from 'react';
import { connect } from 'react-redux';

import { EditConfigPage, select } from './EditConfigPage';

export function AddConfigPage(props) {
  // eslint-disable-next-line react/jsx-boolean-value
  return <EditConfigPage create={true} {...props} />;
}

AddConfigPage.propTypes = {
  ...EditConfigPage.propTypes,
};

delete AddConfigPage.propTypes.create;

export default connect(select)(AddConfigPage);
