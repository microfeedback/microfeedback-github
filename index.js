const assert = require('assert');

const parseGH = require('parse-github-repo-url');

const axios = require('axios');
const { createError } = require('micro');
const wishes = require('micro-wishes');
const pkg = require('./package.json');

const { GH_REPO, GH_TOKEN } = process.env;
assert(GH_REPO, 'GH_REPO not set');
assert(GH_TOKEN, 'GH_TOKEN not set');

const [username, repoName] = parseGH(GH_REPO);
const URL = `https://api.github.com/repos/${username}/${repoName}/issues`;

const GitHubBackend = async ({ name, body }) => {
  const title = 'TODO';
  const fullBody = `Posted by ${name}: ${body}`;
  try {
    const { data } = await axios({
      method: 'POST',
      url: URL,
      params: {
        access_token: GH_TOKEN,
      },
      data: {
        title,
        body: fullBody,
      },
    });
    return data;
  } catch (err) {
    const { status, data } = err.response;
    throw new createError(status, data.message, err);
  }
};

module.exports = wishes(GitHubBackend, {
  name: 'github',
  version: pkg.version,
});
