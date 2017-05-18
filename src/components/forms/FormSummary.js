import React, { PropTypes } from 'react';


export async function reduceErrors(response) {
  const json = await response.json();
  const errors = { _: [] };
  json.errors.forEach(error => {
    let key = '_';
    if (error.field) {
      key = error.field;
    }

    if (error.field_crumbs) {
      key += `.${error.field_crumbs}`;
    }

    const list = errors[key] || [];
    list.push(error);
    if (!errors[key]) {
      errors[key] = list;
    }
  });
  return errors;
}

export function dispatchOrStoreErrors(apiCalls,
                                      extraWholeFormFields = [],
                                      optionalStateKey = undefined) {
  return async (dispatch) => {
    const setStateWithOptionalKey = ({ loading, errors }) => {
      if (optionalStateKey) {
        this.setState({
          loading: { ...loading, [optionalStateKey]: loading[optionalStateKey] },
          errors: { ...errors, [optionalStateKey]: errors[optionalStateKey] },
        });
      } else {
        this.setState({ loading, errors });
      }
    };

    setStateWithOptionalKey({ loading: true, errors: {} });

    const results = [];
    for (let i = 0; i < apiCalls.length; i++) {
      const nextCall = apiCalls[i];

      try {
        const nextDispatch = nextCall(...results);
        if (nextDispatch) {
          results[i] = await dispatch(nextDispatch);
        }
      } catch (response) {
        if (!response.json) {
          throw response;
        }

        const errors = await reduceErrors(response);
        errors._ = errors._.concat(extraWholeFormFields.reduce((flattenedErrors, field) => {
          const error = errors[field];
          if (Array.isArray(error)) {
            return [...flattenedErrors, ...error];
          }

          return [...flattenedErrors, error];
        }, [])).filter(Boolean);
        setStateWithOptionalKey({ errors, loading: false });
        return null;
      }
    }

    setStateWithOptionalKey({ loading: false, errors: { _: [] } });

    return results;
  };
}

export function FormSummary(props) {
  const { errors } = props;

  let content;
  if (errors._ && errors._.length) {
    content = (
      <div className="alert alert-danger">
        {errors._.map(error => {
          const text = error.hasOwnProperty('reason') ? error.reason : error;
          return (<div key={text}>{text}</div>);
        })}
      </div>
    );
  } else if (Object.keys(errors).length === 1) {
    content = props.success ? <div className="alert alert-success">{props.success}</div> : '';
  } else if (errors._) {
    content = <div className="alert alert-danger">Please fix all errors before retrying.</div>;
  }

  return (
    <div className="FormSummary">{content}</div>
  );
}

FormSummary.propTypes = {
  errors: PropTypes.object.isRequired,
  success: PropTypes.string,
};
