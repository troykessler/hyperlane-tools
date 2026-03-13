'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  addressToBytes32,
  getAddressProtocolType,
  isValidAddress,
  bytes32ToAddress,
  ProtocolType,
} from '@hyperlane-xyz/utils';

type TabType = 'encode' | 'decode';

export default function WarpTransferMessage() {
  const [activeTab, setActiveTab] = useState<TabType>('encode');

  // Encode tab state
  const [encodeRecipient, setEncodeRecipient] = useState('');
  const [encodeAmount, setEncodeAmount] = useState('');
  const [encodeProtocol, setEncodeProtocol] = useState<ProtocolType>(ProtocolType.Ethereum);
  const [encodeDetectedProtocol, setEncodeDetectedProtocol] = useState<ProtocolType | undefined>();
  const [encodeOutput, setEncodeOutput] = useState('');
  const [encodeError, setEncodeError] = useState('');

  // Decode tab state
  const [decodeInput, setDecodeInput] = useState('');
  const [decodeResult, setDecodeResult] = useState<{
    recipientBytes32: string;
    recipientEvm: string;
    amount: string;
    amountFormatted: string;
  } | null>(null);
  const [decodeError, setDecodeError] = useState('');

  // Encode: Recipient + Amount → Message Body
  useEffect(() => {
    if (!encodeRecipient.trim() || !encodeAmount.trim()) {
      setEncodeOutput('');
      setEncodeError('');
      setEncodeDetectedProtocol(undefined);
      return;
    }

    try {
      // Detect protocol
      const detected = getAddressProtocolType(encodeRecipient.trim());
      setEncodeDetectedProtocol(detected);

      const actualProtocol = detected || encodeProtocol;

      // Validate recipient address
      if (!isValidAddress(encodeRecipient.trim(), actualProtocol)) {
        setEncodeOutput('');
        setEncodeError(`Invalid address for ${actualProtocol} protocol`);
        return;
      }

      // Validate amount
      const amountValue = BigInt(encodeAmount.trim());
      if (amountValue < 0n) {
        setEncodeOutput('');
        setEncodeError('Amount must be non-negative');
        return;
      }

      // Convert recipient to bytes32
      const recipientBytes32 = addressToBytes32(encodeRecipient.trim(), actualProtocol);

      // Convert amount to 32-byte hex (uint256)
      const amountHex = amountValue.toString(16).padStart(64, '0');

      // Combine: recipient (32 bytes) + amount (32 bytes)
      const messageBody = recipientBytes32 + amountHex;

      setEncodeOutput(messageBody);
      setEncodeError('');
    } catch (err) {
      setEncodeError(err instanceof Error ? err.message : 'Encoding error');
      setEncodeOutput('');
    }
  }, [encodeRecipient, encodeAmount, encodeProtocol]);

  // Decode: Message Body → Recipient + Amount
  useEffect(() => {
    if (!decodeInput.trim()) {
      setDecodeResult(null);
      setDecodeError('');
      return;
    }

    try {
      const cleanInput = decodeInput.trim().replace(/^0x/, '');

      // Validate length (should be 128 hex characters = 64 bytes)
      if (cleanInput.length !== 128) {
        setDecodeResult(null);
        setDecodeError(
          `Invalid message length. Expected 128 hex characters (64 bytes), got ${cleanInput.length}`
        );
        return;
      }

      // Split into recipient (first 64 chars) and amount (last 64 chars)
      const recipientHex = '0x' + cleanInput.substring(0, 64);
      const amountHex = cleanInput.substring(64, 128);

      // Parse amount as BigInt
      const amount = BigInt('0x' + amountHex);

      // Convert recipient bytes32 to EVM address (20 bytes from the end)
      const recipientEvm = bytes32ToAddress(recipientHex);

      // Format amount with thousand separators
      const amountStr = amount.toString();
      const amountFormatted = amountStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      setDecodeResult({
        recipientBytes32: recipientHex,
        recipientEvm,
        amount: amountStr,
        amountFormatted,
      });
      setDecodeError('');
    } catch (err) {
      setDecodeError(err instanceof Error ? err.message : 'Decoding error');
      setDecodeResult(null);
    }
  }, [decodeInput]);

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
            Warp Transfer Message
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Encode and decode Hyperlane Warp Route token transfer messages
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'encode', label: 'Encode (Recipient + Amount → Body)' },
            { id: 'decode', label: 'Decode (Body → Recipient + Amount)' },
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
                  Recipient Address
                </label>
                <textarea
                  value={encodeRecipient}
                  onChange={(e) => setEncodeRecipient(e.target.value)}
                  placeholder="Enter recipient address (e.g., 0x1234..., So11111..., cosmos1...)"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                {encodeDetectedProtocol && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Detected protocol: <span className="font-medium">{encodeDetectedProtocol}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Amount (in smallest unit, e.g., wei for ETH)
                </label>
                <input
                  type="text"
                  value={encodeAmount}
                  onChange={(e) => setEncodeAmount(e.target.value)}
                  placeholder="e.g., 1000000000000000000 (1 ETH in wei)"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {encodeOutput && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Encoded Message Body
                    </label>
                    <button
                      onClick={() => copyToClipboard(encodeOutput)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <textarea
                    value={encodeOutput}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm resize-none"
                    rows={4}
                  />
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    Length: {encodeOutput.length} characters ({encodeOutput.replace(/^0x/, '').length / 2} bytes)
                  </p>
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
                  Message Body (128 hex characters)
                </label>
                <textarea
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                  placeholder="0x0000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000a"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {decodeResult && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Recipient (Bytes32)
                      </label>
                      <button
                        onClick={() => copyToClipboard(decodeResult.recipientBytes32)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all">
                      {decodeResult.recipientBytes32}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Recipient (EVM Address)
                      </label>
                      <button
                        onClick={() => copyToClipboard(decodeResult.recipientEvm)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all">
                      {decodeResult.recipientEvm}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Amount (smallest unit)
                      </label>
                      <button
                        onClick={() => copyToClipboard(decodeResult.amount)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all">
                      {decodeResult.amountFormatted}
                    </div>
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

        {/* Info Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Hyperlane Warp Route token transfers encode transfer data in the message body using a simple format:
            </p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Recipient (32 bytes):</strong> The
                destination address in bytes32 format
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Amount (32 bytes):</strong> The transfer
                amount as a uint256 (in the token's smallest unit)
              </li>
            </ol>
            <p>
              The complete message body is 64 bytes (128 hexadecimal characters), with the recipient in the first
              32 bytes and the amount in the last 32 bytes.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Note:</strong> Amounts should be specified
              in the token's smallest unit (e.g., wei for ETH, where 1 ETH = 10<sup>18</sup> wei).
            </p>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Example</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Encoding</p>
              <div className="space-y-2">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Recipient:</p>
                  <code className="text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded text-xs">
                    0x1234567890123456789012345678901234567890
                  </code>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Amount (1 ETH in wei):</p>
                  <code className="text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded text-xs">
                    1000000000000000000
                  </code>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Encoded Message Body:</p>
                  <code className="text-slate-600 dark:text-slate-400 font-mono block bg-slate-50 dark:bg-slate-900 p-2 rounded text-xs break-all">
                    0x00000000000000000000000012345678901234567890123456789012345678900000000000000000000000000000000000000000000000000de0b6b3a7640000
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
