import React from 'react';
import { connect } from 'react-redux';

import { EditConfigPage, select } from './EditConfigPage';

export function AddConfigPage(props) {
  return <EditConfigPage create {...props} />;
}

AddConfigPage.propTypes = {
  ...EditConfigPage.propTypes,
};

delete AddConfigPage.propTypes.create;

export default connect(select)(AddConfigPage);
