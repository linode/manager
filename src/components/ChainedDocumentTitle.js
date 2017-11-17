import PropTypes from 'prop-types';
import React, { Children, Component } from 'react';
import withSideEffect from 'react-side-effect';

/* Based on DocumentTitle, but uses all title props instead of just the 
 * innermost one.
 * https://github.com/gaearon/react-document-title
 */
class ChainedDocumentTitle extends Component {
  render() {
    if (this.props.children) {
      return Children.only(this.props.children);
    } else {
      return null;
    }
  }
}

ChainedDocumentTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

function reducePropsToState(propsList) {
  const titles = propsList.map(cdt => cdt.title).reverse();
  return titles.join(" - ");
}

function handleStateChangeOnClient(title) {
  document.title = title || '';
}

export default withSideEffect(
  reducePropsToState,
  handleStateChangeOnClient,
)(ChainedDocumentTitle);
