'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CryptoJS from 'crypto-js';
import RIPEMD160 from 'crypto-js/ripemd160';

interface HashResult {
  name: string;
  value: string;
}

export default function HashText() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<HashResult[]>([]);

  useEffect(() => {
    const inputStr = input || '';

    const results: HashResult[] = [
      {
        name: 'MD5',
        value: CryptoJS.MD5(inputStr).toString(),
      },
      {
        name: 'SHA1',
        value: CryptoJS.SHA1(inputStr).toString(),
      },
      {
        name: 'SHA256',
        value: CryptoJS.SHA256(inputStr).toString(),
      },
      {
        name: 'SHA224',
        value: CryptoJS.SHA224(inputStr).toString(),
      },
      {
        name: 'SHA512',
        value: CryptoJS.SHA512(inputStr).toString(),
      },
      {
        name: 'SHA384',
        value: CryptoJS.SHA384(inputStr).toString(),
      },
      {
        name: 'SHA3',
        value: CryptoJS.SHA3(inputStr, { outputLength: 512 }).toString(),
      },
      {
        name: 'RIPEMD160',
        value: RIPEMD160(inputStr).toString(),
      },
    ];

    setHashes(results);
  }, [input]);

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
            Hash Text
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Hash a text string using MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3, or RIPEMD160
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your text to hash
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Your string to hash..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Digest Encoding Label */}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                Digest encoding: Hexadecimal (base 16)
              </p>
            </div>

            {/* Hash Outputs */}
            <div className="space-y-4">
              {hashes.map((hash) => (
                <div key={hash.name}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {hash.name}
                  </label>
                  <div className="relative">
                    <div className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm break-all">
                      {hash.value}
                    </div>
                    <button
                      onClick={() => copyToClipboard(hash.value)}
                      className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            About Hash Functions
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <strong className="text-slate-900 dark:text-slate-100">MD5:</strong> 128-bit hash function, commonly used but considered cryptographically broken
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">SHA-1:</strong> 160-bit hash function, deprecated for most cryptographic uses
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">SHA-2 family (SHA-224, SHA-256, SHA-384, SHA-512):</strong> Secure hash algorithms widely used in security applications
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">SHA-3:</strong> Latest member of the Secure Hash Algorithm family, alternative to SHA-2
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">RIPEMD-160:</strong> 160-bit hash function, commonly used in Bitcoin addresses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
