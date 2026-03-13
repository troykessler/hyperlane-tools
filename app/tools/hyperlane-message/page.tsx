'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Buffer } from 'buffer';
import {
  formatMessage,
  parseMessage,
  messageId,
  addressToBytes32,
  bytes32ToAddress,
  getAddressProtocolType,
  ProtocolType,
  strip0x,
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
type MessageType = 'general' | 'warp';

export default function HyperlaneMessage() {
  const [activeTab, setActiveTab] = useState<TabType>('encode');
  const [messageType, setMessageType] = useState<MessageType>('general');

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

  // Warp transfer specific state
  const [warpRecipient, setWarpRecipient] = useState('');
  const [warpAmount, setWarpAmount] = useState('');
  const [warpRecipientProtocol, setWarpRecipientProtocol] = useState<ProtocolType | undefined>();

  // Decode tab state
  const [messageInput, setMessageInput] = useState('');
  const [decodedMessage, setDecodedMessage] = useState<any>(null);
  const [decodeError, setDecodeError] = useState('');
  const [decodedWarpTransfer, setDecodedWarpTransfer] = useState<{
    recipient: string;
    recipientEvm: string;
    amount: string;
  } | null>(null);

  const handleEncode = () => {
    try {
      let bodyHex = body;

      // If warp transfer, construct the warp body
      if (messageType === 'warp') {
        // Detect protocol or use detected one
        const detectedProtocol = getAddressProtocolType(warpRecipient.trim());
        const actualProtocol = detectedProtocol || warpRecipientProtocol || ProtocolType.Ethereum;

        // Convert recipient to bytes32
        const recipientBytes32 = addressToBytes32(warpRecipient.trim(), actualProtocol);

        // Convert amount to 32-byte hex (uint256)
        const amountValue = BigInt(warpAmount.trim());
        const amountHex = amountValue.toString(16).padStart(64, '0');

        // Combine: recipient (32 bytes) + amount (32 bytes)
        bodyHex = recipientBytes32 + amountHex;
      } else {
        // General message - convert text to hex if in text mode
        if (bodyInputMode === 'text') {
          const encoder = new TextEncoder();
          const bytes = encoder.encode(bodyText);
          bodyHex = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        }
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

      // Try to detect if this is a warp transfer message
      if (parsed.body) {
        const cleanBody = strip0x(parsed.body);

        // Warp transfer body is exactly 64 bytes (128 hex chars): 32 bytes recipient + 32 bytes amount
        if (cleanBody.length === 128) {
          try {
            // Split into recipient and amount
            const recipientHex = '0x' + cleanBody.substring(0, 64);
            const amountHex = cleanBody.substring(64, 128);
            const amount = BigInt('0x' + amountHex);

            // Try to decode recipient as EVM address (last 20 bytes)
            const recipientEvm = bytes32ToAddress(recipientHex);

            setDecodedWarpTransfer({
              recipient: recipientHex,
              recipientEvm: recipientEvm,
              amount: amount.toString(),
            });
          } catch (warpErr) {
            // Not a valid warp transfer, ignore
            setDecodedWarpTransfer(null);
          }
        } else {
          setDecodedWarpTransfer(null);
        }
      } else {
        setDecodedWarpTransfer(null);
      }
    } catch (err) {
      setDecodeError(err instanceof Error ? err.message : 'Decoding failed');
      setDecodedMessage(null);
      setDecodedWarpTransfer(null);
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

                {/* Message Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="messageType"
                        value="general"
                        checked={messageType === 'general'}
                        onChange={(e) => setMessageType('general')}
                        className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        General Message
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="messageType"
                        value="warp"
                        checked={messageType === 'warp'}
                        onChange={(e) => setMessageType('warp')}
                        className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Warp Transfer
                      </span>
                    </label>
                  </div>
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

                {/* Body Input - only show for general messages */}
                {messageType === 'general' && (
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
                )}

                {/* Warp Transfer Fields - only show for warp transfers */}
                {messageType === 'warp' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Transfer Recipient Address
                      </label>
                      <input
                        type="text"
                        value={warpRecipient}
                        onChange={(e) => {
                          setWarpRecipient(e.target.value);
                          // Try to detect protocol
                          if (e.target.value.trim()) {
                            const detected = getAddressProtocolType(e.target.value.trim());
                            setWarpRecipientProtocol(detected);
                          }
                        }}
                        placeholder="Enter recipient address (any format)"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {warpRecipientProtocol && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          Detected protocol: <span className="font-medium">{warpRecipientProtocol}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Transfer Amount (in smallest unit)
                      </label>
                      <input
                        type="text"
                        value={warpAmount}
                        onChange={(e) => setWarpAmount(e.target.value)}
                        placeholder="e.g., 1000000000000000000 (1 token with 18 decimals)"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Enter the amount in the smallest unit (wei, satoshi, etc.). This will be encoded as a uint256.
                      </p>
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
                          <p className="font-medium mb-1">Warp Transfer Message Format</p>
                          <p>
                            The message body will be automatically constructed as: Recipient (32 bytes) + Amount (32 bytes uint256).
                            This is the standard format for Hyperlane Warp Route token transfers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

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
              <>
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

                {/* Warp Transfer Details - only show if detected */}
                {decodedWarpTransfer && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Warp Transfer Details
                        </h3>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded">
                          Detected
                        </span>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
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
                            <p>
                              This message body follows the Warp Route transfer format (32 bytes recipient + 32 bytes amount).
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Recipient (bytes32)
                          </label>
                          <div className="relative">
                            <div className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all pr-20">
                              {decodedWarpTransfer.recipient}
                            </div>
                            <button
                              onClick={() => copyToClipboard(decodedWarpTransfer.recipient)}
                              className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Recipient (EVM address)
                          </label>
                          <div className="relative">
                            <div className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all pr-20">
                              {decodedWarpTransfer.recipientEvm}
                            </div>
                            <button
                              onClick={() => copyToClipboard(decodedWarpTransfer.recipientEvm)}
                              className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Derived from the last 20 bytes of the bytes32 recipient
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Amount (uint256)
                          </label>
                          <div className="relative">
                            <div className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all pr-20">
                              {decodedWarpTransfer.amount}
                            </div>
                            <button
                              onClick={() => copyToClipboard(decodedWarpTransfer.amount)}
                              className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Amount in the smallest unit (wei, satoshi, etc.)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
