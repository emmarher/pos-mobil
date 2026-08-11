/**
 * Genera la carpeta `windows/` de React Native Windows replicando
 * la lógica de `npx react-native init-windows` (que en macOS no puede
 * ejecutarse porque requiere herramientas Windows-only).
 *
 * Implementación independiente: copia el template cpp-app de
 * node_modules/react-native-windows y aplica los reemplazos Mustache
 * y de nombre de proyecto exactamente como lo hace el CLI oficial.
 *
 * Uso: node scripts/generate-windows.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mustache = require('mustache');
const { execSync } = require('child_process');

const projectRoot = process.cwd();
const projectName = 'PosMobile';
const namespace = 'PosMobile';
const namespaceCpp = namespace.replace(/\./g, '::');

const RNW_TEMPLATE_DIR = path.join(
  projectRoot,
  'node_modules/react-native-windows/templates/cpp-app',
);
const WINDOWS_SRC = path.join(RNW_TEMPLATE_DIR, 'windows');
const DEST = path.join(projectRoot, 'windows');

// -- helpers ------------------------------------------------------------

function walk(current) {
  if (!fs.lstatSync(current).isDirectory()) {
    return [current];
  }
  const files = fs
    .readdirSync(current)
    .map(child => walk(path.join(current, child)));
  return [].concat.apply([], files);
}

function resolveContents(srcPath, replacements) {
  let content = fs.readFileSync(srcPath, 'utf8');
  if (content.includes('\r\n')) {
    for (const key of Object.keys(replacements)) {
      if (typeof replacements[key] === 'string') {
        replacements[key] = replacements[key].replace(/(?<!\r)\n/g, '\r\n');
      }
    }
  } else {
    for (const key of Object.keys(replacements)) {
      if (typeof replacements[key] === 'string') {
        replacements[key] = replacements[key].replace(/\r\n/g, '\n');
      }
    }
  }
  if (replacements.useMustache) {
    content = mustache.render(content, replacements);
    (replacements.regExpPatternsToRemove || []).forEach(regexPattern => {
      content = content.replace(new RegExp(regexPattern, 'g'), '');
    });
  } else {
    Object.keys(replacements).forEach(regex => {
      content = content.replace(new RegExp(regex, 'g'), replacements[regex]);
    });
  }
  return content;
}

function copyBinaryFile(srcPath, destPath) {
  fs.copyFileSync(srcPath, destPath);
}

function copyAndReplace(srcPath, destPath, replacements) {
  const ext = path.extname(srcPath);
  const binaryExtensions = ['.png', '.jar', '.keystore', '.ico', '.rc'];
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  if (binaryExtensions.includes(ext)) {
    copyBinaryFile(srcPath, destPath);
  } else {
    fs.writeFileSync(destPath, resolveContents(srcPath, replacements));
  }
}

// -- replacements (copiados de template.config.js de RNW) ---------------

function buildReplacements() {
  const rnwPkg = require(path.join(
    projectRoot,
    'node_modules/react-native-windows/package.json',
  ));
  const rnwVersion = rnwPkg.version;

  const projectGuid = crypto.randomUUID();
  const packageGuid = crypto.randomUUID();
  let currentUser = 'developer';
  try {
    currentUser = execSync('whoami', { encoding: 'utf8' }).trim();
  } catch {
    /* ignore */
  }

  const appJsonPath = path.join(projectRoot, 'app.json');
  const mainComponentName = fs.existsSync(appJsonPath)
    ? require(appJsonPath).name
    : projectName;

  return {
    useMustache: true,
    regExpPatternsToRemove: [],

    name: projectName,
    namespace,
    namespaceCpp,

    rnwVersion,
    rnwPathFromProjectRoot: path
      .relative(projectRoot, path.join(projectRoot, 'node_modules/react-native-windows'))
      .replace(/\//g, '\\'),

    mainComponentName,

    projectGuidLower: `{${projectGuid.toLowerCase()}}`,
    projectGuidUpper: `{${projectGuid.toUpperCase()}}`,

    packageGuidLower: `{${packageGuid.toLowerCase()}}`,
    packageGuidUpper: `{${packageGuid.toUpperCase()}}`,
    currentUser,

    devMode: false,
    useNuGets: true,
    addReactNativePublicAdoFeed: true,

    cppNugetPackages: [],

    autolinkPropertiesForProps: '',
    autolinkProjectReferencesForTargets: '',
    autolinkCppIncludes: '',
    autolinkCppPackageProviders:
      '\n    UNREFERENCED_PARAMETER(packageProviders);',
  };
}

// -- main ---------------------------------------------------------------

function main() {
  if (!fs.existsSync(WINDOWS_SRC)) {
    console.error(`Template no encontrado: ${WINDOWS_SRC}`);
    process.exit(1);
  }
  const replacements = buildReplacements();
  const files = walk(WINDOWS_SRC);

  console.log(`Generando windows/ desde template cpp-app (${files.length} archivos)...`);

  for (const file of files) {
    let relativeDest = path.relative(WINDOWS_SRC, file);

    // Renombres simples
    if (path.basename(relativeDest) === '_gitignore') {
      relativeDest = path.join(path.dirname(relativeDest), '.gitignore');
    }

    // Renombrar archivos MyApp -> projectName
    relativeDest = relativeDest.replace(/MyApp/g, projectName);

    const destPath = path.join(DEST, relativeDest);
    copyAndReplace(file, destPath, replacements);
  }

  console.log('Carpeta windows/ generada correctamente.');

  // Actualiza package.json con scripts y devDependencies (postInstall del template)
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = require(pkgPath);
  pkg.scripts = {
    ...pkg.scripts,
    windows: 'npx @react-native-community/cli run-windows',
    'test:windows': 'jest --config jest.config.windows.js',
  };
  pkg.devDependencies = {
    ...pkg.devDependencies,
    '@rnx-kit/jest-preset': '^0.3.1',
  };
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('package.json actualizado (scripts windows + test:windows).');
}

main();
