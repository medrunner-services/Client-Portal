# Medrunner Client Portal Contributing Guide

We're really excited that you are interested in contributing to the Medrunner Client Portal. Before submitting your contribution, please make sure to take a moment and read through the [Code of Conduct](https://github.com/medrunner-services/api-client-ts/blob/main/CODE_OF_CONDUCT.md).

## Contributing by creating issues

The simplest and easiest way to contribute to the project is to create an issue. You can report bugs, request features, or suggest improvements. This way we know what is important for you and we can work on it faster!

When creating an issue, be sure to provide the maximum amount of information and context so that we can understand the problem or the suggestion. If you are reporting a bug, please provide the environnement where the bug occurred and a way to reproduce it.

## Contributing by creating pull requests

If you want to directly contribute to the project by adding or fixing some code, you can create a pull request with your desired changes. Here are some guidelines to follow:

- Fork the repository into your own account.

- Checkout a topic branch from `develop` with a name like `feature/adding-teams` or `bug/images-error`.

- Make sure to run `npm run lint:fix` and `npm run prettier:fix` before committing your changes. You can even enable GitHub actions in your forked repository to run these checks automatically.

- Create a pull request with your changes from your feature branch against the `develop` branch.

- If adding a new feature:

  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing a bug:

  - Provide a detailed description of the bug in the PR. If possible add screenshot, gif or small video to visualize the bug.

- It's OK to have multiple small commits as you work on the PR - all PRs will be squash merged.

When we receive a pull request, we will review it and provide feedback. If everything is good, we will merge it into the main branch.

## Development Setup

### Local development

You will need [node](https://nodejs.org/)

After cloning the repo, run:

```sh
# install the dependencies of the project
$ npm install
```

Create a .env file in the root of the project with the following content:

```dotenv
VITE_API_URL # The URL of the medrunner API
VITE_CALLBACK_URL # The URL of your the app
VITE_DISCORD_CLIENT_ID # Used to authenticate users with Discord OAuth
VITE_DISCORD_SERVER_ID # Used in links across the app
VITE_FEATURE_REGISTRATION_ENABLED # Can be set to true or false to enable or disable the registration feature
VITE_FEATURE_ACCOUNT_DELETION_ENABLED # Can be set to true or false to enable or disable the account deletion feature
```

Run the development server to see your local changes at [localhost:5173](http://localhost:5173/):

```sh
# launch the dev server
$ npm run dev
```

### Preview and test locally

To preview your changes in a more realistic environment, you can build the project and serve it locally:

```sh
# build the project
$ npm run build
# launch the web server
$ npm run preview
```

### Test on different devices

You can expose your local development server to your local network to test the app on different devices like smartphones or tablets:

```sh
# launch the dev server exposed to your network
$ npm run dev-network
```

### Using different environments

You can use different `.env` files to configure the app for different environments declared in [vite](https://vitejs.dev/guide/env-and-mode).
For exemple can use `.env.development` and `.env.development-network` for exemple to have different configurations for local development and local network development.

You can also set up custom environments using the `--mode YOUR_MODE_NAME` flag when using a vite command.
