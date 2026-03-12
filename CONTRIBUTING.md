# Contributing to Hyperlane Tools

Thanks for your interest in contributing! This guide will help you add new tools to the project.

## Adding a New Tool

### 1. Create the Tool Page

Create a new directory and page component in `app/tools/`:

```bash
mkdir -p app/tools/your-tool-name
```

Create `app/tools/your-tool-name/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function YourToolName() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  // Your tool logic here

  return (
    <ToolLayout
      title="Your Tool Name"
      description="Brief description of what your tool does"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        {/* Your tool UI here */}
      </div>
    </ToolLayout>
  );
}
```

### 2. Register the Tool

Add your tool to `lib/tools.ts`:

```typescript
export const tools: Tool[] = [
  // ... existing tools
  {
    id: 'your-tool-name',
    title: 'Your Tool Name',
    description: 'Brief description of what your tool does',
    href: '/tools/your-tool-name',
    category: 'Encoding', // or Conversion, Validation, Utilities, Analysis
  },
];
```

### 3. Test Your Tool

Start the development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000` and verify:
- Your tool appears on the home page
- Clicking it takes you to your tool page
- The tool functions correctly
- Dark mode works properly
- Mobile responsive design works

## Design Guidelines

### Styling
- Use Tailwind CSS classes
- Follow the existing color scheme (slate colors, blue accents)
- Ensure dark mode support with `dark:` variants
- Keep layouts responsive with `sm:`, `md:`, `lg:` breakpoints

### UX Best Practices
- Provide clear labels and descriptions
- Show loading states for async operations
- Display helpful error messages
- Include example inputs
- Add a "Copy to clipboard" button for outputs
- Validate inputs in real-time

### Code Quality
- Use TypeScript for type safety
- Use 'use client' directive for interactive components
- Keep components focused and single-purpose
- Add comments for complex logic
- Use meaningful variable names

## Tool Ideas

Here are some ideas for new tools:

- **Message ID Calculator**: Calculate Hyperlane message IDs
- **Domain Converter**: Convert between chain names, IDs, and domains
- **Merkle Proof Verifier**: Verify merkle proofs
- **Gas Calculator**: Estimate gas costs for Hyperlane messages
- **Address Validator**: Validate addresses across different protocols
- **Message Parser**: Parse and decode Hyperlane messages
- **Hook Calculator**: Calculate hook addresses and data
- **ISM Config Builder**: Build ISM configurations visually

## Questions?

If you have questions or need help, please open an issue on GitHub.
