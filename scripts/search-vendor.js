#!/usr/bin/env node
/**
 * Quick vendor search script
 * 
 * Usage:
 *   node scripts/search-vendor.js <search-term>
 *   node scripts/search-vendor.js permitting
 *   node scripts/search-vendor.js shelby
 *   node scripts/search-vendor.js clint
 */

const fs = require('fs');
const path = require('path');

const vendorsFile = path.join(__dirname, '../data/vendors.json');

function searchVendors(searchTerm) {
  if (!fs.existsSync(vendorsFile)) {
    console.error('❌ Vendors database not found at:', vendorsFile);
    process.exit(1);
  }

  const vendors = JSON.parse(fs.readFileSync(vendorsFile, 'utf-8'));
  const term = searchTerm.toLowerCase();

  const results = vendors.filter(vendor => {
    return (
      vendor.name.toLowerCase().includes(term) ||
      vendor.trade.toLowerCase().includes(term) ||
      vendor.location.toLowerCase().includes(term) ||
      vendor.email.toLowerCase().includes(term) ||
      (vendor.category && vendor.category.toLowerCase().includes(term)) ||
      (vendor.organization && vendor.organization.toLowerCase().includes(term)) ||
      (vendor.role && vendor.role.toLowerCase().includes(term)) ||
      vendor.performanceNotes.toLowerCase().includes(term)
    );
  });

  if (results.length === 0) {
    console.log(`\n❌ No vendors found matching "${searchTerm}"\n`);
    process.exit(0);
  }

  console.log(`\n✅ Found ${results.length} vendor${results.length > 1 ? 's' : ''} matching "${searchTerm}":\n`);

  results.forEach(vendor => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📌 ${vendor.name}`);
    if (vendor.organization) {
      console.log(`   ${vendor.organization}${vendor.role ? ` - ${vendor.role}` : ''}`);
    }
    console.log(`   Trade: ${vendor.trade}`);
    console.log(`   Location: ${vendor.location}`);
    if (vendor.email) console.log(`   📧 ${vendor.email}`);
    if (vendor.phone) console.log(`   📞 ${vendor.phone}`);
    if (vendor.performanceNotes) {
      console.log(`   Notes: ${vendor.performanceNotes}`);
    }
    console.log('');
  });
}

// Get search term from command line
const searchTerm = process.argv[2];

if (!searchTerm) {
  console.log('Usage: node scripts/search-vendor.js <search-term>');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/search-vendor.js permitting');
  console.log('  node scripts/search-vendor.js shelby');
  console.log('  node scripts/search-vendor.js clint');
  process.exit(1);
}

searchVendors(searchTerm);
