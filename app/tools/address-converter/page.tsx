'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  addressToBytes32,
  getAddressProtocolType,
  isValidAddress,
  ProtocolType,
  bytesToProtocolAddress,
  strip0x,
} from '@hyperlane-xyz/utils';

const protocolOptions = [
  { value: ProtocolType.Ethereum, label: 'Ethereum (EVM)' },
  { value: ProtocolType.Sealevel, label: 'Sealevel (Solana)' },
  { value: ProtocolType.Cosmos, label: 'Cosmos' },
  { value: ProtocolType.CosmosNative, label: 'Cosmos Native' },
  { value: ProtocolType.Starknet, label: 'Starknet' },
  { value: ProtocolType.Radix, label: 'Radix' },
  { value: ProtocolType.Aleo, label: 'Aleo' },
  // Tron temporarily disabled due to bug in @hyperlane-xyz/utils v27.0.0
  // { value: ProtocolType.Tron, label: 'Tron' },
];

export default function AddressConverter() {
  const [input, setInput] = useState('');
  const [sourceProtocol, setSourceProtocol] = useState<ProtocolType>(ProtocolType.Ethereum);
  const [targetProtocol, setTargetProtocol] = useState<ProtocolType>(ProtocolType.Sealevel);
  const [targetPrefix, setTargetPrefix] = useState('');
  const [detectedProtocol, setDetectedProtocol] = useState<ProtocolType | undefined>();
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [bytes32, setBytes32] = useState('');

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      setDetectedProtocol(undefined);
      setBytes32('');
      return;
    }

    try {
      // Try to detect protocol type
      const detected = getAddressProtocolType(input.trim());
      setDetectedProtocol(detected);

      // Use detected protocol if available, otherwise use selected
      const actualSourceProtocol = detected || sourceProtocol;

      // Validate address
      if (!isValidAddress(input.trim(), actualSourceProtocol)) {
        setOutput('');
        setError(`Invalid address for ${actualSourceProtocol} protocol`);
        setBytes32('');
        return;
      }

      // Convert to bytes32
      const bytes32Result = addressToBytes32(input.trim(), actualSourceProtocol);
      setBytes32(bytes32Result);

      // Convert bytes32 to target protocol
      const hexStr = strip0x(bytes32Result);
      const fullBytes = new Uint8Array(hexStr.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      // Different protocols use different address lengths:
      // - EVM-like (Ethereum, Cosmos): 20 bytes (last 20 bytes of bytes32)
      // - 32-byte addresses (Solana, Starknet, Aleo, Radix): 32 bytes (all bytes)
      const use32Bytes = [
        ProtocolType.Sealevel,
        ProtocolType.Starknet,
        ProtocolType.Aleo,
        ProtocolType.Radix,
      ].includes(targetProtocol);

      const addressBytes = use32Bytes ? fullBytes : fullBytes.slice(-20);

      // Convert to the target protocol address
      const targetAddress = bytesToProtocolAddress(
        addressBytes,
        targetProtocol,
        targetPrefix || undefined
      );
      setOutput(targetAddress);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion error');
      setOutput('');
      setBytes32('');
    }
  }, [input, sourceProtocol, targetProtocol, targetPrefix]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getProtocolLabel = (protocol: ProtocolType): string => {
    return protocolOptions.find(opt => opt.value === protocol)?.label || protocol;
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
            Address Protocol Converter
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Convert addresses between different blockchain protocols
          </p>
        </div>

        {/* Main Converter Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Source Address
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter an address (e.g., 0x1234..., So11111..., cosmos1...)"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              {detectedProtocol && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Detected protocol: <span className="font-medium">{getProtocolLabel(detectedProtocol)}</span>
                </p>
              )}
            </div>

            {/* Target Protocol Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target Protocol
              </label>
              <select
                value={targetProtocol}
                onChange={(e) => setTargetProtocol(e.target.value as ProtocolType)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {protocolOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Prefix for Cosmos and Radix */}
            {(targetProtocol === ProtocolType.Cosmos ||
              targetProtocol === ProtocolType.CosmosNative ||
              targetProtocol === ProtocolType.Radix) && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Target Address Prefix{' '}
                  {targetProtocol === ProtocolType.Radix ? '(optional)' : '(required)'}
                </label>
                <input
                  type="text"
                  value={targetPrefix}
                  onChange={(e) => setTargetPrefix(e.target.value)}
                  placeholder={
                    targetProtocol === ProtocolType.Cosmos ||
                    targetProtocol === ProtocolType.CosmosNative
                      ? 'e.g., cosmos, osmo, neutron'
                      : 'e.g., rdx (optional)'
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {targetProtocol === ProtocolType.Cosmos ||
                  targetProtocol === ProtocolType.CosmosNative
                    ? 'Enter the chain-specific prefix (e.g., "cosmos" for Cosmos Hub, "osmo" for Osmosis)'
                    : 'Optionally specify a custom prefix for Radix addresses'}
                </p>
              </div>
            )}

            {/* Conversion Info */}
            {input && !error && (
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
                    <p className="font-medium mb-1">Conversion Process</p>
                    <p>
                      Converting {getProtocolLabel(detectedProtocol || sourceProtocol)} address →{' '}
                      {getProtocolLabel(targetProtocol)} address
                    </p>
                    {bytes32 && (
                      <p className="mt-2 font-mono text-xs break-all">
                        Intermediate bytes32: {bytes32}
                      </p>
                    )}
                    <p className="mt-2 text-xs">
                      <strong>Note:</strong> {[ProtocolType.Sealevel, ProtocolType.Starknet, ProtocolType.Aleo, ProtocolType.Radix].includes(targetProtocol)
                        ? `${getProtocolLabel(targetProtocol)} uses all 32 bytes`
                        : `${getProtocolLabel(targetProtocol)} uses the last 20 bytes`
                      } of the bytes32 representation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Output Section */}
            {output && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Converted Address ({getProtocolLabel(targetProtocol)})
                </label>
                <div className="relative">
                  <textarea
                    value={output}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm resize-none"
                    rows={3}
                  />
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              This tool converts addresses between different blockchain protocols by converting the source
              address to its bytes32 representation, then reformatting those bytes for the target protocol.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Note:</strong> This maintains the
              underlying cryptographic identifier while changing the address format. The resulting address
              will have the same bytes32 representation as the original.
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>20-byte protocols (Ethereum, Cosmos): Use the last 20 bytes of the bytes32</li>
              <li>32-byte protocols (Solana, Starknet, Aleo, Radix): Use all 32 bytes</li>
              <li>Cosmos chains require a chain-specific prefix (e.g., "cosmos", "osmo")</li>
            </ul>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Examples</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Ethereum → Cosmos
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Input:</p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    0x1234567890123456789012345678901234567890
                  </code>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Output (with prefix "cosmos"):
                  </p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    cosmos1zg69v7yszg69v7yszg69v7yszg69v7ys8xdv96
                  </code>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Solana → Ethereum
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Input:</p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    So11111111111111111111111111111111111111112
                  </code>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Output (uses last 20 bytes):
                  </p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    0x...
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
