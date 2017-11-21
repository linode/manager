import PropTypes from 'prop-types';
import { Children, Component } from 'react';
import withSideEffect from 'react-side-effect';

/* Based on DocumentTitle, but uses all of title props in the ReactDOM instead
 * of just the innermost one.
 * https://github.com/gaearon/react-document-title
 */
class ChainedDocumentTitle extends Component {
  render() {
    return this.props.children ?
      Children.only(this.props.children) :
      null;
  }
}

ChainedDocumentTitle.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

/* This is a react-side-effect callback that is passed a list of component objects
 * containing all of the components of this type in the ReactDOM. They are in
 * heirarchical order. The expected return value is a reduced state object.
 */
function reducePropsToState(propsList) {
  const titles = propsList.map(cdt => cdt.title).reverse();
  return titles.join(' - ');
}

/* This is a react-side-effect callback. It is called every time the state is
 * reduced by the above function.
 */
function handleStateChangeOnClient(title) {
  document.title = title || '';
}

export default withSideEffect(
  reducePropsToState,
  handleStateChangeOnClient,
)(ChainedDocumentTitle);
