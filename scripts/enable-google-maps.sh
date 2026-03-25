#!/bin/bash

# Script to enable Google Maps APIs and create an API key
# Requires gcloud CLI installed and authenticated

set -e

PROJECT_ID="asher-new-project"

echo "🗺️  Setting up Google Maps API for ${PROJECT_ID}..."
echo ""

# Set the project
echo "Setting active project..."
gcloud config set project ${PROJECT_ID}

echo ""
echo "Enabling required APIs..."

# Enable Maps JavaScript API
echo "  ✓ Enabling Maps JavaScript API..."
gcloud services enable maps-backend.googleapis.com

# Enable Places API
echo "  ✓ Enabling Places API..."
gcloud services enable places-backend.googleapis.com

echo ""
echo "Creating API key..."

# Create API key
API_KEY=$(gcloud alpha services api-keys create \
  --display-name="SCE Construction Manager - Places Autocomplete" \
  --api-target=service=maps-backend.googleapis.com \
  --api-target=service=places-backend.googleapis.com \
  --allowed-referrers="http://localhost:*,https://*.vercel.app/*" \
  --format="value(name)")

# Get the actual key value
KEY_STRING=$(gcloud alpha services api-keys get-key-string ${API_KEY} --format="value(keyString)")

echo ""
echo "✅ Setup complete!"
echo ""
echo "Your API key: ${KEY_STRING}"
echo ""
echo "Add this to your .env file:"
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${KEY_STRING}"
echo ""
echo "Then restart your dev server: npm run dev"
