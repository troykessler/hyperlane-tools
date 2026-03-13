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

type TabType = 'encode' | 'decode';

export default function AddressBytes32Converter() {
  const [activeTab, setActiveTab] = useState<TabType>('encode');

  // Encode tab state (Address → Bytes32)
  const [encodeInput, setEncodeInput] = useState('');
  const [encodeProtocol, setEncodeProtocol] = useState<ProtocolType>(ProtocolType.Ethereum);
  const [encodeDetectedProtocol, setEncodeDetectedProtocol] = useState<ProtocolType | undefined>();
  const [encodeOutput, setEncodeOutput] = useState('');
  const [encodeError, setEncodeError] = useState('');

  // Decode tab state (Bytes32 → Address)
  const [decodeInput, setDecodeInput] = useState('');
  const [decodeProtocol, setDecodeProtocol] = useState<ProtocolType>(ProtocolType.Ethereum);
  const [decodePrefix, setDecodePrefix] = useState('');
  const [decodeOutput, setDecodeOutput] = useState('');
  const [decodeError, setDecodeError] = useState('');

  // Encode: Address → Bytes32
  useEffect(() => {
    if (!encodeInput.trim()) {
      setEncodeOutput('');
      setEncodeError('');
      setEncodeDetectedProtocol(undefined);
      return;
    }

    try {
      // Try to detect protocol type
      const detected = getAddressProtocolType(encodeInput.trim());
      setEncodeDetectedProtocol(detected);

      // Use detected protocol if available, otherwise use selected
      const actualProtocol = detected || encodeProtocol;

      // Validate address
      if (!isValidAddress(encodeInput.trim(), actualProtocol)) {
        setEncodeOutput('');
        setEncodeError(`Invalid address for ${actualProtocol} protocol`);
        return;
      }

      // Convert to bytes32
      const bytes32 = addressToBytes32(encodeInput.trim(), actualProtocol);
      setEncodeOutput(bytes32);
      setEncodeError('');
    } catch (err) {
      setEncodeError(err instanceof Error ? err.message : 'Conversion error');
      setEncodeOutput('');
    }
  }, [encodeInput, encodeProtocol]);

  // Decode: Bytes32 → Address
  useEffect(() => {
    if (!decodeInput.trim()) {
      setDecodeOutput('');
      setDecodeError('');
      return;
    }

    try {
      // Validate bytes32 format (0x followed by 64 hex characters)
      const bytes32Pattern = /^0x[0-9a-fA-F]{64}$/;
      if (!bytes32Pattern.test(decodeInput.trim())) {
        setDecodeOutput('');
        setDecodeError('Invalid bytes32 format. Expected 0x followed by 64 hexadecimal characters.');
        return;
      }

      // Convert hex string to bytes
      const hexStr = strip0x(decodeInput.trim());
      const fullBytes = new Uint8Array(hexStr.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      // Different protocols use different address lengths:
      // - EVM-like (Ethereum, Cosmos): 20 bytes (last 20 bytes of bytes32)
      // - 32-byte addresses (Solana, Starknet, Aleo, Radix): 32 bytes (all bytes)
      const use32Bytes = [
        ProtocolType.Sealevel,
        ProtocolType.Starknet,
        ProtocolType.Aleo,
        ProtocolType.Radix,
      ].includes(decodeProtocol);

      const addressBytes = use32Bytes ? fullBytes : fullBytes.slice(-20);

      // Convert to the target protocol address
      const address = bytesToProtocolAddress(addressBytes, decodeProtocol, decodePrefix || undefined);
      setDecodeOutput(address);
      setDecodeError('');
    } catch (err) {
      setDecodeError(err instanceof Error ? err.message : 'Conversion error');
      setDecodeOutput('');
    }
  }, [decodeInput, decodeProtocol, decodePrefix]);

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
            Address & Bytes32 Converter
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Convert between address formats and bytes32 representation
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'encode', label: 'Encode (Address → Bytes32)' },
            { id: 'decode', label: 'Decode (Bytes32 → Address)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          {/* Encode Tab */}
          {activeTab === 'encode' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Address
                </label>
                <textarea
                  value={encodeInput}
                  onChange={(e) => setEncodeInput(e.target.value)}
                  placeholder="Enter an address (e.g., 0x1234..., So11111..., cosmos1...)"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                {encodeDetectedProtocol && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Detected protocol: <span className="font-medium">{getProtocolLabel(encodeDetectedProtocol)}</span>
                  </p>
                )}
              </div>

              {encodeOutput && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Bytes32 Output
                  </label>
                  <div className="relative">
                    <textarea
                      value={encodeOutput}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => copyToClipboard(encodeOutput)}
                      className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {encodeError && (
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
                    <p className="text-sm text-red-800 dark:text-red-200">{encodeError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Decode Tab */}
          {activeTab === 'decode' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bytes32
                </label>
                <textarea
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                  placeholder="Enter bytes32 (0x followed by 64 hex characters)"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Target Protocol Type
                </label>
                <select
                  value={decodeProtocol}
                  onChange={(e) => setDecodeProtocol(e.target.value as ProtocolType)}
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

              {/* Byte Length Info */}
              {decodeInput && (
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
                      <p className="font-medium mb-1">Conversion Info</p>
                      <p>
                        <strong>Note:</strong> {[ProtocolType.Sealevel, ProtocolType.Starknet, ProtocolType.Aleo, ProtocolType.Radix].includes(decodeProtocol)
                          ? `${getProtocolLabel(decodeProtocol)} uses all 32 bytes`
                          : `${getProtocolLabel(decodeProtocol)} uses the last 20 bytes`
                        } of the bytes32 representation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Prefix input for Cosmos and Radix */}
              {(decodeProtocol === ProtocolType.Cosmos ||
                decodeProtocol === ProtocolType.CosmosNative ||
                decodeProtocol === ProtocolType.Radix) && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Address Prefix {decodeProtocol === ProtocolType.Radix ? '(optional)' : '(required)'}
                  </label>
                  <input
                    type="text"
                    value={decodePrefix}
                    onChange={(e) => setDecodePrefix(e.target.value)}
                    placeholder={
                      decodeProtocol === ProtocolType.Cosmos || decodeProtocol === ProtocolType.CosmosNative
                        ? 'e.g., cosmos, osmo, neutron'
                        : 'e.g., rdx (optional)'
                    }
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {decodeProtocol === ProtocolType.Cosmos || decodeProtocol === ProtocolType.CosmosNative
                      ? 'Enter the chain-specific prefix (e.g., "cosmos" for Cosmos Hub, "osmo" for Osmosis)'
                      : 'Optionally specify a custom prefix for Radix addresses'}
                  </p>
                </div>
              )}

              {decodeOutput && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Address Output ({getProtocolLabel(decodeProtocol)})
                  </label>
                  <div className="relative">
                    <textarea
                      value={decodeOutput}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => copyToClipboard(decodeOutput)}
                      className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {decodeError && (
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
                    <p className="text-sm text-red-800 dark:text-red-200">{decodeError}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Encode (Address → Bytes32):</strong> Converts
              any blockchain address to its bytes32 representation. The protocol type is automatically detected
              when possible.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Decode (Bytes32 → Address):</strong> Converts
              a bytes32 value to an address in the specified protocol format.
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
                Encode: Address to Bytes32
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
                Decode: Bytes32 to Address
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Bytes32:</p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded break-all">
                    0x0000000000000000000000001234567890123456789012345678901234567890
                  </code>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <p>💡 Tip: Select your target protocol and specify a prefix for Cosmos chains.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
