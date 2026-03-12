'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  addressToBytes32,
  bytes32ToAddress,
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
  // Error: "Argument must be a Buffer" when converting Tron addresses
  // { value: ProtocolType.Tron, label: 'Tron' },
];

export default function AddressConverter() {
  const [input, setInput] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>(ProtocolType.Ethereum);
  const [targetProtocol, setTargetProtocol] = useState<ProtocolType>(ProtocolType.Ethereum);
  const [prefix, setPrefix] = useState('');
  const [detectedProtocol, setDetectedProtocol] = useState<string>('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [inputType, setInputType] = useState<'address' | 'bytes32' | 'unknown'>('unknown');

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      setDetectedProtocol('');
      setInputType('unknown');
      return;
    }

    try {
      // Detect if input is bytes32 (0x followed by 64 hex characters)
      const bytes32Pattern = /^0x[0-9a-fA-F]{64}$/;
      const isByte32 = bytes32Pattern.test(input.trim());

      if (isByte32) {
        setInputType('bytes32');
        setDetectedProtocol('N/A (bytes32 format)');

        // Convert hex string to bytes
        const hexStr = strip0x(input.trim());
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
        const address = bytesToProtocolAddress(addressBytes, targetProtocol, prefix || undefined);
        setOutput(address);
        setError('');
      } else {
        setInputType('address');

        // Try to detect protocol type
        const detectedType = getAddressProtocolType(input.trim());
        if (detectedType) {
          setDetectedProtocol(detectedType);
          setSelectedProtocol(detectedType);
        } else {
          setDetectedProtocol('Unknown (using selected protocol)');
        }

        // Validate address for the selected protocol
        if (isValidAddress(input.trim(), selectedProtocol)) {
          try {
            const bytes32 = addressToBytes32(input.trim(), selectedProtocol);
            setOutput(bytes32);
            setError('');
          } catch (conversionErr) {
            setOutput('');
            setError(
              `Error converting ${selectedProtocol} address: ${
                conversionErr instanceof Error ? conversionErr.message : 'Unknown error'
              }`
            );
          }
        } else {
          setOutput('');
          setError(`Invalid address for ${selectedProtocol} protocol`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion error');
      setOutput('');
    }
  }, [input, selectedProtocol, targetProtocol, prefix]);

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
            Address Converter
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Convert between address formats and bytes32 with protocol type detection
          </p>
        </div>

        {/* Main Converter Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Input (Address or Bytes32)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter an address (e.g., 0x1234...) or bytes32 (0x0000...)"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Protocol Selection for Address Input */}
            {inputType === 'address' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Source Protocol Type
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
                {detectedProtocol && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Detected: <span className="font-medium">{detectedProtocol}</span>
                  </p>
                )}
              </div>
            )}

            {/* Protocol Selection for Bytes32 Input */}
            {inputType === 'bytes32' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Target Protocol Type
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
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Select the protocol format for the output address
                  </p>
                </div>

                {/* Prefix input for Cosmos and Radix */}
                {(targetProtocol === ProtocolType.Cosmos ||
                  targetProtocol === ProtocolType.CosmosNative ||
                  targetProtocol === ProtocolType.Radix) && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Address Prefix {targetProtocol === ProtocolType.Radix ? '(optional)' : '(required for Cosmos)'}
                    </label>
                    <input
                      type="text"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder={
                        targetProtocol === ProtocolType.Cosmos || targetProtocol === ProtocolType.CosmosNative
                          ? 'e.g., cosmos, osmo, neutron'
                          : 'e.g., rdx (optional)'
                      }
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {targetProtocol === ProtocolType.Cosmos || targetProtocol === ProtocolType.CosmosNative
                        ? 'Enter the chain-specific prefix (e.g., "cosmos" for Cosmos Hub)'
                        : 'Optionally specify a custom prefix for Radix addresses'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Info Display */}
            {inputType !== 'unknown' && (
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
                    <p className="font-medium mb-1">
                      Input Type: {inputType === 'address' ? 'Address' : 'Bytes32'}
                    </p>
                    <p>
                      {inputType === 'address'
                        ? `Converting ${selectedProtocol} address to bytes32`
                        : `Converting bytes32 to ${targetProtocol} address${
                            (targetProtocol === ProtocolType.Cosmos ||
                              targetProtocol === ProtocolType.CosmosNative ||
                              targetProtocol === ProtocolType.Radix) &&
                            prefix
                              ? ` with prefix "${prefix}"`
                              : ''
                          }`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Output Section */}
            {output && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Output ({inputType === 'address' ? 'Bytes32' : `${targetProtocol} Address`})
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

        {/* Examples */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Examples
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Address to Bytes32
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Ethereum:</p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    0x1234567890123456789012345678901234567890
                  </code>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Solana:</p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    So11111111111111111111111111111111111111112
                  </code>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Bytes32 to Address
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Bytes32 (can convert to any protocol):</p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded break-all">
                    0x0000000000000000000000001234567890123456789012345678901234567890
                  </code>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <p>💡 Tip: When converting from bytes32, select your target protocol from the dropdown.</p>
                  <p className="mt-1">For Cosmos chains, you'll need to specify a prefix (e.g., "cosmos", "osmo", "neutron").</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
