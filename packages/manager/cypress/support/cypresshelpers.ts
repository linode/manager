function randomPass() {
  let pass = '';
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()1234567890';

  for (let i = 0; i < 40; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

function randomTitle(count) {
  let text = '';
  const chars = 'abcdefghijklmnopqrstuvwxyz12343567890';

  for (let i = 0; i < count; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

export default {
  randomPass,
  randomTitle,
};
