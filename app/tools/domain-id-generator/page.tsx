'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DomainIdGenerator() {
  const [chainName, setChainName] = useState('');
  const [result, setResult] = useState<{
    hex: string;
    domainId: string;
    bytes: string;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!chainName.trim()) {
      setResult(null);
      setError('');
      return;
    }

    try {
      // Convert chain name to bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(chainName.trim());

      // Convert to hex string
      const hexString = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Convert to BigInt to avoid precision issues
      const domainIdBigInt = BigInt('0x' + hexString);

      setResult({
        hex: '0x' + hexString,
        domainId: domainIdBigInt.toString(),
        bytes: Array.from(bytes).join(', '),
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion error');
      setResult(null);
    }
  }, [chainName]);

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
            Domain ID Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Generate Hyperlane domain IDs from chain names
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="space-y-6">
            {/* Chain Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Chain Name
              </label>
              <input
                type="text"
                value={chainName}
                onChange={(e) => setChainName(e.target.value)}
                placeholder="Enter chain name (e.g., KYVE, ethereum, polygon)"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {/* Hex Representation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Hex Representation
                    </label>
                    <button
                      onClick={() => copyToClipboard(result.hex)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all">
                    {result.hex}
                  </div>
                </div>

                {/* Domain ID */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Domain ID (Decimal)
                    </label>
                    <button
                      onClick={() => copyToClipboard(result.domainId)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all">
                    {result.domainId}
                  </div>
                </div>

                {/* Byte Array */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Byte Array
                  </label>
                  <div className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs break-all">
                    [{result.bytes}]
                  </div>
                </div>

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
                      <p className="font-medium mb-1">Conversion Process</p>
                      <p>
                        The chain name "{chainName}" is converted to UTF-8 bytes, then interpreted as a
                        hexadecimal number to generate the domain ID. BigInt is used to avoid precision loss
                        for longer chain names.
                      </p>
                    </div>
                  </div>
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
              This tool generates Hyperlane domain IDs by converting chain names to their numeric representation.
              The process is deterministic, meaning the same chain name will always produce the same domain ID.
            </p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>Convert the chain name to UTF-8 bytes</li>
              <li>Interpret the bytes as a hexadecimal number</li>
              <li>Convert the hex number to decimal to get the domain ID</li>
            </ol>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Note:</strong> BigInt is used for conversion
              to ensure no precision is lost, even for longer chain names that would exceed JavaScript's safe
              integer range (2<sup>53</sup> - 1).
            </p>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Examples</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Chain Name</p>
                <code className="text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                  KYVE
                </code>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Domain ID</p>
                <code className="text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                  1263747845
                </code>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Chain Name</p>
                <code className="text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                  ethereum
                </code>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Domain ID</p>
                <code className="text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded break-all">
                  31337511839568927
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
