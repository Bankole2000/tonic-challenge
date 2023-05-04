# Tonic API Dev Test

Repository for [The Tonic Technologies](https://thetonictech.com/) Technical assessment solution.

## Requirements

Assessment Details are specified in [this google Doc](https://docs.google.com/document/d/185nYIkYZ3lNUo-gbODdEmiCyh_Mb642bBoYQKqR7ep8/edit) but (for convenience) are summarized below

- __Test 1__:
  - Write a simple FizzBuzz function, which should output a sequence of integers from 1 to 100 that returns “Fizz” for multiples of 3,  “Buzz” for multiples of 5, and “FizzBuzz” for multiples of both 3 and 5. This should result in something like 1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz
- __Test 2__:
  - Design a basic bank-versioned API with the ability to signup, sign in, and initiate transfers between accounts with ExpressJS (Node.js Framework). Your API should utilize refresh token mechanism for re-authenticating users using Redis; the persistent storage should be MongoDB, while your cache storage should be Redis (not mandatory to implement a caching system), with at least one route(s) requiring authentication, and another requiring authorization (2 role types definition should do) implemented.

__Take Aways:__

- API Versioning
- Rate limiting mechanism
- Role base authentication / authorization
- Refresh token re-authentication mechanism

## My Solution

This Repository constitutes a body of work representing my solution to the assessment. It comprises of the following:

- A monorepo consisting of
  - A runnable function file and working endpoint for __Test 1__.
  - Implementation of a __Backend API__ as my solution for __Test 2__ and __Take Aways__
  - __Api Collections__ for testing on both local and staging environments
  - [__Live Demo__](https://tonic-backend-api.up.railway.app/) for remote testing
  - __Setup__ for running on different environments - __Dev__ on __Local / Computer__ or with __Docker__
  - __(Incomplete - WIP)__ Frontend client for working with the API

- Test 1 Solution

  - [x] Clone this repository and run `node test1.js` in the root folder (requires nodejs installed locally) or
  - [x] Make a GET request to the endpoint at [\<BaseURL>/fizz-buzz](https://tonic-backend-api.up.railway.app/fizz-buzz). (You can also add a query parameter `?q=<number>` with a valid number to make it dynamic)

- Test 2 Solution (test with a REST client)

  - [x] Users can signup with email and password
  - [x] Users can sign in with email and password
  - [x] Users can update their profiles (required to add accounts)
  - [x] Users can add bank accounts to make deposits, withdrawals or transfers to other user accounts, or between their own accounts
  - [x] Refresh token mechanism is implemented using cookies and sessions stored in Redis for re-authenticating users
  - [x] Data is persisted in Mongodb database
  - [x] Cacheable data is stored in Redis
  - [x] User roles are implemented (2 roles - USER and ADMIN)
  - [x] Multiple routes requiring authentication
  - [x] Multiple routes requiring authorization (in various forms including authorization by Role, by resource ownership, and by profile status)
  - [x] Rate limiting is implemented - 2 kinds:
    - [x] limiting request per time from IP address
    - [x] requiring dynamically configuratble transaction cooldown to prevent duplicate transactions
  - [x] API Versioning is implemented - 2 kinds:
    - [x] Route-based versioning (combined with version in file/folder structure to illustrate how version change management may be implemented)
    - [x] Semantic Versioning (combined with auto-generated [Change Logs](./CHANGELOG.md) and [Release Tags](https://github.com/Bankole2000/tonic-challenge/tags)) to demonstrate version release management.

- Additional QC/QoL (Quality Control / Quality of life) benefits / nice to haves implemented:
  - [x] Server side request input + data validation
  - [x] Dockerized for easy spinup & deployment
  - [x] Typescript + Eslint for faster debugging, standardized code formating and overall better code quality + developer experience
  - [x] Commit linting for standardized commit messages
  - [x] SocketIO for realtime updates on Transfers / Transactions
  - [x] Monorepo to run frontend client and api concurrently on local
  - [x] [ThunderClient](https://www.thunderclient.com/) Collection for in IDE api testing.
  - [x] Github Issues, bug reports, task, and feature request templates setup for convenient issue reporting / issue driven development.

## How to Test

- To Test the [running demo api](https://tonic-backend-api.up.railway.app/health-check) download and import [this collection](https://drive.google.com/file/d/1aljJV3wdEl4is6-6EUNwsdaZwKt05mV-/view?usp=sharing) and [this environment](https://drive.google.com/file/d/1qK9LvqpVuVvp2hHSWRC4IIRTDw5f4xBX/view?usp=sharing) into Postman. Signup with `admin@test.com` to get the `ADMIN` role

- To Test locally, clone the repository and follow the steps in either [Running with Docker](#running-with-docker) or [Running On Local](#running-locally) to run on those environments respectively. Download and import the aforementioned collection and environment into postman, but change the `baseurl` environment variable to `http://localhost:3000` . To get the `ADMIN` role, signup with the email you specify in the `.env` file. See [`.env.example`](./packages/backend/.env.example)

> N.B 1: a few `/api/v1/admin` endpoints have not been implemented yet (i.e. are work-in-progress) but are outside of the scope of the assessment. They were just to make the api more robust

> N.B 2: I intended to build a VueJS frontend client but was unable to due to the time constraints (again, outside the assessment scope - was just to have a browser client to interact with the api)

## How to Run

The easiest and most straightforward way to run the app is with docker

### Running with Docker

Requirements:

- Docker installed (with Docker compose) and docker engine running.

Steps:

- Clone or download this repository
- In a terminal / CLI, navigate to the root folder of the project
- Run `docker-compose up -d`
- You might need to wait a bit for the docker images to be pulled + built. Please watch the logs to confirm when this process is complete.
- If the build fails, this is most likely due to an interruption in the internet connection. Simply try again by running `docker-compose up -d`
- Visit `http://localhost:3000` in a browser (or make a GET request) to confirm the backend-api is running
- Visit `http://localhost:8080` in a browser to confirm the frontend client is running
- To shutdown the servers, run `docker-compose down`

### Running Locally

Requirements:

- NodeJS installed (version 16.13.1)
- Mongodb
- Redis

> For the Mongodb DATABASE_URL please follow the example in `/packages/backend/.env.example` or the `docker-compose` file

Steps:

- Clone / download this repository
- The project was built with __Node JS__ Version `16.13.1` So please have this version running to avoid any package compatibility / version issues. (use `node -v` to confirm or use [nvm](https://github.com/nvm-sh/nvm#intro) to set the node version)
- Run `npm install` in the root folder
- Run `npm install` in the `/packages/frontend` folder
- Run `npm install` in the `/packages/backend` folder
- Create a `.env` file the `/packages/backend/` folder (i.e. `/packages/backend/.env`)
- Add environment variables to the `.env` following the example in [`/packages/backend/.env.example`](./packages/backend/.env.example)
- run `npx prisma generate` in the `/packages/backend` folder to initialize the prisma client
  
#### To run services indepently

- To run the backend-api
  - navigate into the `/packages/backend` folder
  - run `npm run dev` to startup the project in dev mode with `nodemon` and `ts-node` OR
  - run `npm run build` then `npm run start` to run the typescript build from the `dist` folder
  - visit `http://localhost:3000/health-check` to confirm the backend-api is running
  
- To run the frontend VueJS client
  - navigate into the `packages/frontend` folder
  - run `npm run serve` to startup the project in dev mode
  - visit `http://localhost:8080` to confirm the frontend client is running

#### To run as a mono-repo

- Navigate to the project root folder
- The project uses [Lerna JS](https://lerna.js.org/) so you _may_ need to have it installed globally
- Run `lerna exec --parallel npm run dev` to run both the frontend and backend servers concurrently
- visit `http://localhost:3000/health-check` to confirm the backend-api is running
- visit `http://localhost:8080` to confirm the frontend client is running

## Implementation details

The project was built with

- NodeJS version 16.13.1
- MongoDB
- Redis
- [Prisma ORM](https://www.prisma.io/docs/concepts/database-connectors/mongodb) (Mongodb Connector);

### Backend API Folder Structure

Contents of the `/packages/backend` folder

```bash
.
├── dockerfile
├── # node_modules
├── nodemon.json
├── package.json
├── prisma
│   └── schema.prisma  # Db Schema
├── src
│   ├── @types       # custom types + interfaces
│   ├── controllers  # Enpoint request handlers (versioned)
│   ├── lib          # For singleton connectors
│   ├── middleware   # access control, request validation etc (versioned)
│   ├── routes       # routes (versioned)
│   ├── services     # Database access classes (versioned)
│   ├── utils        # helpers, validators, utility functions
│   ├── app.ts       # Server setup
│   └── index.ts     # entry point
├── thunder-tests    # For use with Thunder client vscode extension
└── tsconfig.json
```

To use the Thunder-tests, open the `/packages/backend` folder in vscode, and install + open the [Thunderclient Extension](https://www.thunderclient.com/)

### Application Logic + Flow

All requests are made in JSON format

All responses are instances of the [`ServiceResponse`](./packages/backend/src/%40types/ServiseReponse.type.ts) Class. The gist of it is as follows:

```ts
type ServiceResponse {
  // General response message
  message: string, 
  // any data that may be returned
  data: any, 
  // was the request successful for the intended purpose
  success: boolean, 
  // reponse http status code,
  statusCode: number, 
  // if any error, simple error message,
  error: string | undefined | null, 
  // if any error, more details about the error,
  errors: any | undefined | null, 
  // if any error, potential ways to fix it (useful for client-side developers)
  fix: string | undefined | null,  
  // part of the refresh token mechanism - if accessToken is renewed, interceptor can replace token without needing to re-authenticate
  newAccessToken: string | undefined | null, 
}
// newAccessToken is exposed here only for demonstration purposes
```

Local or Docker `<BaseURL>` is `http://localhost:3000`

Demo deployment `<BaseURL>` is `https://tonic-backend-api.up.railway.app`

All requests to `/api/v1/user` and `/api/v1/accounts` Require __Authentication__

All requests to `/api/v1/admin` require the `ADMIN` Role

#### User Signup
  
POST `<BaseURL>/api/v1/auth/register`

```json
{
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "tos": true
}
```

> On success - User is logged in but needs to update profile / kyc
>
> User obtains default "USER" role
>
> To get "ADMIN" role, sign up with ADMIN_EMAIL specified in .env file
>
> ADMIN_EMAIL in the live demo is 'admin@test.com'
> 
> "ADMIN" role can add or remove roles from other users

#### User Login

POST `<BaseURL>/api/v1/auth/login`

```json
{
  "email": "string",
  "password": "string",
}
```

#### Check logged in status

GET `<BaseURL>/api/v1/auth/me`

#### Logout

GET `<BaseURL>/api/v1/auth/logout`

#### User Update Profile (KYC)

PATCH `<BaseURL>/api/v1/user/kyc` _[Requires Authentication]_

```json
{
  "firstname": "string",
  "lastname": "string",
  "bvn": "string",
}
```

> User can update any field but must update at least 1 with request
>
> KYC status is updated depending on user profile completing

#### Get / Search List of Banks

`<BankId>` is needed for user to add account

GET `<BaseURL>/api/v1/system/banks?q=<searchTerm>`

#### User Add Bank Account

POST `<BaseURL>/api/v1/user/accounts` _[Requires Authentication]_

```json
{
  "bankId": "string",
  "accountNumber": "string",
}
```

> User profile must be complete to add account
>
> User must have at least 1 account to deposit, withdraw, transfer
>
> User can have multiple accounts

#### User Get Own Accounts

GET `<BaseURL>/api/v1/user/accounts` _[Requires Authentication]_

#### User Deposit into Own Account

POST `<BaseURL>/api/v1/account/<accountId>/deposit` _[Requires Authentication, Account Ownership]_

```json
{
  "amount": 1000000,
  "description": "Saving for the rainy day"
}
```

> User cannot transfer or withdraw with insufficient balance
>
> User can only deposit into their own account

#### User Withdraw from Own Account

POST `<BaseURL>/api/v1/account/<accountId>/withdraw` _[Requires Authentication, Account Ownership]_

```json
{
  "amount": "number",
  "description": "string"
}
```

> User cannot transfer or withdraw with insufficient balance

#### User Find other user account

GET `<BaseURL>/api/v1/account/find` _[Requires Authentication, Account Ownership]_

```json
{
  "amountNumber": "number",
  "bankId": "string"
} 
```

> User needs to find account to get \<destinationAccountId>

#### User Transfer to another Account

POST `<BaseURL>/api/v1/account/<accountId>/transfer` _[Requires Authentication, Origin Account Ownership]_

```json
{
  "destinationAccountId": "string",
  "amount": "number",
  "description": "string",
  "save": true, 
}
```

> `save` Saves destination account as beneficiary
>
> User cannot transfer with insufficient balance
>
> User cannot transfer to same account
>
> Socket event updates both benefactor and recipient for realtime update
>
> Unsuccessful transfers will be reversed

### User Get Beneficiary Accounts

GET `<BaseURL>/api/v1/user/beneficiaries`

### User Remove Beneficiary Accounts

DELETE `<BaseURL>/api/v1/user/beneficiary/<accountId>`

### Admin Get / Search Users

GET `<BaseURL>/api/v1/admin/users` _[Requires Authentication, ADMIN Role]_

Several other endpoints can be viewed and tested in the [Postman Collection](https://drive.google.com/file/d/1aljJV3wdEl4is6-6EUNwsdaZwKt05mV-/view?usp=sharing)
