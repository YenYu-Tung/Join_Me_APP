# Web Programming HW#3 Join Me APP Deploy Version

## Running the app

1. Install dependencies

```bash
yarn install
```

2. Create a `.env.local` file in the root of the project and add a _valid_ Postgres URL. 

This is just an example, you should replace the URL with your own.

```bash
POSTGRES_URL="postgres://postgres:postgres@localhost:5432/twitter"
```

3. Run the migrations

```bash
yarn migrate
```

4. Start the app

```bash
yarn dev
```