# 0G Skill (Decentralized AI Inference)

Use 0G Compute Network for decentralized model inference.

## Commands
- `og.models` — list available models from 0G inference endpoint
- `og.inference` — run chat completion inference against selected model

## Environment
- `OG_COMPUTE_BASE_URL` (default: `https://inference.0g.ai`)
- `OG_API_KEY` (recommended)

## Input pattern
```json
{
  "model": "<model-id>",
  "messages": [
    {"role":"user","content":"Hello from BuildAll"}
  ],
  "temperature": 0.2,
  "max_tokens": 256
}
```

## Recommended flow
1. `og.models` to discover a valid model id.
2. `og.inference` with user/system messages.
3. If request fails, surface HTTP status/body summary and request corrected model or auth.

## References
- 0G inference docs: https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference
