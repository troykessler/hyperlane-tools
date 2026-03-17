'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wallet, HDNodeWallet, Mnemonic, randomBytes } from 'ethers';

export default function KeyMnemonicGenerator() {
  const [wordCount, setWordCount] = useState<12 | 24>(12);
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<{[key: string]: boolean}>({});

  const generateMnemonic = (words: 12 | 24) => {
    try {
      // Generate entropy: 16 bytes (128 bits) for 12 words, 32 bytes (256 bits) for 24 words
      const entropyBytes = words === 12 ? 16 : 32;
      const entropy = randomBytes(entropyBytes);

      // Create mnemonic from entropy
      const mnemonic = Mnemonic.fromEntropy(entropy);
      const wallet = HDNodeWallet.fromMnemonic(mnemonic);

      setMnemonic(mnemonic.phrase);
      setPrivateKey(wallet.privateKey);
      setAddress(wallet.address);
      setError('');
    } catch (err) {
      setError('Failed to generate mnemonic');
      console.error(err);
    }
  };

  const generateRandomPrivateKey = () => {
    try {
      const wallet = Wallet.createRandom();
      setPrivateKey(wallet.privateKey);
      setAddress(wallet.address);
      setMnemonic('');
      setError('');
    } catch (err) {
      setError('Failed to generate private key');
      console.error(err);
    }
  };

  const validateAndDerive = (mnemonicInput: string) => {
    setMnemonic(mnemonicInput);

    if (!mnemonicInput.trim()) {
      setPrivateKey('');
      setAddress('');
      setError('');
      return;
    }

    try {
      const wallet = Wallet.fromPhrase(mnemonicInput);
      setPrivateKey(wallet.privateKey);
      setAddress(wallet.address);
      setError('');
    } catch (err) {
      setPrivateKey('');
      setAddress('');
      setError('Invalid mnemonic phrase');
    }
  };

  const deriveFromPrivateKey = (pkInput: string) => {
    setPrivateKey(pkInput);

    if (!pkInput.trim()) {
      setAddress('');
      setError('');
      return;
    }

    try {
      const wallet = new Wallet(pkInput);
      setAddress(wallet.address);
      setError('');
    } catch (err) {
      setAddress('');
      setError('Invalid private key');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback({ ...copyFeedback, [key]: true });
    setTimeout(() => {
      setCopyFeedback({ ...copyFeedback, [key]: false });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
            ← Back to tools
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Private Key & Mnemonic Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Generate secure private keys and mnemonic phrases (12 or 24 words) for Ethereum wallets
          </p>
        </div>

        {/* Security Warning */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                Security Warning
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                Keys and mnemonics are generated locally in your browser. <strong>Never use these for production wallets containing real funds.</strong> This tool is intended for development and testing purposes only. Always use hardware wallets or trusted wallet software for managing real assets.
              </p>
            </div>
          </div>
        </div>

        {/* Mnemonic Generation */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Generate Mnemonic Phrase
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Word Count
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setWordCount(12)}
                className={`px-4 py-2 rounded-lg border ${
                  wordCount === 12
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                12 Words
              </button>
              <button
                onClick={() => setWordCount(24)}
                className={`px-4 py-2 rounded-lg border ${
                  wordCount === 24
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                24 Words
              </button>
            </div>
          </div>

          <button
            onClick={() => generateMnemonic(wordCount)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
          >
            Generate {wordCount}-Word Mnemonic
          </button>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mnemonic Phrase
            </label>
            <div className="relative">
              <textarea
                value={mnemonic}
                onChange={(e) => validateAndDerive(e.target.value)}
                placeholder="Enter or generate a mnemonic phrase..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 font-mono text-sm resize-none"
                rows={3}
              />
              {mnemonic && (
                <button
                  onClick={() => copyToClipboard(mnemonic, 'mnemonic')}
                  className="absolute right-2 top-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs rounded transition-colors"
                >
                  {copyFeedback.mnemonic ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Private Key Generation */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Generate Random Private Key
          </h2>

          <button
            onClick={generateRandomPrivateKey}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
          >
            Generate Random Private Key
          </button>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Private Key
            </label>
            <div className="relative">
              <input
                type="text"
                value={privateKey}
                onChange={(e) => deriveFromPrivateKey(e.target.value)}
                placeholder="Enter or generate a private key..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 font-mono text-sm"
              />
              {privateKey && (
                <button
                  onClick={() => copyToClipboard(privateKey, 'privateKey')}
                  className="absolute right-2 top-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs rounded transition-colors"
                >
                  {copyFeedback.privateKey ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Derived Address */}
        {address && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Derived Ethereum Address
            </h2>

            <div className="relative">
              <input
                type="text"
                value={address}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(address, 'address')}
                className="absolute right-2 top-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs rounded transition-colors"
              >
                {copyFeedback.address ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            About This Tool
          </h2>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What are Mnemonic Phrases?</h3>
              <p>
                A mnemonic phrase (also called seed phrase or recovery phrase) is a list of 12 or 24 words that can be used to recover a cryptocurrency wallet.
                The words are generated using the BIP39 standard and can derive multiple private keys following the BIP44 derivation path.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What are Private Keys?</h3>
              <p>
                A private key is a 256-bit number (represented as 64 hexadecimal characters) that controls access to a cryptocurrency wallet.
                Anyone with access to the private key can spend the funds associated with the derived address. Never share your private keys.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Generate cryptographically secure 12 or 24-word mnemonic phrases</li>
                <li>Generate random private keys</li>
                <li>Derive Ethereum addresses from mnemonics or private keys</li>
                <li>Validate existing mnemonic phrases</li>
                <li>All generation happens locally in your browser</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Security Best Practices</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Never use generated keys/mnemonics for real funds without proper security measures</li>
                <li>Store mnemonics and private keys securely offline</li>
                <li>Use hardware wallets for production/mainnet wallets</li>
                <li>Never share your private keys or mnemonic phrases</li>
                <li>This tool is designed for development and testing only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
