export function onChange(event) {
  const { target: { name, value, type } } = event;
  this.setState({ [name]: type === 'radio' ? value === 'true' : value });
}
