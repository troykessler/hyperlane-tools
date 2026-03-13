import { Tool } from '@/types';

export const tools: Tool[] = [
  {
    id: 'address-converter',
    title: 'Address Converter',
    description: 'Convert between address formats and bytes32 with protocol type',
    href: '/tools/address-converter',
    category: 'Encoding',
  },
  {
    id: 'bech32-converter',
    title: 'Bech32 Converter',
    description: 'Convert bech32 addresses between different chain prefixes',
    href: '/tools/bech32-converter',
    category: 'Encoding',
  },
  {
    id: 'bech32m-converter',
    title: 'Bech32m Converter',
    description: 'Convert bech32m addresses between different chain prefixes',
    href: '/tools/bech32m-converter',
    category: 'Encoding',
  },
  {
    id: 'hash-text',
    title: 'Hash Text',
    description: 'Hash text strings using MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3, or RIPEMD160',
    href: '/tools/hash-text',
    category: 'Encoding',
  },
  {
    id: 'token-generator',
    title: 'Token Generator',
    description: 'Generate random tokens with customizable length and character types',
    href: '/tools/token-generator',
    category: 'Utilities',
  },
  {
    id: 'hyperlane-message',
    title: 'Hyperlane Message',
    description: 'Encode, decode, and analyze Hyperlane messages and metadata',
    href: '/tools/hyperlane-message',
    category: 'Encoding',
  },
  {
    id: 'address-generator',
    title: 'Address Generator',
    description: 'Generate random addresses for different blockchain protocols',
    href: '/tools/address-generator',
    category: 'Utilities',
  },
  {
    id: 'eth-unit-converter',
    title: 'Ethereum Unit Converter',
    description: 'Convert between Wei, Gwei, Ether, and other Ethereum denominations',
    href: '/tools/eth-unit-converter',
    category: 'Utilities',
  },
  // Add more tools here as they are developed
];
