# Photo Analysis JSON Parsing Fix

## Problem
The photo analysis endpoint was failing with:
```
"Unexpected token '3', 'Body exce'... is not valid JSON"
```

When users uploaded photos and clicked "Analyze Photos", the OpenAI GPT-4o response wasn't being parsed correctly.

## Root Cause
The `analyzePropertyPhotos` function in `lib/openai.ts` was using regex patterns to extract JSON from the AI response:
```typescript
const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                 content.match(/```\s*([\s\S]*?)\s*```/) ||
                 content.match(/(\{[\s\S]*\})/);
```

This approach had several issues:
1. GPT-4o might return conversational text before/after JSON
2. Markdown code blocks aren't guaranteed
3. The greedy regex `(\{[\s\S]*\})` could capture partial JSON
4. No guarantee the model returns valid JSON at all

## Solution
Added `response_format: { type: 'json_object' }` to the OpenAI API call:

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages,
  max_tokens: 4096,
  temperature: 0.7,
  response_format: { type: 'json_object' }, // ✅ Forces JSON output
});
```

This parameter:
- Forces GPT-4o to return ONLY valid JSON
- Eliminates markdown wrappers
- Guarantees parseable response
- No need for regex extraction

## Changes Made

### File: `lib/openai.ts`

1. **Added `response_format` parameter** (line ~65)
   ```typescript
   response_format: { type: 'json_object' }
   ```

2. **Simplified parsing logic**
   ```typescript
   // Before: Complex regex extraction
   const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)...
   
   // After: Direct parse with validation
   const parsed = JSON.parse(content);
   if (!parsed.summary || !parsed.recommendations || !Array.isArray(parsed.recommendations)) {
     throw new Error('AI response missing required fields');
   }
   ```

3. **Updated system prompt**
   - Added explicit instruction: "You must respond with ONLY a JSON object (no markdown, no explanations)"
   - Clarifies expected behavior even though `response_format` enforces it

4. **Improved error logging**
   - Truncates logged content to first 500 chars to avoid overwhelming logs
   - Validates response structure before returning

## Testing

### Manual Test
1. Start the dev server: `npm run dev`
2. Upload 6 property photos (walkways, concrete, fencing)
3. Click "Analyze Photos"
4. Should return:
   - Summary of property condition
   - Categorized recommendations (priority, cost, ARV impact)
   - Total estimated cost
   - Estimated ARV increase

### Quick Test Script
Run `node test-photo-analysis.js` (requires server running on localhost:3000)

## Expected Behavior
- ✅ Clean JSON response every time
- ✅ Proper structure with all required fields
- ✅ No more "Unexpected token" errors
- ✅ Better error messages if something goes wrong

## Related Files
- `/pages/api/ai/analyze-photos.ts` - API endpoint (no changes needed)
- `/lib/openai.ts` - Core fix implemented here
- `test-photo-analysis.js` - Test script

## OpenAI Documentation
- [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [JSON mode with `response_format`](https://platform.openai.com/docs/guides/text-generation/json-mode)
