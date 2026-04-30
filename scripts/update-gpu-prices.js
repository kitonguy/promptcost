#!/usr/bin/env node
/**
 * GPU Market Price Updater — PromptCost.org
 * Runs nightly at UTC midnight via cron
 *
 * Usage: node scripts/update-gpu-prices.js
 *
 * Providers with public APIs:
 *   - Vast.ai: https://console.vast.ai/api/v0/ (public, no auth needed for reads)
 *
 * Providers requiring manual/scripted updates:
 *   - AWS, Lambda Labs, RunPod, GCP, Azure, CoreWeave
 *   (These require account credentials — update via their dashboards)
 *
 * Cron entry (UTC midnight):
 *   0 0 * * * cd /path/to/promptcost && node scripts/update-gpu-prices.js >> logs/gpu-update.log 2>&1
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '../src/data/gpu_market.json');
const LOG_FILE = join(__dirname, '../logs/gpu-update.log');

const PROVIDER_IDS = {
  vastai: 'vastai',
  aws: 'aws',
  lambda: 'lambda',
  runpod: 'runpod',
  gcp: 'gcp',
  azure: 'azure',
  coreweave: 'coreweave',
};

// Vast.ai public API — no API key needed for public listings
const VAST_AI_API = 'https://console.vast.ai/api/v0';

async function fetchVastAiPrices(gpuName) {
  try {
    const url = `${VAST_AI_API}/bundles/`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Vast.ai API error: ${response.status}`);
    const data = await response.json();

    const filtered = data.offers
      .filter(o => o.gpu_name === gpuName && o.dph_total > 0 && o.num_gpus === 1)
      .sort((a, b) => a.dph_total - b.dph_total);

    if (filtered.length === 0) {
      log(`  [Vast.ai] No ${gpuName} offers found`);
      return null;
    }

    const cheapest = filtered[0];
    const geoParts = cheapest.geolocation?.split(',') || [];
    const region = geoParts.length > 1
      ? geoParts[1].trim().toLowerCase().replace(/\s+/g, '-')
      : 'us-east-1';

    return {
      ondemand: parseFloat(cheapest.dph_total.toFixed(2)),
      spot: parseFloat((cheapest.dph_total * 0.75).toFixed(2)),
      available: cheapest.rentable,
      region,
    };
  } catch (err) {
    console.error(`[Vast.ai ${gpuName}] Fetch failed:`, err.message);
    return null;
  }
}

// Map Vast.ai GPU names to our internal GPU IDs
const VAST_GPU_MAP = {
  'RTX 4090': { gpuId: 'rtx-4090-24gb' },
  'RTX 3090': { gpuId: 'rtx-3090-24gb' },
  'H100 NVL': { gpuId: 'h100-80gb' },
  'H100 SXM': { gpuId: 'h100-80gb' },
  'A100 PCIE': { gpuId: 'a100-80gb' },
  'A100 SXM': { gpuId: 'a100-80gb' },
};

async function fetchVastAiGpuPrices() {
  const results = {};
  const vastGpuNames = Object.keys(VAST_GPU_MAP);

  log(`Fetching Vast.ai prices for ${vastGpuNames.length} GPU types...`);
  for (const vastName of vastGpuNames) {
    const price = await fetchVastAiPrices(vastName);
    if (price) {
      results[VAST_GPU_MAP[vastName].gpuId] = price;
    }
  }
  return results;
}

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  try {
    writeFileSync(LOG_FILE, line + '\n', { flag: 'a' });
  } catch (_) {
    // ignore
  }
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function main() {
  log('=== GPU Price Update Started ===');

  // Load current data
  let marketData;
  try {
    marketData = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    log(`ERROR: Cannot read ${DATA_FILE}: ${err.message}`);
    process.exit(1);
  }

  const changes = [];

  // Fetch all Vast.ai GPU prices in one batch call
  const vastPrices = await fetchVastAiGpuPrices();

  // Apply Vast.ai prices to matching GPUs
  for (const [gpuId, newPrice] of Object.entries(vastPrices)) {
    const gpu = marketData.gpus.find(g => g.id === gpuId);
    if (!gpu) continue;
    const existing = gpu.rentals.find(r => r.provider === 'vastai');
    if (!existing) continue;

    if (!deepEqual(newPrice, existing)) {
      const fromOndemand = existing.ondemand;
      changes.push({
        gpu: gpu.model,
        provider: 'Vast.ai',
        from: { ...existing },
        to: { ...newPrice },
      });
      Object.assign(existing, newPrice);
      log(`  ${gpu.model} Vast.ai: $${fromOndemand}/hr -> $${newPrice.ondemand}/hr`);
    } else {
      log(`  ${gpu.model} Vast.ai: No change`);
    }
  }

  // Update lastUpdated timestamp
  marketData.lastUpdated = new Date().toISOString();

  if (changes.length > 0) {
    writeFileSync(DATA_FILE, JSON.stringify(marketData, null, 2) + '\n');
    log(`\n✓ Saved ${changes.length} change(s) to ${DATA_FILE}`);
  } else {
    writeFileSync(DATA_FILE, JSON.stringify(marketData, null, 2) + '\n');
    log('\n✓ No price changes detected. Timestamp updated.');
  }

  log('=== GPU Price Update Complete ===\n');
}

main().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});
