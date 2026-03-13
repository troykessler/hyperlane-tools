'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Buffer } from 'buffer';
import {
  formatMessage,
  parseMessage,
  messageId,
} from '@hyperlane-xyz/utils';

// Ensure Buffer is available globally for @hyperlane-xyz/utils
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
// Also ensure process.browser is set for some libraries
if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
  (window as any).process = { browser: true };
}

type TabType = 'encode' | 'decode';

export default function HyperlaneMessage() {
  const [activeTab, setActiveTab] = useState<TabType>('encode');

  // Encode tab state
  const [version, setVersion] = useState('3');
  const [nonce, setNonce] = useState('1');
  const [originDomain, setOriginDomain] = useState('1');
  const [senderAddr, setSenderAddr] = useState('');
  const [destinationDomain, setDestinationDomain] = useState('10');
  const [recipientAddr, setRecipientAddr] = useState('');
  const [body, setBody] = useState('0x');
  const [bodyInputMode, setBodyInputMode] = useState<'hex' | 'text'>('hex');
  const [bodyText, setBodyText] = useState('');
  const [encodedMessage, setEncodedMessage] = useState('');
  const [msgId, setMsgId] = useState('');

  // Decode tab state
  const [messageInput, setMessageInput] = useState('');
  const [decodedMessage, setDecodedMessage] = useState<any>(null);
  const [decodeError, setDecodeError] = useState('');

  const handleEncode = () => {
    try {
      // Convert text to hex if in text mode
      let bodyHex = body;
      if (bodyInputMode === 'text') {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(bodyText);
        bodyHex = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      }

      const message = formatMessage(
        parseInt(version),
        parseInt(nonce),
        parseInt(originDomain),
        senderAddr,
        parseInt(destinationDomain),
        recipientAddr,
        bodyHex
      );
      setEncodedMessage(message);
      setMsgId(messageId(message));
    } catch (err) {
      setEncodedMessage('Error: ' + (err instanceof Error ? err.message : 'Encoding failed'));
      setMsgId('');
    }
  };

  const handleDecode = () => {
    try {
      const parsed = parseMessage(messageInput);
      setDecodedMessage(parsed);
      setDecodeError('');
      setMsgId(messageId(messageInput));
    } catch (err) {
      setDecodeError(err instanceof Error ? err.message : 'Decoding failed');
      setDecodedMessage(null);
      setMsgId('');
    }
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
            Hyperlane Message
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Encode, decode, and analyze Hyperlane messages
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'encode', label: 'Encode Message' },
            { id: 'decode', label: 'Decode Message' },
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

        {/* Encode Tab */}
        {activeTab === 'encode' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Version
                    </label>
                    <input
                      type="number"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nonce
                    </label>
                    <input
                      type="number"
                      value={nonce}
                      onChange={(e) => setNonce(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Origin Domain
                    </label>
                    <input
                      type="number"
                      value={originDomain}
                      onChange={(e) => setOriginDomain(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Destination Domain
                    </label>
                    <input
                      type="number"
                      value={destinationDomain}
                      onChange={(e) => setDestinationDomain(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sender Address
                  </label>
                  <input
                    type="text"
                    value={senderAddr}
                    onChange={(e) => setSenderAddr(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipientAddr}
                    onChange={(e) => setRecipientAddr(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

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
                      <p className="font-medium mb-1">Address Format</p>
                      <p>
                        Sender and recipient addresses are automatically converted to bytes32 format.
                        You can input addresses in any supported format (EVM, Solana, Cosmos, etc.) or directly provide bytes32.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Body
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bodyInputMode === 'text'}
                        onChange={(e) => setBodyInputMode(e.target.checked ? 'text' : 'hex')}
                        className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Plain text input
                      </span>
                    </label>
                  </div>
                  <textarea
                    value={bodyInputMode === 'hex' ? body : bodyText}
                    onChange={(e) => bodyInputMode === 'hex' ? setBody(e.target.value) : setBodyText(e.target.value)}
                    placeholder={bodyInputMode === 'hex' ? '0x...' : 'Enter plain text...'}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  {bodyInputMode === 'text' && bodyText && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                      Hex preview: 0x{Array.from(new TextEncoder().encode(bodyText)).map(b => b.toString(16).padStart(2, '0')).join('')}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleEncode}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Encode Message
                </button>
              </div>
            </div>

            {encodedMessage && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Encoded Message
                    </label>
                    <div className="relative">
                      <div className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all">
                        {encodedMessage}
                      </div>
                      <button
                        onClick={() => copyToClipboard(encodedMessage)}
                        className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {msgId && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Message ID
                      </label>
                      <div className="relative">
                        <div className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all">
                          {msgId}
                        </div>
                        <button
                          onClick={() => copyToClipboard(msgId)}
                          className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decode Tab */}
        {activeTab === 'decode' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message (hex)
                  </label>
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="0x..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={handleDecode}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Decode Message
                </button>
              </div>
            </div>

            {decodeError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{decodeError}</p>
              </div>
            )}

            {decodedMessage && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Decoded Message
                  </h3>
                  {Object.entries(decodedMessage).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px]">
                        {key}:
                      </span>
                      <span className="text-sm text-slate-900 dark:text-white font-mono break-all">
                        {typeof value === 'bigint' ? value.toString() : String(value)}
                      </span>
                    </div>
                  ))}

                  {msgId && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px]">
                          Message ID:
                        </span>
                        <div className="flex-1 relative">
                          <div className="text-sm text-slate-900 dark:text-white font-mono break-all pr-16">
                            {msgId}
                          </div>
                          <button
                            onClick={() => copyToClipboard(msgId)}
                            className="absolute top-0 right-0 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
