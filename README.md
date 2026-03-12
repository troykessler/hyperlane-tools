# Hyperlane Tools

A collection of handy online tools for Hyperlane developers, inspired by [it-tools.tech](https://it-tools.tech/).

## Features

### Address Converter
Convert between address formats and bytes32 with automatic protocol type detection.

- **Bidirectional conversion**: Address ↔ Bytes32
- **Auto-detection**: Automatically detects input type and protocol
- **Multi-protocol support**: Ethereum, Solana, Cosmos, Starknet, Radix, Aleo
- **Validation**: Real-time validation for each protocol type
- **Copy to clipboard**: Easy copying of conversion results

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Hyperlane**: @hyperlane-xyz/utils v27.0.0

## Project Structure

```
hyperlane-tools/
├── app/
│   ├── tools/
│   │   └── address-converter/    # Address converter tool
│   │       └── page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page with tools grid
│   └── globals.css               # Global styles
├── public/                        # Static assets
└── package.json
```

## Adding New Tools

1. Create a new directory in `app/tools/[tool-name]/`
2. Add a `page.tsx` file with your tool component
3. Add the tool metadata to the `tools` array in `app/page.tsx`

Example:

```typescript
// app/page.tsx
const tools = [
  // ... existing tools
  {
    id: "new-tool",
    title: "New Tool",
    description: "Description of what the tool does",
    href: "/tools/new-tool",
    category: "Category",
  },
];
```

## Known Issues

### Address Converter
- **Tron support disabled**: Tron address conversion is currently disabled due to a bug in `@hyperlane-xyz/utils` v27.0.0 (Error: "Argument must be a Buffer"). Will be re-enabled when the library is updated.

## Contributing

Feel free to add more tools and features! Some ideas:
- Message ID calculator
- Validator signature verifier
- Domain ID converter
- Gas price calculator
- Merkle proof generator
- Chain configuration viewer
- And more!

## License

MIT

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
