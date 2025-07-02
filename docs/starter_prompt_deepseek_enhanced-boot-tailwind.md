# Vite React Starter with Bootstrap + TailwindCSS

## Quick Start Template

**Core Stack**

- ⚡ Vite 5 + React 18 (JavaScript)  
- 🎨 Bootstrap 5.3 + TailwindCSS 3.4 (Hybrid Approach)  
- 🧪 Vitest + React Testing Library  

## Bootstrap + Tailwind Hybrid Setup

### 1. Custom Button Component

```jsx
// src/components/Button.jsx
import { Button as BSButton } from 'react-bootstrap';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';

export const Button = forwardRef(
  ({ children, loading, disabled, className, ...props }, ref) => (
    <BSButton
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : children}
    </BSButton>
  )
);
```

### 2. Sample Card Component

```jsx
// src/components/Card.jsx
import { Card as BSCard } from 'react-bootstrap';
import { cn } from '../lib/utils';

export const Card = ({ children, className, hover = false }) => (
  <BSCard className={cn(
    "shadow-sm",
    hover && "hover:shadow-md transition-shadow duration-200",
    className
  )}>
    {children}
  </BSCard>
);
```

## Basic Project Structure

```txt
src/
├── components/
│   ├── Button.jsx          # Bootstrap + Tailwind button
│   └── Card.jsx            # Bootstrap + Tailwind card
├── lib/
│   └── utils.js            # Class merging utility
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## Configuration Setup

### 1. Tailwind Config with Bootstrap Compatibility

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  corePlugins: {
    // Disable Tailwind's reset to avoid conflicts with Bootstrap
    preflight: false,
  },
  theme: {
    extend: {
      // Extend Bootstrap's color palette
      colors: {
        primary: {
          50: '#e3f2fd',
          500: '#2196f3',
          900: '#0d47a1',
        },
      },
      // Custom animations for enhanced UX
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
```

### 2. Utils Library for Class Merging

```js
// lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### 3. Bootstrap + Tailwind Import Strategy

```css
/* src/index.css */
/* Import Bootstrap CSS first */
@import 'bootstrap/dist/css/bootstrap.min.css';

/* Then import Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component styles */
@layer components {
  .card-hover {
    @apply transition-all duration-200 hover:shadow-lg hover:-translate-y-1;
  }
  
  .btn-custom {
    @apply transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2;
  }
}
```

## Package Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-bootstrap": "^2.10.0",
    "bootstrap": "^5.3.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "vite": "^5.1.0",
    "vitest": "^1.3.0"
  }
}
```

## Getting Started

1. **Install dependencies:**

```bash
npm install
```

2. **Start development server:**

```bash
npm run dev
```

3. **Build for production:**

```bash
npm run build
```

## Key Features

- ✅ Bootstrap 5.3 components with Tailwind utility styling
- ✅ JavaScript setup for simplicity
- ✅ Custom utility function for class merging
- ✅ Responsive design with both Bootstrap grid and Tailwind utilities
- ✅ Modern animations and transitions
- ✅ Development server with hot reload
- ✅ Production build optimization

