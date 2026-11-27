// Turkey Run — hand-in program: copies game/ and screenshots/ into the
// output directory and writes dossier.json with buildDossier.
// Runs on Node 22, standard library only, no network, deterministic:
// the same repository always writes the same bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR || '/output';
}

function copyTreeSorted(sourceDir: string, destDir: string): void {
  mkdirSync(destDir, { recursive: true });
  const entries = readdirSync(sourceDir).sort();
  for (const name of entries) {
    const source = join(sourceDir, name);
    const dest = join(destDir, name);
    const info = statSync(source);
    if (info.isDirectory()) {
      copyTreeSorted(source, dest);
    } else if (info.isFile()) {
      cpSync(source, dest);
    }
  }
}

function main(): void {
  const out = outputDir();
  const repoRoot = new URL('.', import.meta.url).pathname;
  const gameSource = join(repoRoot, 'game');
  const shotsSource = join(repoRoot, 'screenshots');
  if (!existsSync(gameSource)) throw new Error('game/ not found in repository');
  if (!existsSync(shotsSource)) throw new Error('screenshots/ not found in repository');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  copyTreeSorted(gameSource, join(out, 'game'));
  copyTreeSorted(shotsSource, join(out, 'screenshots'));
  const dossier = buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(out, 'dossier.json'), dossier);
}

main();
