import { Tool } from '@/types';

export const tools: Tool[] = [
  {
    id: 'address-converter',
    title: 'Address Protocol Converter',
    description: 'Convert addresses between different blockchain protocols',
    href: '/tools/address-converter',
    category: 'Hyperlane Addresses',
  },
  {
    id: 'address-bytes32-converter',
    title: 'Address & Bytes32 Converter',
    description: 'Convert between address formats and bytes32 representation',
    href: '/tools/address-bytes32-converter',
    category: 'Hyperlane Addresses',
  },
  {
    id: 'address-equality',
    title: 'Address Equality Checker',
    description: 'Compare two blockchain addresses to check if they are equal',
    href: '/tools/address-equality',
    category: 'Hyperlane Addresses',
  },
  {
    id: 'hyperlane-message',
    title: 'Hyperlane Message',
    description: 'Encode, decode, and analyze Hyperlane messages and metadata',
    href: '/tools/hyperlane-message',
    category: 'Hyperlane Messages',
  },
  {
    id: 'domain-id-generator',
    title: 'Domain ID Generator',
    description: 'Generate Hyperlane domain IDs from chain names',
    href: '/tools/domain-id-generator',
    category: 'Hyperlane Messages',
  },
  {
    id: 'warp-transfer-message',
    title: 'Warp Transfer Message',
    description: 'Encode and decode Hyperlane Warp Route token transfer messages',
    href: '/tools/warp-transfer-message',
    category: 'Hyperlane Messages',
  },
  {
    id: 'bech32-converter',
    title: 'Bech32 Converter',
    description: 'Convert bech32 addresses between different chain prefixes',
    href: '/tools/bech32-converter',
    category: 'Crypto Utils',
  },
  {
    id: 'bech32m-converter',
    title: 'Bech32m Converter',
    description: 'Convert bech32m addresses between different chain prefixes',
    href: '/tools/bech32m-converter',
    category: 'Crypto Utils',
  },
  {
    id: 'hash-text',
    title: 'Hash Text',
    description: 'Hash text strings using MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3, or RIPEMD160',
    href: '/tools/hash-text',
    category: 'Crypto Utils',
  },
  {
    id: 'token-generator',
    title: 'Token Generator',
    description: 'Generate random tokens with customizable length and character types',
    href: '/tools/token-generator',
    category: 'Crypto Utils',
  },
  {
    id: 'address-generator',
    title: 'Address Generator',
    description: 'Generate random addresses for different blockchain protocols',
    href: '/tools/address-generator',
    category: 'Crypto Utils',
  },
  {
    id: 'eth-unit-converter',
    title: 'Ethereum Unit Converter',
    description: 'Convert between Wei, Gwei, Ether, and other Ethereum denominations',
    href: '/tools/eth-unit-converter',
    category: 'Crypto Utils',
  },
  // Add more tools here as they are developed
];
