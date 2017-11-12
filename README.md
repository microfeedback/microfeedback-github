# microfeedback-github

[![Build Status](https://travis-ci.org/microfeedback/microfeedback-github.svg?branch=master)](https://travis-ci.org/microfeedback/microfeedback-github)
[![Greenkeeper badge](https://badges.greenkeeper.io/microfeedback/microfeedback-github.svg)](https://greenkeeper.io/)

An easily-deployable microservice for collecting user feedback as GitHub issues.

## Usage

Send a POST request to `https://microfeedback-github.now.sh/<github-user>/<github-repo>`
with a JSON body containing a "body" key and a string value containing
content.

Example:

```
curl -d '{"body": "this is great!"}' \
  -H 'Content-Type: application/json' \
  https://microfeedback-github.now.sh/microfeedback/testrepo
```

The feedback will be posted on the given GitHub repo's issue tracker.


### API

#### `POST /<github-user>/<github-repo>`

Post a new feedback message on the issue tracker for the given GitHub
repo.

The JSON payload may contain the following keys:

- `body` (required): The feedback content.
- `screenshotURL`: Optional URL to a screenshot image.
- `extra`: Optional object containing optional information to include in the issue.

## Deploy using [now](https://zeit.co/now)

If you already have a [now](https://zeit.co/now) account and a GitHub
API token associated with your feedback bot, you can deploy
microfeedback-github to now using either

- **One click deploy** OR
- **One command deploy**


### One click deploy

Click the button below. Enter a zeit API token associated with your
account and the GitHub API token associated with your feedback bot's GitHub account.

[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/microfeedback/microfeedback-github&&env=GH_TOKEN)

### One command deploy

Use the `now` CLI to deploy this repo. Pass in your bot's GitHub API
token. You will be prompted to enter the GitHub API token associated
with your feedback bot's GitHub account.

```
now microfeedback/microfeedback-github
```

For more detailed setup instructions, see the next section.

## Detailed instructions

- Sign in to the GitHub account that will post issues, e.g. `myapp-issuebot`.
- Go [here](https://github.com/settings/tokens/new) to generate a new personal access token.
- Enter a description, e.g. "For posting issues" and select the "repo" scope.

![](media/personal-access-token.png)

- Click "Generate token" and copy the token.

- Set up an account with now and install the now client. See [here](https://zeit.co/now) for details.
- Deploy the service with `now`. You must pass the following environment variables:
  - `GH_TOKEN`: The access token you just created.

```
now microfeedback/microfeedback-github -e GH_TOKEN=abc123
```

- You're done! Copy the URL returned by `now`. This is the URL clients will use to access the service.


## Configuration

Configuration is defined through environment variables and can be passed
when you deploy microfeedback-github.

```
now microfeedback/microfeedback-github -e GH_TOKEN=abc123 -e ALLOWED_REPOS=sloria/website,sloria/another-website
```

The following options are available:

- `GH_TOKEN` (required): The GitHub API token associated with your
                         feedback bot's account.
- `ALLOWED_REPOS`: A comma-delimited list of GitHub repos that maybe
                    posted to. If `'*'`, allow posting to any repo
                    that the `GH_TOKEN` has access to (incl. any
                    public repos). Default: `'*'`

## Development

* Fork and clone this repo. `cd` into the project directory.
* `npm install`
* Copy `.env.example`: `cp .env.example .env`
* (Optional) Update `GH_TOKEN` in `.env`.
* To run tests: `npm test`
* To run the server with auto-reloading and request logging: `npm run dev`

### Debugging in tests with iron-node

Add `debugger` statements, then run the following:

```
npm i -g iron-node
npm run test:debug
```

## Related

- [microfeedback-core](https://github.com/microfeedback/microfeedback-core)

## License

MIT Licensed.
