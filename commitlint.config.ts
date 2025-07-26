// TypeScript configuration for commitlint
// Using a simpler approach without explicit type imports to avoid resolution issues

const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // A new feature
        'fix',      // A bug fix
        'docs',     // Documentation only changes
        'style',    // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'perf',     // A code change that improves performance
        'test',     // Adding missing tests or correcting existing tests
        'build',    // Changes that affect the build system or external dependencies
        'ci',       // Changes to CI configuration files and scripts
        'chore',    // Other changes that don't modify src or test files
        'revert',   // Reverts a previous commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [0], // Will use custom rule below
    'scope-kebab-case': [2, 'always'],
    'subject-empty': [2, 'never'],
    'subject-case': [0], // Will use custom rule below
    'subject-first-letter-lowercase': [2, 'always'],
    'subject-full-stop': [2, 'never', '.'],
    'conditional-header-max-length': [2, 'always'],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'scope-kebab-case': (parsed: any) => {
          const scope = parsed.scope;
          if (!scope) return [true];

          // Check if scope follows kebab-case with numbers allowed
          // Valid: api, user-api, api-e2e, api-v2, test-123
          // Invalid: API, userApi, starter_api, api-, -api, api--test
          if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(scope)) {
            return [
              false,
              'scope must be kebab-case (lowercase letters, numbers, and hyphens only)',
            ];
          }

          return [true];
        },
        'subject-first-letter-lowercase': (parsed: any) => {
          const subject = parsed.subject;
          if (!subject) return [true];

          // Check if first character is lowercase or a number
          const firstChar = subject.charAt(0);
          if (!/^[a-z0-9]/.test(firstChar)) {
            return [
              false,
              'subject must start with lowercase letter or number',
            ];
          }

          return [true];
        },
        'conditional-header-max-length': (parsed: any) => {
          const scope = parsed.scope;
          const header = parsed.header;
          if (!header) return [true];

          // Define scope-specific length limits
          const scopeLimits: Record<string, number> = {
            // Apps
            'api-e2e': 100,
            'api': 93,
            'web-e2e': 100,
            'web': 93,
            // Libs
            'application-core': 100,
            'domain': 95,
            'utils-core': 90,
          };

          // Get the limit for this scope, default to 72
          const limit = scope ? scopeLimits[scope] || 82 : 82;
          
          if (header.length > limit) {
            return [
              false,
              `header must not be longer than ${limit} characters for scope "${scope || 'no scope'}", current length is ${header.length}`,
            ];
          }

          return [true];
        },
      },
    },
  ],
} as const;

export default config;
