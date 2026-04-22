# EduOS

EduOS is a frontend-only learning dApp for the Four.meme AI Sprint. A student selects a class and subject, uploads syllabus text or a PDF, reviews extracted topics, opens each topic one at a time to generate a detailed study page, takes a five-question quiz, and claims `100 LEARN` tokens on BNB Smart Chain Testnet after passing. The app is designed for hackathon demos: no backend, local persistence, visible AI provider badges, and a deterministic fallback path if any AI provider fails.

## Hackathon Fit

- AI workflow: yes, topic extraction, page generation, and quiz generation are all AI driven.
- DGrid bounty: yes, DGrid AI Gateway is the primary AI provider.
- Azure fallback: yes, Azure OpenAI is retained as the fallback provider.
- Four.meme relevance: yes, the results and mint screens include a Four.meme launch kit with token metadata aligned to the protocol integration docs.
- Web3 reward loop: yes, passing the quiz leads to MetaMask connect and minting on BSC Testnet.
- No backend: yes, all curriculum state is cached in browser localStorage.

## What It Does

1. User selects class `6-12` and a subject.
2. User uploads a PDF syllabus or pastes curriculum text.
3. EduOS extracts the most important study topics.
4. User reviews, edits, reorders, adds, or removes topics.
5. Open each topic card to generate one detailed study page on demand.
6. User reads the study material and takes a 5-question quiz.
7. If the user scores `3/5` or higher, they connect MetaMask.
8. The app mints `100 LEARN` on BSC Testnet and shows the transaction hash.

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS
- AI: DGrid AI Gateway primary, Azure OpenAI fallback, local fallback last-resort
- Storage: browser localStorage
- Web3: ethers.js v6, MetaMask, BSC Smart Chain Testnet
- Contract: Solidity ERC-20 demo token
- PDF parsing: browser-side PDF extraction, then send text to the AI provider

## Repository Structure

- `src/` React app source
- `contract/LearnToken.sol` demo token contract
- `.env.example` environment template
- `package.json` root app manifest

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your local env file:
   ```bash
   cp .env.example .env
   ```
3. Fill in the required values in `.env`.
4. Start the app:
   ```bash
   npm run dev
   ```

## Environment Variables

- `VITE_CONTRACT_ADDRESS`: deployed `LearnToken` contract address
- `VITE_BSC_EXPLORER_URL`: BSC testnet explorer base URL
- `VITE_DGRID_API_KEY`: DGrid AI Gateway key
- `VITE_DGRID_MODEL`: DGrid model, for example `openai/gpt-4o-mini`
- `VITE_AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint
- `VITE_AZURE_OPENAI_DEPLOYMENT`: Azure deployment name
- `VITE_AZURE_OPENAI_API_VERSION`: Azure API version
- `VITE_AZURE_OPENAI_KEY`: Azure API key fallback

If you edit `.env` while the Vite dev server is already running, restart the dev server so the new values are loaded.

## AI Provider Behavior

- Primary provider: DGrid AI Gateway
- Fallback provider: Azure OpenAI
- Final fallback: deterministic local generator

The UI shows the active provider on the upload, review, study, results, and wallet screens so judges can see exactly what is being used.

## Contract Deployment

Deploy `contract/LearnToken.sol` to BSC Testnet with Remix or your preferred Solidity workflow.

- Chain ID: `97`
- RPC: `https://data-seed-prebsc-1-s1.binance.org:8545/`
- Explorer: `https://testnet.bscscan.com`
- Reward amount: `100 * 10^18` per quiz pass

After deployment, set `VITE_CONTRACT_ADDRESS` in `.env`.

## Demo Flow

1. Open the landing page.
2. Select a class and subject.
3. Upload syllabus text or a PDF.
4. Review the extracted topics.
5. Open topic cards to generate study pages one by one.
6. Read the study material.
7. Take the quiz.
8. Pass, connect MetaMask, mint tokens, and open the BSC testnet tx hash.

## Four.meme Notes

The app does not depend on a private Four.meme API. Instead, it includes a launch-kit panel that formats token metadata fields surfaced in the protocol integration docs:

- token name
- ticker symbol
- description
- raised token
- logo
- socials

If Four.meme exposes a public token-creation endpoint you want to use during the sprint, that launch-kit card is the place to wire it in.

## Submission Notes

- Open-source license: MIT
- Demo video: required for the sponsor bounties
- Repo/docs link: required
- Token issuance: not required for judging, but included here for the onchain reward loop

## DoraHacks Submission Blurb

EduOS turns a syllabus into a topic-by-topic AI study guide, then verifies learning with a five-question quiz and onchain rewards. It uses DGrid AI Gateway as the primary model provider, keeps Azure OpenAI as fallback, and persists curriculum locally so the demo runs without a backend. The result is a clean AI x Web3 learning loop that fits the Four.meme AI Sprint and the DGrid bounty requirements.
