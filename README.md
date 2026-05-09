# Medusa

Medusa is a Devnet wallet reputation app that turns public Solana wallet activity into a credit score, risk profile, badge level, and leaderboard identity.

Live app:

```txt
https://medusa-score.vercel.app/
```

## What It Does

- Connects a Solana wallet on Devnet.
- Reads public wallet activity through Solana RPC.
- Scores wallets using balance, token accounts, successful transactions, account age, and activity signals.
- Shows a profile dashboard with credibility score, risk level, activity metrics, and badge eligibility.
- Lets users opt in to a public leaderboard.
- Displays Medusa badge levels based on wallet score.
- Links to the deployed Devnet Solana program.

## Devnet Program

The Anchor program for this project is deployed/configured with:

```txt
BZvu64yv285maSxcw2CiCL77wgLsEZ3VNCYZddZw2o1T
```

Explorer:

```txt
https://explorer.solana.com/address/BZvu64yv285maSxcw2CiCL77wgLsEZ3VNCYZddZw2o1T?cluster=devnet
```

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Solana Wallet Adapter
- Solana RPC
- Anchor
- Rust

## Project Structure

```txt
.
|-- programs/solana_trust/   # Anchor program
|-- web/                     # Next.js frontend
|-- target/                  # Anchor IDL/types/build output
|-- Anchor.toml              # Anchor config
`-- package.json             # Workspace scripts
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Useful Commands

Run the web app:

```bash
npm run dev
```

Build the web app:

```bash
npm run build
```

Lint the web app:

```bash
npm run web:lint
```

Run Anchor tests:

```bash
cargo test
```

## Notes

The current frontend scores general public Devnet wallet activity. It does not yet index custom Medusa program events or protocol-specific borrower accounts. The deployed Anchor program is present as the project on-chain base and can be expanded with scoring attestations, badge minting, or profile registry instructions.
