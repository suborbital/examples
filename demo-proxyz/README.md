# Suborbital SE2 with Astro + Vue

Small demo application demonstrating integrating the [Suborbital Extension Engine](https://suborbital.dev)

The main components:

- [Astro](https://astro.build) and [Vite](https://vitejs.dev) for the tooling
- [Vue](https://v3.vuejs.org/) 3 + [Vuetify 3](https://next.vuetifyjs.com) for the frontend
- Node.js for the backend
- The [Suborbital SE2 JavaScript SDK](https://www.npmjs.com/package/@suborbital/se2)


## Commands to run

Astro/frontend development server:

```
npm install && npm run dev
```

Before running the backend locally one must build the frontend:

```
npm run build && npm run serve
```

Note that the correct environment variables (see `.env.example`) either need to be present in the environment or supplied once executing the serve command. See the list of required environment variables below.


## Run with Docker

The container must be built first:

```
docker build -t se2-demo .
```

Supplying the required environment variables one may launch the app in a container and expose the service on localhost:

```
docker run -it --env SUBORBITAL_TOKEN --env SUBORBITAL_ENV=demo.dev -p 8080:8080 se2-demo
```

Note that SUBORBITAL_TOKEN is loaded from the environment.


## Using the dashboard

Navigating to http://localhost:8080 any username/password combination may be used to log into the Proxyz dashboard.

Example plugins can be found in the `./example-plugins` directory, and more details on how the Proxyz application works can be found in the [Whirlwind tour of the Suborbital Extension Engine](https://www.youtube.com/watch?v=jIGcJrRK-SI).


## Environment variables

The demo app can be configured through the following environment variables:

- `SUBORBITAL_TOKEN` (**required**) - the environment token to the Suborbital Extension Engine
- `SUBORBITAL_ENV` (**required**) - the name of the environment the above token belongs to
- `PORT` (optional, defaults to `8080`) - the port to expose the service on

The following options alter the behavior of the "Dashboard":

- `CONFIG_MAXROWS` (defaults to `12`) - maximum number of most recent requests to display in the dashboard
- `CONFIG_SENDLOG` (defaults to `true`) - when set to `1` or `true` the backend log is streamed to the dashboard, the full log can always be accessed through the `/api/logfile` endpoint
- `CONFIG_IDLETIMEOUT` (defaults to `60`) - when set to an integer number of seconds, if the backend doesn't detect any UI actions for this period it will stop generating fake incoming requests. The backend will "wake up" once the dashboard is reopened.
- `CONFIG_UPDATEFREQ` (defaults to `1000`) - the time in milliseconds the dashboard will use to poll for new logs from the server
