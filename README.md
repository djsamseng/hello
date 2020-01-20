
## Install
```bash
$ brew update
$ brew install rabbitmq
$ pip install pika --upgrade
$ yarn
```

## Run
```bash
$ rabbitmq-server
$ yarn dev # Start front end and webserver
$ yarn process # Start processing node network
```

## Rabbitmq
Management Plugin enabled by default at http://localhost:15672

## Available Scripts

In the project directory, you can run:

### `yarn dev`
Runs the app on [http://localhost:3000](http://localhost:3000) and 
the backend on [http://localhost:9000](http://localhost:9000)

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

