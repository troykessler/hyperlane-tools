'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bytesToProtocolAddress, ProtocolType } from '@hyperlane-xyz/utils';

const protocolOptions = [
  { value: ProtocolType.Ethereum, label: 'Ethereum (EVM)', needsPrefix: false, bytesLength: 20 },
  { value: ProtocolType.Sealevel, label: 'Sealevel (Solana)', needsPrefix: false, bytesLength: 32 },
  { value: ProtocolType.Cosmos, label: 'Cosmos', needsPrefix: true, bytesLength: 20, defaultPrefix: 'cosmos' },
  { value: ProtocolType.CosmosNative, label: 'Cosmos Native', needsPrefix: true, bytesLength: 20, defaultPrefix: 'cosmos' },
  { value: ProtocolType.Starknet, label: 'Starknet', needsPrefix: false, bytesLength: 32 },
  { value: ProtocolType.Radix, label: 'Radix', needsPrefix: true, bytesLength: 32, defaultPrefix: 'account_rdx' },
  { value: ProtocolType.Aleo, label: 'Aleo', needsPrefix: false, bytesLength: 32 },
];

export default function AddressGenerator() {
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>(ProtocolType.Ethereum);
  const [prefix, setPrefix] = useState('');
  const [generatedAddress, setGeneratedAddress] = useState('');

  const selectedOption = protocolOptions.find(opt => opt.value === selectedProtocol);

  const generateAddress = () => {
    try {
      const option = protocolOptions.find(opt => opt.value === selectedProtocol);
      if (!option) return;

      // Generate random bytes
      const randomBytes = new Uint8Array(option.bytesLength);
      window.crypto.getRandomValues(randomBytes);

      // Convert to protocol-specific address
      const prefixToUse = option.needsPrefix && prefix ? prefix : option.defaultPrefix;
      const address = bytesToProtocolAddress(randomBytes, selectedProtocol, prefixToUse);

      setGeneratedAddress(address);
    } catch (err) {
      setGeneratedAddress('Error generating address: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  useEffect(() => {
    // Set default prefix when protocol changes
    const option = protocolOptions.find(opt => opt.value === selectedProtocol);
    if (option?.needsPrefix && option.defaultPrefix) {
      setPrefix(option.defaultPrefix);
    }
    generateAddress();
  }, [selectedProtocol]);

  useEffect(() => {
    // Regenerate when prefix changes
    if (selectedOption?.needsPrefix) {
      generateAddress();
    }
  }, [prefix]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back to tools
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Address Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Generate random addresses for different blockchain protocols
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="space-y-6">
            {/* Protocol Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Protocol Type
              </label>
              <select
                value={selectedProtocol}
                onChange={(e) => setSelectedProtocol(e.target.value as ProtocolType)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {protocolOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prefix Input (for Cosmos and Radix) */}
            {selectedOption?.needsPrefix && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Address Prefix
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toLowerCase())}
                  placeholder={selectedOption.defaultPrefix}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {selectedProtocol === ProtocolType.Cosmos || selectedProtocol === ProtocolType.CosmosNative
                    ? 'Enter the chain-specific prefix (e.g., "cosmos", "osmo", "neutron")'
                    : 'Optionally specify a custom prefix for Radix addresses'}
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Random Address Generation</p>
                  <p>
                    Generates cryptographically secure random addresses using the Web Crypto API.
                    These are valid address formats but <strong>do not</strong> have associated private keys.
                  </p>
                </div>
              </div>
            </div>

            {/* Generated Address Output */}
            {generatedAddress && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Generated Address
                </label>
                <div className="relative">
                  <div className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all">
                    {generatedAddress}
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedAddress)}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <button
                  onClick={generateAddress}
                  className="mt-3 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Generate New Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Protocol Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Supported Protocols
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Ethereum (EVM):</strong> 20-byte addresses for Ethereum and EVM-compatible chains
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Solana (Sealevel):</strong> 32-byte base58-encoded addresses
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Cosmos:</strong> Bech32-encoded addresses with customizable prefix
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Starknet:</strong> 32-byte addresses for Starknet
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Radix:</strong> Addresses with optional custom prefix
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Aleo:</strong> Addresses for Aleo network
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
              ⚠️ Warning: These are randomly generated addresses for testing purposes only. They do not have associated private keys and should never be used to receive real funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
