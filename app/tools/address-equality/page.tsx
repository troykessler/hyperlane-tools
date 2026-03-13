'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAddressProtocolType,
  normalizeAddress,
  isValidAddress,
  addressToBytes32,
} from '@hyperlane-xyz/utils';
import { ProtocolType } from '@hyperlane-xyz/utils';

export default function AddressEquality() {
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [result, setResult] = useState<{
    equal: boolean;
    protocol1?: ProtocolType;
    protocol2?: ProtocolType;
    normalized1?: string;
    normalized2?: string;
    bytes32_1?: string;
    bytes32_2?: string;
    valid1: boolean;
    valid2: boolean;
  } | null>(null);

  useEffect(() => {
    if (!address1.trim() || !address2.trim()) {
      setResult(null);
      return;
    }

    try {
      const protocol1 = getAddressProtocolType(address1);
      const protocol2 = getAddressProtocolType(address2);

      const valid1 = isValidAddress(address1, protocol1);
      const valid2 = isValidAddress(address2, protocol2);

      let normalized1: string | undefined;
      let normalized2: string | undefined;
      let bytes32_1: string | undefined;
      let bytes32_2: string | undefined;
      let equal = false;

      if (valid1 && protocol1) {
        normalized1 = normalizeAddress(address1, protocol1);
        bytes32_1 = addressToBytes32(address1, protocol1);
      }

      if (valid2 && protocol2) {
        normalized2 = normalizeAddress(address2, protocol2);
        bytes32_2 = addressToBytes32(address2, protocol2);
      }

      if (valid1 && valid2 && bytes32_1 && bytes32_2) {
        // Compare by bytes32 representation - works across protocols
        equal = bytes32_1.toLowerCase() === bytes32_2.toLowerCase();
      }

      setResult({
        equal,
        protocol1,
        protocol2,
        normalized1,
        normalized2,
        bytes32_1,
        bytes32_2,
        valid1,
        valid2,
      });
    } catch (err) {
      setResult({
        equal: false,
        valid1: false,
        valid2: false,
      });
    }
  }, [address1, address2]);

  const getProtocolLabel = (protocol?: ProtocolType): string => {
    if (!protocol) return 'Unknown';
    const labels: Record<ProtocolType, string> = {
      [ProtocolType.Ethereum]: 'Ethereum (EVM)',
      [ProtocolType.Sealevel]: 'Solana (Sealevel)',
      [ProtocolType.Cosmos]: 'Cosmos',
      [ProtocolType.CosmosNative]: 'Cosmos Native',
      [ProtocolType.Starknet]: 'Starknet',
      [ProtocolType.Radix]: 'Radix',
      [ProtocolType.Aleo]: 'Aleo',
      [ProtocolType.Tron]: 'Tron',
    };
    return labels[protocol] || protocol;
  };

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
            Address Equality Checker
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Compare two blockchain addresses to check if they are equal
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="space-y-6">
            {/* Address 1 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Address 1
              </label>
              <textarea
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Enter first address..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Address 2 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Address 2
              </label>
              <textarea
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Enter second address..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-6">
            {/* Equality Result */}
            <div className={`rounded-lg shadow-sm border p-6 ${
              result.equal
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-3">
                {result.equal ? (
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <div>
                  <h2 className={`text-xl font-semibold ${
                    result.equal
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {result.equal ? 'Addresses are Equal' : 'Addresses are Not Equal'}
                  </h2>
                  <p className={`text-sm ${
                    result.equal
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.equal
                      ? 'Both addresses have the same underlying bytes32 representation'
                      : 'These addresses have different underlying bytes32 representations'}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address 1 Details */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Address 1 Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Valid
                    </p>
                    <p className={`text-sm font-mono ${
                      result.valid1
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.valid1 ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Protocol
                    </p>
                    <p className="text-sm font-mono text-slate-900 dark:text-white">
                      {getProtocolLabel(result.protocol1)}
                    </p>
                  </div>
                  {result.normalized1 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Normalized
                        </p>
                        <button
                          onClick={() => copyToClipboard(result.normalized1!)}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-sm font-mono text-slate-900 dark:text-white break-all bg-slate-50 dark:bg-slate-900 p-2 rounded">
                        {result.normalized1}
                      </p>
                    </div>
                  )}
                  {result.bytes32_1 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Bytes32
                        </p>
                        <button
                          onClick={() => copyToClipboard(result.bytes32_1!)}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-sm font-mono text-slate-900 dark:text-white break-all bg-slate-50 dark:bg-slate-900 p-2 rounded">
                        {result.bytes32_1}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address 2 Details */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Address 2 Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Valid
                    </p>
                    <p className={`text-sm font-mono ${
                      result.valid2
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.valid2 ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Protocol
                    </p>
                    <p className="text-sm font-mono text-slate-900 dark:text-white">
                      {getProtocolLabel(result.protocol2)}
                    </p>
                  </div>
                  {result.normalized2 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Normalized
                        </p>
                        <button
                          onClick={() => copyToClipboard(result.normalized2!)}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-sm font-mono text-slate-900 dark:text-white break-all bg-slate-50 dark:bg-slate-900 p-2 rounded">
                        {result.normalized2}
                      </p>
                    </div>
                  )}
                  {result.bytes32_2 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Bytes32
                        </p>
                        <button
                          onClick={() => copyToClipboard(result.bytes32_2!)}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-sm font-mono text-slate-900 dark:text-white break-all bg-slate-50 dark:bg-slate-900 p-2 rounded">
                        {result.bytes32_2}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            About Address Equality
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              This tool compares two blockchain addresses to determine if they represent the same address.
              It supports multiple blockchain protocols including Ethereum, Solana, Cosmos, and more.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">How it works:</strong>
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Automatically detects the protocol type for each address</li>
              <li>Validates addresses according to their protocol standards</li>
              <li>Normalizes addresses to their protocol-specific format</li>
              <li>Converts both addresses to bytes32 representation</li>
              <li>Compares the bytes32 values for equality</li>
            </ul>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Cross-Protocol Support:</strong> This tool
              compares addresses by their underlying bytes32 representation, so the same address formatted for
              different protocols (e.g., an EVM address vs the same bytes as a Cosmos address) will be detected
              as equal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
