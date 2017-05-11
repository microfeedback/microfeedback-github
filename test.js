const test = require('ava');
const axios = require('axios');

const MockAdapter = require('axios-mock-adapter');

const { GitHubBackend, GH_URL, makeIssue } = require('./');

test('POST: posts to GitHub API', async (t) => {
  const mock = new MockAdapter(axios);
  const mockResponse = {
    id: 1,
    html_url: 'https://github.com/octocat/Hello-World/issues/1347',
  };
  mock.onPost(GH_URL).reply(201, mockResponse);
  const result = await GitHubBackend({ name: 'Steve', body: 'test' });
  t.deepEqual(result, mockResponse);
});

test('makeIssue returns title and body', (t) => {
  const input = { body: 'foo' };
  const result = makeIssue(input);
  t.truthy(result.title);
  t.truthy(result.body);
});

test('makeIssue returns formatted title', (t) => {
  const req = { headers: { 'x-foo': 'bar', referer: 'https://test.test/test?test' } };
  const input = { body: 'foo' };
  const { title } = makeIssue(input, req);
  t.is(title, `[wishes] New feedback on ${req.headers.referer}: "foo"`);
});

test('makeIssue returns headers in body', (t) => {
  const req = { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.10 Chromium/15.0.874.106 Chrome/15.0.874.106 Safari/535.2' } };
  const input = { body: 'foo' };
  const { body } = makeIssue(input, req);
  t.regex(body, /user-agent/);
  t.regex(body, /Mozilla\/5.0/);
});

test('makeIssue returns extra info', (t) => {
  const input = {
    body: 'test',
    extra: {
      b: 'bar',
      a: 'foo',
      c: 'baz',
    },
  };
  const { body } = makeIssue(input);
  t.regex(body, /xtra/);
});

test('makeIssue returns browser info', (t) => {
  const req = { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.10 Chromium/15.0.874.106 Chrome/15.0.874.106 Safari/535.2' } };
  const input = { body: 'test' };
  const { body } = makeIssue(input, req);
  t.regex(body, /### Browser/);
  t.regex(body, /Chromium/);
});

test('makeIssue returns OS info', (t) => {
  const req = { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.10 Chromium/15.0.874.106 Chrome/15.0.874.106 Safari/535.2' } };
  const input = { body: 'test' };
  const { body } = makeIssue(input, req);
  t.regex(body, /### Operating System/);
  t.regex(body, /Ubuntu/);
});
