import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as os from 'os';
import { TestBuilder } from './test-builder';

export const t = new TestBuilder('root');

// Function to recursively find all .spec.ts files
function findSpecFiles(dir: string): string[] {
  let results: string[] = [];

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      results = results.concat(findSpecFiles(filePath));
    } else if (file.endsWith('.spec.ts')) {
      // Found a spec file
      results.push(filePath);
    }
  }

  return results;
}

export const build = (): string[] | null => {
  // Get CLI arguments, skipping the first two (node and script path)
  const args = process.argv.slice(2);

  // Default to current directory if no arguments provided
  const searchDir = args.length > 0 ? args[0] : '.';
  // Get schema path from arguments or use default
  const schemaPath = args.length > 1 ? args[1] : undefined;

  const destinationDir = args.length > 2 ? args[2] : undefined;

  // Find all spec files
  const specFiles = findSpecFiles(searchDir);

  if (specFiles.length === 0) {
    console.log(`No .spec.ts files found in ${searchDir}`);
    return null;
  }

  console.log(`Found ${specFiles.length} spec files to run:`);

  // Run each spec file
  for (const specFile of specFiles) {
    try {
      require(path.resolve(specFile));
    } catch (error) {
      console.error(`Error running ${specFile}:`, error);
    }
  }

  t.end();

  if (!schemaPath) {
    console.log('No schema path provided, skipping schema build');
    return null;
  }

  console.log('\nBuilding schema...');

  const schemas: string[] = [];

  const destinationPath = destinationDir
    ? path.resolve(destinationDir)
    : os.tmpdir();
  // Ensure destination directory exists
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
    console.log(`Created destination directory: ${destinationPath}`);
  }

  // If schema path is provided, build the schema
  try {
    // Read the schema file
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    for (const testModule of t.modules) {
      // Convert schema to YAML
      const schemaYaml = yaml.dump({
        schema: schemaContent,
        relationships: testModule.relationships
          .map((r) => r.build())
          .join('\n'),
        assertions: {
          assertTrue: testModule.assertions
            .filter((a) => !a.negated)
            .map((a) => a.build()),
          assertFalse: testModule.assertions
            .filter((a) => a.negated)
            .map((a) => a.build()),
        },
      });

      // Create a temporary file path
      const destinationFilePath = path.join(
        destinationPath,
        `spicedb-test-module-${testModule.module}.spec.yaml`,
      );

      // Write the YAML to the temporary file
      fs.writeFileSync(destinationFilePath, schemaYaml);

      schemas.push(destinationFilePath);
    }

    console.log('\nSchema built successfully');
  } catch (error) {
    console.error('Error building schema:', error);
  }

  return schemas;
};
