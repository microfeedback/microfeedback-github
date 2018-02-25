const test = require('ava');
const axios = require('axios');

const MockAdapter = require('axios-mock-adapter');

const {GitHubBackend, makeIssue} = require('.');

const makeFakeRequest = url => ({
  url: url || 'https://test.test/octocat/Hello-World',
  headers: {
    referer: 'http://foo.bar',
  },
});

test('POST: posts to GitHub API', async t => {
  const mock = new MockAdapter(axios);
  const mockResponse = {
    id: 1,
    html_url: 'https://github.com/octocat/Hello-World/issues/1347',
  };
  mock
    .onPost('https://api.github.com/repos/octocat/Hello-World/issues')
    .reply(201, mockResponse);
  const req = makeFakeRequest();
  const input = {name: 'Steve', body: 'test'};
  const result = await GitHubBackend({input}, req);
  t.deepEqual(result, mockResponse);
});

test('POST: handles errors from the GitHub API', async t => {
  const mock = new MockAdapter(axios);
  const mockResponse = {
    message: 'No no no',
  };
  mock
    .onPost('https://api.github.com/repos/octocat/Hello-World/issues')
    .reply(403, mockResponse);
  const req = makeFakeRequest();
  const input = {name: 'Steve', body: 'test'};
  const promise = GitHubBackend({input}, req);
  await t.throws(promise);
});

test('ALLOWED_REPOS', async t => {
  process.env.ALLOWED_REPOS = 'octocat/allowed-repo,octocat/another-repo';
  // Set up fake responses
  const mock = new MockAdapter(axios);
  const mockResponse = {
    id: 1,
    html_url: 'https://github.com/octocat/Hello-World/issues/1347',
  };
  mock
    .onPost('https://api.github.com/repos/octocat/Hello-World/issues')
    .reply(201, mockResponse);
  const mockResponse2 = {
    id: 2,
    html_url: 'https://github.com/octocat/allowed-repo/issues/1347',
  };

  mock
    .onPost('https://api.github.com/repos/octocat/allowed-repo/issues')
    .reply(201, mockResponse2);

  const req = makeFakeRequest('https://test.test/octocat/Hello-World');
  const input = {name: 'Steve', body: 'test'};
  const promise = GitHubBackend({input}, req);
  const error = await t.throws(promise);
  t.is(error.statusCode, 400);
  t.is(error.message, 'Repo "octocat/Hello-World" not allowed.');

  const req2 = makeFakeRequest('https://test.test/octocat/allowed-repo');
  const input2 = {name: 'Steve', body: 'test'};
  const result = await GitHubBackend({input: input2}, req2);
  t.deepEqual(result, mockResponse2);
});

test('makeIssue returns title and body', t => {
  const input = {body: 'foo'};
  const result = makeIssue(input);
  t.truthy(result.title);
  t.truthy(result.body);
});

test('makeIssue returns formatted title', t => {
  const req = {
    headers: {'x-foo': 'bar', referer: 'https://test.test/test?test'},
  };
  const input = {body: 'foo'};
  const {title} = makeIssue(input, req);
  t.is(title, `[microfeedback] New feedback on ${req.headers.referer}: "foo"`);
});

test('makeIssue returns headers in body', t => {
  const req = {
    headers: {
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.10 Chromium/15.0.874.106 Chrome/15.0.874.106 Safari/535.2',
    },
  };
  const input = {body: 'foo'};
  const {body} = makeIssue(input, req);
  t.regex(body, /user-agent/);
  t.regex(body, /Mozilla\/5.0/);
});

test('makeIssue returns screenshot in body if provided', t => {
  const result = makeIssue({body: 'foo'});
  t.notRegex(result.body, /Screenshot/);

  const result2 = makeIssue({
    body: 'foo',
    screenshotURL: 'http://test.test/img/',
  });
  t.regex(result2.body, /Screenshot/);
  t.regex(result2.body, /http:\/\/test\.test\/img\//);
});

test('makeIssue returns extra info', t => {
  const input = {
    body: 'test',
    extra: {
      b: 'bar',
      a: 'foo',
      c: 'baz',
    },
  };
  const {body} = makeIssue(input);
  t.regex(body, /xtra/);
});

test('makeIssue returns browser info', t => {
  const req = {
    headers: {
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.10 Chromium/15.0.874.106 Chrome/15.0.874.106 Safari/535.2',
    },
  };
  const input = {body: 'test'};
  const {body} = makeIssue(input, req);
  t.regex(body, /### Browser/);
  t.regex(body, /Chromium/);
});

test('makeIssue returns OS info', t => {
  const req = {
    headers: {
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.10 Chromium/15.0.874.106 Chrome/15.0.874.106 Safari/535.2',
    },
  };
  const input = {body: 'test'};
  const {body} = makeIssue(input, req);
  t.regex(body, /### Operating System/);
  t.regex(body, /Ubuntu/);
});

test('makeIssue returns Perspective API info', t => {
  const req = {
    headers: {
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.10 Chromium/15.0.874.106 Chrome/15.0.874.106 Safari/535.2',
    },
  };
  const perspective = {
    toxicity: 0.1234,
  };
  const input = {body: 'test', perspective};
  const {body} = makeIssue(input, req);
  t.regex(body, /### Perspective API/);
  t.regex(body, /toxicity/);
});
