import React, { Component, Children, PropTypes } from 'react';

export function Input(props) {
  return (
    <div className={`input-container ${props.className}`}>
      <input
        className="form-control"
        name={props.name}
        onChange={props.onChange}
        placeholder={props.placeholder}
        type={props.type}
        value={props.value}
      />
    </div>
  );
}

Input.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
};

Input.defaultProps = {
  className: '',
  placeholder: '',
  type: 'text',
  onChange: () => {},
};

export function Checkbox(props) {
  return (
    <div className={`checkbox ${props.className}`}>
      <label>
        <input
          onChange={(e) => props.onChange({ ...e, target: { value: e.target.value !== 'true' } })}
          type="checkbox"
          value={props.value}
          checked={props.value}
          name={props.name}
        />
        <span>{props.label}</span>
      </label>
    </div>
  );
}

Checkbox.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

Checkbox.defaultProps = {
  className: '',
  label: '',
  value: false,
  onChange: () => {},
};

const supportedInputs = [Input, Checkbox];

/*
 * This component wraps a basic html form. Before it renders
 * the children the first time, it iterates over the children
 * and creates Form state by associating child inputs' names
 * with their initial value. Then it clones the element making the
 * value dependent on the Form state rather than the initial value.
 * Form also passes onChange to the inputs. When an input receives
 * a change, it calls onChange to update Form state which causes
 * a re-render.
 */
export class Form extends Component {
  constructor(props) {
    super(props);
    this.initialState = {};
    this.setInitialState(props.children);
    this.state = this.initialState;

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.props.mapInputs(this.state));
  }

  makeChildOnChange(name, type) {
    return ({ target: { value } }) => {
      let typedValue = value;
      if (type === 'number') {
        typedValue = parseFloat(value);
      }

      if (this.state[name] !== typedValue) {
        this.setState({ [name]: typedValue }, () => {
          const result = this.props.mapInputs(this.state);
          this.props.onChange(result);
        });
      }
    };
  }

  setInitialState(children) {
    Children.forEach(children, ({ type, props = null }) => {
      if (supportedInputs.indexOf(type) !== -1) {
        this.initialState[props.name] = props.value;
      } else if (props && props.children) {
        this.setInitialState(props.children);
      }
    });
  }

  renderChildren(children) {
    return Children.map(children, child => {
      if (supportedInputs.indexOf(child.type) !== -1) {
        return React.cloneElement(child, {
          ...child.props,
          value: this.state[child.props.name],
          onChange: this.makeChildOnChange(child.props.name, child.props.type),
        });
      } else if (child.props && child.props.children) {
        return React.cloneElement(child, {
          ...child.props,
          children: this.renderChildren(child.props.children),
        });
      }

      return child;
    });
  }

  render() {
    return (
      <form className={this.props.className} onSubmit={this.onSubmit}>
        {this.renderChildren(this.props.children)}
      </form>
    );
  }
}

Form.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  mapInputs: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

Form.defaultProps = {
  className: '',
  mapInputs: x => x,
  onChange: () => {},
};
