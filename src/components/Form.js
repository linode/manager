import React, { PropTypes } from 'react';
import Formsy, { HOC } from 'formsy-react';

function BareInput(props) {
  return (
    <div className={`input-container ${props.className}`}>
      <input
        className="form-control"
        name={props.name}
        onChange={e => props.setValue(e.target.value)}
        placeholder={props.placeholder}
        type={props.type}
        value={props.getValue()}
      />
    </div>
  );
}

BareInput.propTypes = {
  setValue: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  getValue: PropTypes.func.isRequired,
};

// eslint-disable-next-line new-cap, babel/new-cap
export const Input = HOC(BareInput);

Input.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any.isRequired,
};

Input.defaultProps = {
  className: '',
  placeholder: '',
  type: 'text',
};

function BareCheckbox(props) {
  return (
    <div className={`checkbox ${props.className}`}>
      <label>
        <input
          onChange={() => props.setValue(!props.getValue())}
          type="checkbox"
          value={props.getValue()}
          checked={props.getValue()}
          name={props.name}
        />
        <span>{props.label}</span>
      </label>
    </div>
  );
}

BareCheckbox.propTypes = {
  setValue: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  getValue: PropTypes.func.isRequired,
};

// eslint-disable-next-line new-cap, babel/new-cap
export const Checkbox = HOC(BareCheckbox);

Checkbox.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.bool,
};

Checkbox.defaultProps = {
  className: '',
  label: '',
  value: false,
};

export function Form(props) {
  return (
    <Formsy.Form
      className={props.className}
      mapping={props.mapInputs}
      onSubmit={props.onSubmit}
    >
      {props.children}
    </Formsy.Form>
  );
}

Form.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  mapInputs: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
};

Form.defaultProps = {
  className: '',
  mapInputs: x => x,
};
