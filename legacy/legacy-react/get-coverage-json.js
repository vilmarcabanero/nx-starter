#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to calculate coverage percentage
function calculateCoveragePercentage(counts, map) {
  if (!map || Object.keys(map).length === 0) return 100;
  
  const total = Object.keys(map).length;
  const covered = Object.values(counts).filter(count => count > 0).length;
  
  return Math.round((covered / total) * 10000) / 100;
}

// Function to get uncovered lines
function getUncoveredLines(statementCounts, statementMap) {
  const uncovered = [];
  
  for (const [key, count] of Object.entries(statementCounts)) {
    if (count === 0 && statementMap[key]) {
      const line = statementMap[key].start.line;
      uncovered.push(line);
    }
  }
  
  return uncovered.sort((a, b) => a - b);
}

// Function to format uncovered lines
function formatUncoveredLines(lines) {
  if (lines.length === 0) return '';
  if (lines.length > 10) return `${lines.slice(0, 5).join(',')}...${lines.slice(-2).join(',')}`;
  
  // Group consecutive lines
  const groups = [];
  let start = lines[0];
  let end = lines[0];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === end + 1) {
      end = lines[i];
    } else {
      groups.push(start === end ? start.toString() : `${start}-${end}`);
      start = end = lines[i];
    }
  }
  groups.push(start === end ? start.toString() : `${start}-${end}`);
  
  return groups.join(',');
}

// Main function
function analyzeCoverage() {
  try {
    const coverageFile = path.join(__dirname, 'coverage', 'coverage-final.json');
    
    if (!fs.existsSync(coverageFile)) {
      console.error('Coverage file not found. Run "npm run test:coverage" first.');
      process.exit(1);
    }
    
    const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    const incompleteFiles = [];
    
    for (const [filePath, fileData] of Object.entries(coverage)) {
      // Skip node_modules, coverage scripts, and other non-source files
      if (filePath.includes('node_modules') || 
          filePath.includes('get-coverage') || 
          filePath.includes('check-coverage') ||
          !filePath.match(/\.(ts|tsx|js|jsx)$/) ||
          filePath.match(/\.(spec|test)\.(ts|tsx|js|jsx)$/)) {
        continue;
      }
      
      // Calculate coverage percentages
      const statements = calculateCoveragePercentage(fileData.s || {}, fileData.statementMap || {});
      const branches = calculateCoveragePercentage(fileData.b || {}, fileData.branchMap || {});
      const functions = calculateCoveragePercentage(fileData.f || {}, fileData.fnMap || {});
      const lines = statements; // Lines coverage is typically same as statements
      
      // Check if any metric is not 100%
      if (statements !== 100 || branches !== 100 || functions !== 100) {
        const relativePath = filePath.replace(__dirname + '/', '');
        const uncoveredLines = getUncoveredLines(fileData.s || {}, fileData.statementMap || {});
        
        incompleteFiles.push({
          file: relativePath,
          statements,
          branches,
          functions,
          lines,
          uncoveredLines: formatUncoveredLines(uncoveredLines)
        });
      }
    }
    
    // Sort by statements coverage (lowest first)
    incompleteFiles.sort((a, b) => a.statements - b.statements);
    
    console.log('Files with less than 100% test coverage:');
    console.log('='.repeat(80));
    console.log(
      'File'.padEnd(50) + 
      'Stmt%'.padEnd(10) + 
      'Branch%'.padEnd(10) + 
      'Func%'.padEnd(10) + 
      'Lines%'.padEnd(10) + 
      'Uncovered Lines'
    );
    console.log('-'.repeat(120));
    
    for (const file of incompleteFiles) {
      const fileName = file.file.length > 50 ? '...' + file.file.slice(-47) : file.file;
      console.log(
        fileName.padEnd(50) +
        `${file.statements}%`.padEnd(10) +
        `${file.branches}%`.padEnd(10) + 
        `${file.functions}%`.padEnd(10) +
        `${file.lines}%`.padEnd(10) +
        (file.uncoveredLines || '')
      );
    }
    
    console.log('');
    console.log(`Found ${incompleteFiles.length} files with incomplete coverage.`);
    
  } catch (error) {
    console.error('Error analyzing coverage:', error.message);
    process.exit(1);
  }
}

analyzeCoverage();