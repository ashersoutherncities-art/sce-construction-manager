#!/usr/bin/env node
/**
 * WhatsApp Monitoring Script
 * 
 * Monitors Darius's WhatsApp messages for vendor-related information
 * and automatically updates the vendor database.
 * 
 * Usage: Run via cron or manually
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { extractVendorInfoFromMessage } from '../lib/vendors';
import { getVendors, addOrUpdateVendor, Vendor } from '../lib/googleSheets';

const execAsync = promisify(exec);

interface WhatsAppMessage {
  from: string;
  message: string;
  timestamp: string;
}

async function getRecentMessages(hours: number = 24): Promise<WhatsAppMessage[]> {
  try {
    // Use wacli to fetch recent messages
    const { stdout } = await execAsync(`wacli search --since ${hours}h --limit 100`);
    
    // Parse output (format depends on wacli implementation)
    const messages: WhatsAppMessage[] = [];
    const lines = stdout.trim().split('\n');
    
    for (const line of lines) {
      try {
        const msg = JSON.parse(line);
        messages.push({
          from: msg.from || 'Unknown',
          message: msg.text || msg.body || '',
          timestamp: msg.timestamp || new Date().toISOString(),
        });
      } catch (e) {
        // Skip malformed lines
      }
    }
    
    return messages;
  } catch (error) {
    console.error('Error fetching WhatsApp messages:', error);
    return [];
  }
}

async function processMessages() {
  console.log('🔍 Fetching recent WhatsApp messages...');
  
  const messages = await getRecentMessages(24);
  console.log(`📨 Found ${messages.length} messages to analyze`);
  
  let updatesCount = 0;
  
  for (const msg of messages) {
    const extracted = extractVendorInfoFromMessage(msg.message);
    
    if (extracted.vendorName && extracted.trade) {
      console.log(`\n✅ Found vendor mention: ${extracted.vendorName} (${extracted.trade})`);
      
      try {
        // Check if vendor exists
        const vendors = await getVendors(extracted.trade);
        const existingVendor = vendors.find(
          (v) => v.name.toLowerCase() === extracted.vendorName!.toLowerCase()
        );
        
        if (existingVendor) {
          // Update existing vendor
          console.log(`📝 Updating existing vendor: ${existingVendor.name}`);
          
          let newReliabilityScore = existingVendor.reliabilityScore;
          if (extracted.reliabilityUpdate) {
            newReliabilityScore = Math.max(
              1,
              Math.min(10, existingVendor.reliabilityScore + extracted.reliabilityUpdate)
            );
          }
          
          let newPerformanceNotes = existingVendor.performanceNotes || '';
          if (extracted.feedback) {
            const date = new Date(msg.timestamp).toLocaleDateString();
            newPerformanceNotes += `\n[${date}] ${extracted.feedback}`;
          }
          
          await addOrUpdateVendor({
            ...existingVendor,
            reliabilityScore: newReliabilityScore,
            performanceNotes: newPerformanceNotes.trim(),
          });
          
          updatesCount++;
        } else {
          // New vendor discovered
          console.log(`🆕 New vendor discovered: ${extracted.vendorName}`);
          console.log(`ℹ️ Need more info. Will prompt Darius.`);
          
          // TODO: Send WhatsApp message to Darius asking for vendor details
          // await sendWhatsAppToDarius(`New vendor mentioned: ${extracted.vendorName} (${extracted.trade}). Should I add them to the database?`);
        }
      } catch (error) {
        console.error(`Error processing vendor ${extracted.vendorName}:`, error);
      }
    }
  }
  
  console.log(`\n✨ Monitoring complete. ${updatesCount} vendor(s) updated.`);
}

// Run the monitoring
processMessages().catch(console.error);
