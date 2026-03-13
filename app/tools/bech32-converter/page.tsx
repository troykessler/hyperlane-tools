'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bech32 } from 'bech32';

export default function Bech32Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [hexOutput, setHexOutput] = useState('');
  const [error, setError] = useState('');
  const [sourceHrp, setSourceHrp] = useState('');
  const [targetHrp, setTargetHrp] = useState('');

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setHexOutput('');
      setError('');
      setSourceHrp('');
      return;
    }

    try {
      // Detect bech32 format
      const bech32Pattern = /^[a-z]+1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/;

      if (!bech32Pattern.test(input.trim())) {
        setError('Invalid bech32 address format');
        setOutput('');
        setHexOutput('');
        setSourceHrp('');
        return;
      }

      // Decode the input bech32 address
      const decoded = bech32.decode(input.trim());
      setSourceHrp(decoded.prefix);

      // Convert to bytes
      const bytes = bech32.fromWords(decoded.words);
      const hex = '0x' + Buffer.from(bytes).toString('hex');
      setHexOutput(hex);

      // Validate target HRP
      if (!targetHrp.trim()) {
        setOutput('');
        setError('');
        return;
      }

      const hrpPattern = /^[a-z]+$/;
      if (!hrpPattern.test(targetHrp.trim())) {
        setError('Target prefix must contain only lowercase letters');
        setOutput('');
        return;
      }

      // Re-encode with target HRP
      const encoded = bech32.encode(targetHrp.trim(), decoded.words);
      setOutput(encoded);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion error');
      setOutput('');
      setHexOutput('');
      setSourceHrp('');
    }
  }, [input, targetHrp]);

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
            Bech32 Converter
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Convert bech32 addresses between different chain prefixes
          </p>
        </div>

        {/* Main Converter Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Source Bech32 Address
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a bech32 address (e.g., cosmos1zg69v7yszg69v7yszg69v7yszg69v7ys8xdv96)"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              {sourceHrp && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Detected prefix: <span className="font-medium">{sourceHrp}</span>
                </p>
              )}
            </div>

            {/* Target HRP Input */}
            {sourceHrp && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Target Prefix (HRP)
                </label>
                <input
                  type="text"
                  value={targetHrp}
                  onChange={(e) => setTargetHrp(e.target.value.toLowerCase())}
                  placeholder="Enter target prefix (e.g., osmo, cosmos, juno)"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Prefix must contain only lowercase letters (e.g., cosmos, osmo, neutron)
                </p>
              </div>
            )}

            {/* Info Display */}
            {sourceHrp && targetHrp && (
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
                    <p className="font-medium mb-1">Converting Address Prefix</p>
                    <p>
                      From <span className="font-mono">{sourceHrp}</span> to{' '}
                      <span className="font-mono">{targetHrp}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Output Section */}
            {output && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Converted Address
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

            {/* Hex Output Section */}
            {hexOutput && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Hex Value
                </label>
                <div className="relative">
                  <textarea
                    value={hexOutput}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm resize-none"
                    rows={2}
                  />
                  <button
                    onClick={() => copyToClipboard(hexOutput)}
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
                Convert Cosmos Hub to Osmosis
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Input (Cosmos Hub):</p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    cosmos1zg69v7yszg69v7yszg69v7yszg69v7ys8xdv96
                  </code>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Output (Osmosis):</p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    osmo1zg69v7yszg69v7yszg69v7yszg69v7yskj57s9
                  </code>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Convert to Custom Prefix
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Input (any chain):</p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    juno1zg69v7yszg69v7yszg69v7yszg69v7ys7wl4qx
                  </code>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <p>💡 Tip: Enter any chain prefix in the target field to convert addresses.</p>
                  <p className="mt-1">Common prefixes: cosmos, osmo, juno, evmos, neutron, celestia, dydx, noble, stride</p>
                  <p className="mt-1">The hex value shows the underlying address bytes that remain constant across all prefixes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
