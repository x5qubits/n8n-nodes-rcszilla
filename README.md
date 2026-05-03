# n8n-nodes-rcszilla

This is an n8n community node for [RCSZilla](https://rcszilla.com). It lets n8n workflows send free device-based or paid provider SMS and WhatsApp messages, check queue status, read pending queue items, update delivery state, submit inbound replies, log outgoing device-side messages, and connect automation flows to RCSZilla AI auto-replies.

## Installation

Install from the n8n Community Nodes screen:

```
n8n-nodes-rcszilla
```

For local development:

```bash
npm install
npm run build
npm link

cd ~/.n8n/custom
npm link n8n-nodes-rcszilla
n8n start
```

Node.js 18.17 or newer is required by current n8n community-node tooling.

## Credentials

Create an **RCSZilla API** credential with:

- **API Token**: a user API key or device token from RCSZilla.

The public RCSZilla API URL is used automatically in n8n and is hidden from the credential form. Create an account at [rcszilla.com](https://rcszilla.com/) first, then generate an API key from the web panel.

The node sends the token using both `Authorization: Bearer ...` and `X-API-Token` for compatibility with servers that strip authorization headers.

## Operations

- **Queue Message**: calls `queue_sms` with `to`, `message`, `channel`, and optional `scheduled_at`.
- **Get Queue Status**: calls `queue_status`.
- **Get Pending Messages**: calls `pending_messages`.
- **Mark Processing**, **Mark Sent**, **Mark Delivered**, **Mark Failed**: updates a queue item state.
- **Submit Reply**: calls `submit_reply` to store an inbound SMS/WhatsApp reply.
- **Log Outgoing**: calls `log_outgoing` for device-side or AI-generated sent messages.

## What You Can Automate

- Free SMS/WhatsApp delivery through connected Android devices.
- Paid SMS routing through configured cloud providers.
- Appointment reminders, confirmations, and cancellation replies.
- AI-assisted auto-reply workflows using incoming messages and logged outgoing replies.
- Queue status checks and delivery-state updates for reliable workflow branching.

## Publishing

Before publishing:

```bash
npm install
npm run lint
npm run build
npm pack --dry-run
```

For n8n verified-community-node submission, publish from GitHub Actions with npm provenance. This package includes `.github/workflows/publish.yml`; configure an `NPM_TOKEN` repository secret and create a release/tag.
