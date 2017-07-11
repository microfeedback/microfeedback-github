# microfeedback-github

[![Greenkeeper badge](https://badges.greenkeeper.io/microfeedback/microfeedback-github.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/microfeedback/microfeedback-github.svg?branch=master)](https://travis-ci.org/microfeedback/microfeedback-github)

An easily-deployable microservice for collecting user feedback as GitHub issues.

## Deploy using [now](https://zeit.co/now)

If you already have [now](https://zeit.co/now) and a token for the GitHub user that will post issues on your repo, you can deploy using a single command:

```
now microfeedback/microfeedback-github -e GH_REPO=myuser/myrepo -e GH_TOKEN=abc123
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
  - `GH_REPO`: The repo where issues will be posted, e.g. `myuser/myapp`.
  - `GH_TOKEN`: The access token you just created.

```
now microfeedback/microfeedback-github -e GH_REPO=myuser/myapp GH_TOKEN=abc123
```

- You're done! Copy the URL returned by `now`. This is the URL clients will use to access the service.

## Development

* Fork and clone this repo. `cd` into the project directory.
* `yarn install`
* Copy `.env.example`: `cp .env.example .env`
* (Optional) Update `GH_TOKEN` in `.env`.
* To run tests: `npm test`
* To run the server with auto-reloading and request logging: `npm run dev`

### Debugging in tests with iron-node

Add `debugger` statements, then run the following:

```
yarn global add iron-node
npm run test:debug
```

## Related

- [microfeedback-core](https://github.com/microfeedback/microfeedback-core)

## License

MIT Licensed.
