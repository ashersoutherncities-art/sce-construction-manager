# Vendor Database

## Current Storage: Local JSON File

Since Google Sheets credentials are not yet configured, vendor data is temporarily stored in `vendors.json`.

### Structure

Each vendor entry includes:

```json
{
  "id": "VND-timestamp",
  "name": "Vendor Name",
  "trade": "Trade/Category",
  "location": "City, State",
  "phone": "Phone number",
  "email": "Email address",
  "reliabilityScore": 1-10,
  "pricingTier": "competitive|mid|premium|n/a",
  "performanceNotes": "Notes about vendor",
  "lastUpdated": "ISO timestamp",
  "totalJobs": 0,
  "successfulJobs": 0,
  "category": "Optional category",
  "organization": "Organization name",
  "role": "Role/title"
}
```

### Current Vendors

#### Government Contacts

- **Clint White** - Head of Permitting, City of Shelby
  - Email: clint.white@cityofshelby.com
  - Use for: Permit applications, inspections, regulatory questions
  - Location: Shelby, NC

### Migration to Google Sheets

Once Google Sheets credentials are configured:

1. Run the setup script:
   ```bash
   npm run setup:sheets
   ```

2. Update `.env` with the sheet IDs

3. Import data from `vendors.json` to the sheet:
   ```bash
   # Script to be created
   npm run migrate:vendors
   ```

### Adding New Vendors

Until Google Sheets is configured, manually add entries to `vendors.json` following the structure above.

When Google Sheets is ready, use the API:

```typescript
import { addOrUpdateVendor } from './lib/googleSheets';

await addOrUpdateVendor({
  name: "Vendor Name",
  trade: "Trade Type",
  location: "City, State",
  email: "email@example.com",
  reliabilityScore: 8,
  pricingTier: "mid"
});
```
