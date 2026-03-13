'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Ethereum unit conversions (all values in Wei)
const units = [
  { name: 'Wei', value: 1n },
  { name: 'Kwei', value: 1000n },
  { name: 'Mwei', value: 1000000n },
  { name: 'Gwei', value: 1000000000n },
  { name: 'Szabo', value: 1000000000000n },
  { name: 'Finney', value: 1000000000000000n },
  { name: 'Ether', value: 1000000000000000000n },
];

export default function EthUnitConverter() {
  const [inputValue, setInputValue] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('Ether');
  const [conversions, setConversions] = useState<{ name: string; value: string }[]>([]);

  useEffect(() => {
    if (!inputValue || inputValue === '' || isNaN(Number(inputValue))) {
      setConversions([]);
      return;
    }

    try {
      const sourceUnit = units.find(u => u.name === selectedUnit);
      if (!sourceUnit) return;

      // Convert input to Wei first
      const inputNum = inputValue.includes('.')
        ? parseFloat(inputValue)
        : parseFloat(inputValue);

      // Convert to Wei using floating point for precision
      const weiValue = inputNum * Number(sourceUnit.value);

      // Convert to all other units
      const results = units.map(unit => {
        const converted = weiValue / Number(unit.value);
        return {
          name: unit.name,
          value: formatNumber(converted),
        };
      });

      setConversions(results);
    } catch (err) {
      setConversions([]);
    }
  }, [inputValue, selectedUnit]);

  const formatNumber = (num: number): string => {
    if (num === 0) return '0';

    // For very large numbers (greater than safe integer)
    if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
      // Use string manipulation to avoid scientific notation
      const str = num.toFixed(0);
      return str;
    }

    // For all numbers, show up to 18 decimals but trim trailing zeros
    // This handles both small and regular numbers
    const str = num.toFixed(18);
    return str.replace(/\.?0+$/, '');
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
            Ethereum Unit Converter
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Convert between Wei, Gwei, Ether, and other Ethereum denominations
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Amount
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Unit Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Unit
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {units.map((unit) => (
                  <button
                    key={unit.name}
                    onClick={() => setSelectedUnit(unit.name)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedUnit === unit.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {unit.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Conversions */}
        {conversions.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Conversions
            </h2>
            <div className="space-y-3">
              {conversions.map((conversion) => (
                <div
                  key={conversion.name}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {conversion.name}
                    </div>
                    <div className="text-lg font-mono text-slate-900 dark:text-white break-all">
                      {conversion.value}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(conversion.value)}
                    className="ml-4 flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Ethereum Units
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">Wei</p>
                <p>1 Wei - The smallest unit of Ether</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">Kwei (Babbage)</p>
                <p>1,000 Wei</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">Mwei (Lovelace)</p>
                <p>1,000,000 Wei</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">Gwei (Shannon)</p>
                <p>1,000,000,000 Wei - Commonly used for gas prices</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">Szabo</p>
                <p>1,000,000,000,000 Wei</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">Finney</p>
                <p>1,000,000,000,000,000 Wei</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">Ether</p>
                <p>1,000,000,000,000,000,000 Wei - The base currency unit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
