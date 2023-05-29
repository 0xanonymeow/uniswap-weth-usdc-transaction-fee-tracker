# Uniswap WETH-USDC Transaction Fee Tracker

## Features

- Track and record all transactions within the <b>Uniswap V3 USDC/ETH pool</b>.
- Continuously capture live transaction data in real-time.
- Retrieve historical transactions for a specified time period.
- Respond with transaction information, including fees, for any given transaction hash.
- Provide an API for RESTful interaction and a web application for UI interaction.
- Enable transaction search by transaction ID or hash and time range.
- Support pagination for ease of browsing transaction data.
- Provide summarized data on total transaction fees in <b>USDC</b> and <b>ETH</b>.
- Display the current <b>ETH/USDC</b> price.

<br />

## Installation

### Prerequisites

<br />

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

<br />

### Improve stability

To avoid reaching usage limits and ensure continuous access to blockchain data, it is advisable to utilize the Etherscan API. Integrating the <b>Etherscan API</b> allows efficient retrieval of information without encountering usage restrictions, ensuring smooth and reliable access to blockchain data for your application.

- Open the <b>.env.production</b> file using a text editor.
- Assign your <b>Etherscan API</b> key to the environment variable, like this

```
ETHERSCAN_API_KEY=your_api_key_here
```

- Save the change to the file

<br />

### Build and run the Docker containers

<br />

```
docker compose up --build -d
```

<br />

### Access the Next.js server

<br />
After starting the containers, you can access the <b>Next.js</b> server at

[http://localhost:3000](http://localhost:3000).

<br />

### Access the Swagger UI

<br />
After starting the containers, you can access the </b>Swagger UI</b> at

[http://localhost:3000/api/doc](http://localhost:3000/api/doc).

<br />

### How to run test

Run this command from your terminal

```
docker exec -it server /bin/sh -c "cd /app && npm run test"
```

<br />

### Technologies

- <b>Next.js</b> (frontend and backend)
- <b>PostgreSQL</b> (database)
- <b>Swagger UI</b> (for API documentation)
- <b>Docker</b> (containerization)
- <b>Etherscan API</b> (transactions)
- <b>Binance API</b> (eth/usdc price)
- <b>Coin Gecko API</b> (usdc/usd price)

<br />

### Why full-stack development over frontend-backend?

<br />

<b>Next.js</b> offers seamless integration of server-side rendering, static site generation, and client-side rendering. By combining these functionalities in a unified framework, it eliminates the need for separate backend and frontend codebases. This simplifies development, reduces code duplication, and fosters a more efficient and maintainable architecture. With <b>Next.js</b>, we can leverage the same codebase for both frontend and backend logic, resulting in improved performance and streamlined development.

<br />

### Code quality and development workflow tools

<br />
This project combines <b>Airbnb</b> <b>JavaScript</b> linting with <b>ESLint</b> and <b>Prettier</b> for consistent code style, enforcing coding standards, and automatic formatting. <b>Husky</b> is used for running scripts before committing or pushing code changes, ensuring code quality. Additionally, <b>@commitlint</b> enforces standardized commit messages, improving clarity and maintainability of the version history. Together, these tools streamline development, enhance collaboration, and maintain a professional codebase.
