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
      const startTime = performance.now();
      execSync(`zed validate ${schema}`, {
        encoding: 'utf8',
        stdio: 'inherit',
      });
      const endTime = performance.now();
      console.log(`Validation completed in ${endTime - startTime}ms`);
    } catch (error) {
      console.error(error.message);
    }
  }
};
