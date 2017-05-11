require('dotenv').config();
const assert = require('assert');

const parseGH = require('parse-github-repo-url');
const parseUserAgent = require('ua-parser-js');
const truncate = require('truncate');
const table = require('markdown-table');
const axios = require('axios');
const { createError } = require('micro');
const wishes = require('micro-wishes');
const pkg = require('./package.json');

const { GH_REPO, GH_TOKEN } = process.env;
assert(GH_REPO, 'GH_REPO not set');
assert(GH_TOKEN, 'GH_TOKEN not set');

const [username, repoName] = parseGH(GH_REPO);
const GH_URL = `https://api.github.com/repos/${username}/${repoName}/issues`;

const HEADER_WHITELIST = ['user-agent', 'origin', 'referer'];

const makeTable = (headers, entries, sort = true) => {
  const ret = [headers];
  const orderedEntries = sort ? entries.sort((a, b) => a[0] > b[0]) : entries;
  orderedEntries.forEach((each) => {
    ret.push(each);
  });
  return table(ret);
};

const makeIssue = ({ body, extra }, req) => {
  let suffix = '';
  if (req && req.headers.referer) {
    suffix = ` on ${req.headers.referer}`;
  }
  const title = `[wishes] New feedback${suffix}: "${truncate(body, 25)}"`;
  let fullBody = `:bulb: New feedback was posted${suffix}.\n\n## Message\n\n${body}\n\n-----\n`;
  // Format headers as table
  if (req && req.headers) {
    const entries = Object.entries(req.headers).filter(
      e => HEADER_WHITELIST.indexOf(e[0]) >= 0
    );
    const headerTable = makeTable(['Header', 'Value'], entries);
    fullBody += `\n### Headers\n\n${headerTable}\n`;
  }
  // Format user agent info as table
  if (req && req.headers && req.headers['user-agent']) {
    const userAgent = parseUserAgent(req.headers['user-agent']);
    const browserEntries = Object.entries(userAgent.browser).filter(e => e[1]);
    if (browserEntries.length) {
      const browserTable = makeTable(['Key', 'Value'], browserEntries, false);
      fullBody += `\n### Browser\n\n${browserTable}\n`;
    }

    const osEntries = Object.entries(userAgent.os).filter(e => e[1]);
    if (osEntries.length) {
      const osTable = makeTable(['Key', 'Value'], osEntries, false);
      fullBody += `\n### Operating System\n\n${osTable}\n`;
    }
  }
  // Format extra information as table
  if (extra) {
    const extraTable = makeTable(['Key', 'Value'], Object.entries(extra));
    fullBody += `\n### Extra information\n\n${extraTable}`;
  }
  fullBody += `\nReported via *[${pkg.name}](${pkg.repository}) v${pkg.version}*.`;
  return { title, body: fullBody };
};

const GitHubBackend = async (input, req) => {
  try {
    const { data } = await axios({
      method: 'POST',
      url: GH_URL,
      params: {
        access_token: GH_TOKEN,
      },
      data: makeIssue(input, req),
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
Object.assign(module.exports, { GitHubBackend, GH_URL, makeIssue });
