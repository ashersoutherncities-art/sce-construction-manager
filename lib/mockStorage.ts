// Mock in-memory storage for testing when Google Sheets is not configured

import type { Project, Vendor } from './googleSheets';

// In-memory storage (will reset on server restart)
const projects: Project[] = [];
const vendors: Vendor[] = [
  {
    id: 'VND-1',
    name: 'Charlotte Plumbing Co',
    trade: 'Plumber',
    location: 'Charlotte, NC',
    phone: '704-555-0100',
    email: 'contact@charlotteplumbing.com',
    reliabilityScore: 8.5,
    pricingTier: 'mid',
    performanceNotes: 'Reliable, on-time, great quality work',
    lastUpdated: new Date().toISOString(),
    totalJobs: 25,
    successfulJobs: 24,
  },
  {
    id: 'VND-2',
    name: 'Elite Electric',
    trade: 'Electrician',
    location: 'Charlotte, NC',
    phone: '704-555-0200',
    email: 'info@eliteelectric.com',
    reliabilityScore: 9.2,
    pricingTier: 'premium',
    performanceNotes: 'Top-tier work, licensed, insured',
    lastUpdated: new Date().toISOString(),
    totalJobs: 40,
    successfulJobs: 40,
  },
  {
    id: 'VND-3',
    name: 'Queen City HVAC',
    trade: 'HVAC',
    location: 'Charlotte, NC',
    phone: '704-555-0300',
    email: 'service@qchvac.com',
    reliabilityScore: 7.8,
    pricingTier: 'competitive',
    performanceNotes: 'Good value, occasional delays',
    lastUpdated: new Date().toISOString(),
    totalJobs: 30,
    successfulJobs: 27,
  },
];

export function addMockProject(project: Omit<Project, 'id'>): string {
  const projectId = `PRJ-${Date.now()}`;
  projects.push({ ...project, id: projectId });
  return projectId;
}

export function getMockProjects(): Project[] {
  return [...projects];
}

export function updateMockProjectStatus(projectId: string, status: Project['status']): void {
  const project = projects.find(p => p.id === projectId);
  if (project) {
    project.status = status;
  }
}

export function getMockVendors(trade?: string, location?: string): Vendor[] {
  let filtered = [...vendors];
  
  if (trade) {
    filtered = filtered.filter(v => 
      v.trade.toLowerCase().includes(trade.toLowerCase())
    );
  }
  
  if (location) {
    filtered = filtered.filter(v => 
      v.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  return filtered;
}

export function addOrUpdateMockVendor(vendor: Partial<Vendor> & { name: string; trade: string }): string {
  const existingIndex = vendors.findIndex(v => 
    v.name === vendor.name && v.trade === vendor.trade
  );
  
  const vendorId = vendor.id || `VND-${Date.now()}`;
  const fullVendor: Vendor = {
    id: vendorId,
    name: vendor.name,
    trade: vendor.trade,
    location: vendor.location || 'Charlotte, NC',
    phone: vendor.phone || '',
    email: vendor.email || '',
    reliabilityScore: vendor.reliabilityScore || 5,
    pricingTier: vendor.pricingTier || 'mid',
    performanceNotes: vendor.performanceNotes || '',
    lastUpdated: new Date().toISOString(),
    totalJobs: vendor.totalJobs || 0,
    successfulJobs: vendor.successfulJobs || 0,
  };
  
  if (existingIndex !== -1) {
    vendors[existingIndex] = fullVendor;
  } else {
    vendors.push(fullVendor);
  }
  
  return vendorId;
}
