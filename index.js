require('dotenv').config();
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
const GH_URL = `https://api.github.com/repos/${username}/${repoName}/issues`;

const GitHubBackend = async ({ body }) => {
  const title = '[wishes] TODO';
  try {
    const { data } = await axios({
      method: 'POST',
      url: GH_URL,
      params: {
        access_token: GH_TOKEN,
      },
      data: {
        title,
        body,
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
Object.assign(module.exports, { GitHubBackend, GH_URL });
