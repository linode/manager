import * as React from 'react';
import { Form } from 'formik';

/**
 * This abstraction is to resolve a bug in Formik
 * (see https://github.com/jaredpalmer/formik/issues/2120 for details).
 * Basically @react/types, depending on the version, conflicts with
 * what Formik expects, and we end up with a component with a required
 * "translate" prop which Formik does not provide.
 *
 * At some point the bug will be fixed and we can remove this.
 */

export default class FForm extends React.Component<any> {
  render() {
    return (
      <Form {...this.props} translate="yes">
        {this.props.children}
      </Form>
    );
  }
}
