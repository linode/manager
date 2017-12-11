export function onChange(event) {
  const { target: { name, value, type, checked } } = event;

  let realValue = value;
  if (type === 'checkbox') {
    realValue = checked;
  }

  this.setState({ [name]: realValue });
}
