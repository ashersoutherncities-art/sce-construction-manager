# Documentation Directory

Additional documentation for the SCE Construction Manager.

---

## 📚 Available Guides

### [GOOGLE-MAPS-SETUP.md](./GOOGLE-MAPS-SETUP.md)
**Google Maps API setup for address autocomplete**

Learn how to:
- Create a Google Cloud project
- Enable Places API and Maps JavaScript API
- Generate and restrict an API key
- Configure the app for address autocomplete
- Understand pricing and limits
- Troubleshoot common issues

**Who needs this:** Anyone setting up the address autocomplete feature (optional)

---

### [TESTING.md](./TESTING.md)
**Complete testing guide**

Covers:
- Quick automated tests (`npm run test:openai`, `npm run test:photos`)
- Manual testing procedures
- Error handling tests
- Performance testing
- Browser compatibility
- Google Sheets/Drive integration testing
- Debugging tips

**Who needs this:** Anyone testing the app before deployment or troubleshooting issues

---

### [FIXES-APPLIED.md](./FIXES-APPLIED.md)
**Recent fixes and improvements (March 22, 2024)**

Documents:
- AI SOW tool fixes (OpenAI model updates)
- Address autocomplete implementation
- Error handling improvements
- Documentation updates
- Testing tools added
- Deployment readiness

**Who needs this:** Anyone wanting to understand recent changes or verify fixes

---

## Quick Links

### Getting Started
1. Start here: [../QUICKSTART.md](../QUICKSTART.md)
2. Then read: [../USER-GUIDE.md](../USER-GUIDE.md)

### Setup Features
1. Google Maps: [GOOGLE-MAPS-SETUP.md](./GOOGLE-MAPS-SETUP.md)

### Testing
1. Test OpenAI: `npm run test:openai`
2. Test photos: `npm run test:photos`
3. Full guide: [TESTING.md](./TESTING.md)

### Deployment
1. Production guide: [../DEPLOYMENT.md](../DEPLOYMENT.md)

### Troubleshooting
1. Common issues: [../QUICKSTART.md#troubleshooting](../QUICKSTART.md#troubleshooting)
2. Testing/debugging: [TESTING.md](./TESTING.md)

---

## Documentation Structure

```
sce-construction-manager/
├── README.md              # Technical overview
├── QUICKSTART.md          # 5-minute setup guide
├── USER-GUIDE.md          # Complete user manual
├── DEPLOYMENT.md          # Production deployment
├── HANDOFF.md             # System handoff
├── PROJECT-STATUS.md      # Project status
└── docs/
    ├── README.md          # This file
    ├── GOOGLE-MAPS-SETUP.md   # Google Maps setup
    ├── TESTING.md         # Testing guide
    └── FIXES-APPLIED.md   # Recent changes
```

---

## Need Help?

1. **Setup issues?** → Check [../QUICKSTART.md](../QUICKSTART.md)
2. **Feature setup?** → Check guides in this directory
3. **Testing?** → See [TESTING.md](./TESTING.md)
4. **Deployment?** → See [../DEPLOYMENT.md](../DEPLOYMENT.md)
5. **Still stuck?** → Email: dariuswalton906@gmail.com

---

## Contributing

When adding new documentation:
1. Add to this README with brief description
2. Include "Who needs this" section
3. Link from main documentation where relevant
4. Use clear headings and structure
5. Include examples and commands

---

**Last Updated:** March 22, 2024
