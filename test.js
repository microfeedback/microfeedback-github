const test = require('ava');
const axios = require('axios');

const MockAdapter = require('axios-mock-adapter');

const { GitHubBackend, GH_URL } = require('./');

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
