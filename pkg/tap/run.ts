import { execSync } from 'node:child_process';
import { build } from './build';

export const run = () => {
  const schemas = build();

  if (!schemas) {
    console.log('No schemas to validate');
    return;
  }

  // Run zed validate command
  for (const schema of schemas) {
    try {
      console.log(`Validating schema for module ${schema}...`);
      execSync(`zed validate ${schema}`, {
        encoding: 'utf8',
        stdio: 'inherit',
      });
    } catch (error) {
      console.error(error.message);
    }
  }
};
