"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RCSZilla = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class RCSZilla {
    constructor() {
        this.description = {
            displayName: 'RCSZilla',
            name: 'rcsZilla',
            icon: 'file:rcszilla.png',
            group: ['output'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Send SMS, WhatsApp messages, and OTP codes — and read incoming messages and emails — via RCSZilla',
            defaults: {
                name: 'RCSZilla',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'rcsZillaApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    default: 'queueMessage',
                    options: [
                        // ── Sending ──────────────────────────────────────────────
                        {
                            name: 'Send Message',
                            value: 'queueMessage',
                            action: 'Send an SMS or WhatsApp message',
                            description: 'Add one or more messages to the send queue. Your phone or paid provider delivers them.',
                        },
                        {
                            name: 'Send OTP Code',
                            value: 'sendOtp',
                            action: 'Send a one-time verification code',
                            description: 'Generate a numeric OTP and deliver it via SMS or email.',
                        },
                        {
                            name: 'Verify OTP Code',
                            value: 'verifyOtp',
                            action: 'Verify a one-time code entered by a user',
                            description: 'Check whether the code a user entered matches the one that was sent.',
                        },
                        // ── Receiving ─────────────────────────────────────────────
                        {
                            name: 'Get Incoming Messages',
                            value: 'getIncomingMessages',
                            action: 'Get received SMS or WhatsApp messages',
                            description: 'Retrieve inbound messages received on your connected devices.',
                        },
                        {
                            name: 'Get Incoming Emails',
                            value: 'getIncomingEmails',
                            action: 'Get received emails',
                            description: 'Retrieve emails received on your connected mailboxes.',
                        },
                        // ── Tracking ──────────────────────────────────────────────
                        {
                            name: 'Check Message Status',
                            value: 'getQueueStatus',
                            action: 'Check the delivery status of a queued message',
                            description: 'Look up the current state (pending, sent, delivered, failed) of a message by its queue ID.',
                        },
                        // ── Device / Advanced ─────────────────────────────────────
                        {
                            name: 'Fetch Pending Messages',
                            value: 'getPendingMessages',
                            action: 'Fetch messages waiting to be sent',
                            description: 'Claim and return unprocessed messages from the send queue. Typically used by device apps.',
                        },
                        {
                            name: 'Mark Message Sent',
                            value: 'markSent',
                            action: 'Mark a message as sent',
                            description: 'Tell the server that a device successfully transmitted a queued message.',
                        },
                        {
                            name: 'Mark Message Delivered',
                            value: 'markDelivered',
                            action: 'Mark a message as delivered',
                            description: "Confirm the recipient's device received the message (carrier delivery receipt).",
                        },
                        {
                            name: 'Mark Message Failed',
                            value: 'markFailed',
                            action: 'Mark a message as failed',
                            description: 'Report that a message could not be sent, optionally with an error reason.',
                        },
                        {
                            name: 'Mark Message Processing',
                            value: 'markProcessing',
                            action: 'Mark a message as being processed',
                            description: 'Tell the server a device has picked up a message and is about to send it.',
                        },
                        {
                            name: 'Log Sent Message',
                            value: 'logOutgoing',
                            action: 'Log a message already sent by a device',
                            description: 'Record an outgoing message sent outside the queue (e.g. an AI-generated auto-reply).',
                        },
                        {
                            name: 'Record Inbound Reply',
                            value: 'submitReply',
                            action: 'Record an inbound SMS or WhatsApp reply',
                            description: 'Submit a message received on a device so the server can store it and trigger auto-reply rules.',
                        },
                    ],
                },
                // ── Send Message ─────────────────────────────────────────────────
                {
                    displayName: 'Send To',
                    name: 'recipientMode',
                    type: 'options',
                    options: [
                        {
                            name: 'Single Recipient',
                            value: 'single',
                            description: 'Send to one phone number',
                        },
                        {
                            name: 'Multiple Recipients (Bulk)',
                            value: 'bulk',
                            description: 'Send to several phone numbers at once — each can have its own message',
                        },
                    ],
                    default: 'single',
                    displayOptions: { show: { operation: ['queueMessage'] } },
                },
                {
                    displayName: 'Phone Number',
                    name: 'to',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '+40712345678',
                    displayOptions: {
                        show: {
                            operation: ['queueMessage'],
                            recipientMode: ['single'],
                        },
                    },
                    description: 'Recipient phone number in international format',
                },
                {
                    displayName: 'Recipients',
                    name: 'recipients',
                    type: 'string',
                    typeOptions: { rows: 5 },
                    required: true,
                    default: '',
                    placeholder: '+40712345678\n+40712345679',
                    displayOptions: {
                        show: {
                            operation: ['queueMessage'],
                            recipientMode: ['bulk'],
                        },
                    },
                    description: 'Pass phone numbers (one per line) <b>or</b> an expression that returns an array of objects — see the hint below.',
                },
                {
                    displayName: '💡 Bulk mode accepts a single object or an array of objects.\nEach item: { "phone": "+40712345678", "body": "Your message", "label": "tag", "subject": "subject", "is_priority": 1 }\nTo pull from a previous step: ={{ $json.items }}. Message field can be left blank.',
                    name: 'bulkHint',
                    type: 'notice',
                    default: '',
                    displayOptions: {
                        show: {
                            operation: ['queueMessage'],
                            recipientMode: ['bulk'],
                        },
                    },
                    description: '',
                },
                {
                    displayName: 'Message',
                    name: 'message',
                    type: 'string',
                    typeOptions: { rows: 4 },
                    required: true,
                    default: '',
                    description: 'The text to send. Not needed in bulk mode when each recipient object already contains its own message.',
                    displayOptions: {
                        show: { operation: ['queueMessage', 'submitReply', 'logOutgoing'] },
                    },
                },
                {
                    displayName: 'Channel',
                    name: 'channel',
                    type: 'options',
                    default: 'sms',
                    options: [
                        { name: 'SMS', value: 'sms' },
                        { name: 'WhatsApp', value: 'whatsapp' },
                    ],
                    displayOptions: {
                        show: {
                            operation: ['queueMessage', 'getPendingMessages', 'submitReply', 'logOutgoing'],
                        },
                    },
                    description: 'Delivery channel',
                },
                {
                    displayName: 'Schedule For',
                    name: 'scheduledAt',
                    type: 'dateTime',
                    default: '',
                    displayOptions: { show: { operation: ['queueMessage'] } },
                    description: 'Leave empty to send as soon as a device is available, or pick a date and time to schedule delivery',
                },
                // ── Check Message Status / Mark operations ───────────────────────
                {
                    displayName: 'Queue ID',
                    name: 'queueId',
                    type: 'number',
                    required: true,
                    default: 0,
                    displayOptions: {
                        show: {
                            operation: ['getQueueStatus', 'markProcessing', 'markSent', 'markDelivered', 'markFailed'],
                        },
                    },
                    description: 'The numeric ID returned when the message was queued (the "id" field in the Send Message response)',
                },
                {
                    displayName: 'Failure Reason',
                    name: 'reason',
                    type: 'string',
                    default: '',
                    placeholder: 'No SIM card, network timeout …',
                    displayOptions: { show: { operation: ['markFailed'] } },
                    description: 'Optional explanation for why the message failed',
                },
                // ── Record Inbound Reply ─────────────────────────────────────────
                {
                    displayName: 'From Phone',
                    name: 'fromPhone',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '+40712345678',
                    displayOptions: { show: { operation: ['submitReply'] } },
                    description: "The contact's phone number that sent the reply",
                },
                // ── Log Sent Message ─────────────────────────────────────────────
                {
                    displayName: 'To Phone',
                    name: 'toPhone',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '+40712345678',
                    displayOptions: { show: { operation: ['logOutgoing'] } },
                    description: 'The phone number the message was sent to',
                },
                // ── Fetch Pending Messages ────────────────────────────────────────
                {
                    displayName: 'Limit',
                    name: 'limit',
                    type: 'number',
                    default: 50,
                    typeOptions: { minValue: 1, maxValue: 200 },
                    displayOptions: { show: { operation: ['getPendingMessages'] } },
                    description: 'Maximum number of messages to return (1–200)',
                },
                // ── Send OTP Code ─────────────────────────────────────────────────
                {
                    displayName: 'Recipient',
                    name: 'otpRecipient',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '+40712345678 or user@example.com',
                    displayOptions: { show: { operation: ['sendOtp'] } },
                    description: 'Phone number for SMS delivery, or email address for email delivery',
                },
                {
                    displayName: 'Channel',
                    name: 'otpChannel',
                    type: 'options',
                    options: [
                        { name: 'SMS', value: 'sms' },
                        { name: 'Email', value: 'email' },
                    ],
                    default: 'sms',
                    displayOptions: { show: { operation: ['sendOtp'] } },
                    description: 'How to deliver the OTP',
                },
                {
                    displayName: 'Additional Options',
                    name: 'otpOptions',
                    type: 'collection',
                    placeholder: 'Add Option',
                    default: {},
                    displayOptions: { show: { operation: ['sendOtp'] } },
                    options: [
                        {
                            displayName: 'Language',
                            name: 'lang',
                            type: 'string',
                            default: 'en',
                            placeholder: 'en',
                            description: 'Language code for the OTP message text (e.g. en, ro, de, fr)',
                        },
                        {
                            displayName: 'Reference ID',
                            name: 'refId',
                            type: 'string',
                            default: '',
                            description: 'Optional ID you want to attach to this OTP (e.g. an order ID or user ID). Returned when the code is verified.',
                        },
                    ],
                },
                // ── Verify OTP Code ───────────────────────────────────────────────
                {
                    displayName: 'Recipient',
                    name: 'verifyRecipient',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '+40712345678 or user@example.com',
                    displayOptions: { show: { operation: ['verifyOtp'] } },
                    description: 'The same phone number or email address the OTP was sent to',
                },
                {
                    displayName: 'Code',
                    name: 'verifyCode',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '123456',
                    displayOptions: { show: { operation: ['verifyOtp'] } },
                    description: 'The code the user entered',
                },
                // ── Get Incoming Messages ─────────────────────────────────────────
                {
                    displayName: 'Filters',
                    name: 'incomingMsgFilters',
                    type: 'collection',
                    placeholder: 'Add Filter',
                    default: {},
                    displayOptions: { show: { operation: ['getIncomingMessages'] } },
                    description: 'Narrow down which messages to return',
                    options: [
                        {
                            displayName: 'Channel',
                            name: 'channel',
                            type: 'options',
                            options: [
                                { name: 'Any', value: '' },
                                { name: 'SMS', value: 'sms' },
                                { name: 'WhatsApp', value: 'whatsapp' },
                            ],
                            default: '',
                            description: 'Filter by delivery channel',
                        },
                        {
                            displayName: 'From Phone',
                            name: 'fromPhone',
                            type: 'string',
                            default: '',
                            placeholder: '+40712345678',
                            description: 'Only return messages from this sender',
                        },
                        {
                            displayName: 'Received After',
                            name: 'since',
                            type: 'dateTime',
                            default: '',
                            description: 'Only return messages received on or after this date/time',
                        },
                        {
                            displayName: 'Received Before',
                            name: 'until',
                            type: 'dateTime',
                            default: '',
                            description: 'Only return messages received before this date/time',
                        },
                        {
                            displayName: 'After ID',
                            name: 'afterId',
                            type: 'number',
                            default: 0,
                            description: 'Only return messages with an ID greater than this value (useful for polling for new messages)',
                        },
                        {
                            displayName: 'Limit',
                            name: 'limit',
                            type: 'number',
                            default: 50,
                            typeOptions: { minValue: 1, maxValue: 100 },
                            description: 'Maximum number of messages to return',
                        },
                        {
                            displayName: 'Offset',
                            name: 'offset',
                            type: 'number',
                            default: 0,
                            description: 'Number of messages to skip (for pagination)',
                        },
                    ],
                },
                // ── Get Incoming Emails ───────────────────────────────────────────
                {
                    displayName: 'Filters',
                    name: 'incomingEmailFilters',
                    type: 'collection',
                    placeholder: 'Add Filter',
                    default: {},
                    displayOptions: { show: { operation: ['getIncomingEmails'] } },
                    description: 'Narrow down which emails to return',
                    options: [
                        {
                            displayName: 'From Email',
                            name: 'fromEmail',
                            type: 'string',
                            default: '',
                            placeholder: 'sender@example.com',
                            description: 'Only return emails from this sender',
                        },
                        {
                            displayName: 'Search',
                            name: 'search',
                            type: 'string',
                            default: '',
                            description: 'Search by subject, sender email address, or sender name',
                        },
                        {
                            displayName: 'Received After',
                            name: 'since',
                            type: 'dateTime',
                            default: '',
                            description: 'Only return emails received on or after this date/time',
                        },
                        {
                            displayName: 'Received Before',
                            name: 'until',
                            type: 'dateTime',
                            default: '',
                            description: 'Only return emails received before this date/time',
                        },
                        {
                            displayName: 'After ID',
                            name: 'afterId',
                            type: 'number',
                            default: 0,
                            description: 'Only return emails with an ID greater than this value (useful for polling for new emails)',
                        },
                        {
                            displayName: 'Limit',
                            name: 'limit',
                            type: 'number',
                            default: 50,
                            typeOptions: { minValue: 1, maxValue: 100 },
                            description: 'Maximum number of emails to return',
                        },
                        {
                            displayName: 'Offset',
                            name: 'offset',
                            type: 'number',
                            default: 0,
                            description: 'Number of emails to skip (for pagination)',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('rcsZillaApi');
        const baseUrl = String(credentials.baseUrl).replace(/\/+$/, '');
        for (let i = 0; i < items.length; i++) {
            try {
                const operation = this.getNodeParameter('operation', i);
                // Bulk send: one API call with all items, each with its own phone + message
                if (operation === 'queueMessage') {
                    const recipientMode = this.getNodeParameter('recipientMode', i, 'single');
                    if (recipientMode === 'bulk') {
                        const rawRecipients = this.getNodeParameter('recipients', i);
                        const bulkItems = parseBulkItems(rawRecipients, this.getNodeParameter('message', i, ''), this.getNodeParameter('channel', i, 'sms'), this.getNodeParameter('scheduledAt', i, ''));
                        if (!bulkItems.length) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No valid items found. Provide phone numbers in the Phone Numbers field or an array of {to, message} objects.', { itemIndex: i });
                        }
                        const resp = await callApi(this, baseUrl, {
                            method: 'POST',
                            qs: { endpoint: 'queue_bulk' },
                            body: { items: bulkItems },
                        });
                        checkSuccess(this, resp, i);
                        returnData.push({ json: resp, pairedItem: { item: i } });
                        continue;
                    }
                }
                const request = buildRequest(this, operation, i);
                const response = await callApi(this, baseUrl, request);
                checkSuccess(this, response, i);
                returnData.push({
                    json: response,
                    pairedItem: { item: i },
                });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: error.message },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw toNodeApiError(this, error, i);
            }
        }
        return [returnData];
    }
}
exports.RCSZilla = RCSZilla;
async function callApi(ef, baseUrl, request) {
    return ef.helpers.httpRequestWithAuthentication.call(ef, 'rcsZillaApi', {
        method: request.method,
        baseURL: baseUrl,
        url: '/',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        qs: request.qs,
        body: request.body,
        json: true,
    });
}
function checkSuccess(ef, response, itemIndex) {
    const resp = response;
    if ((resp === null || resp === void 0 ? void 0 : resp.success) === false) {
        throw new n8n_workflow_1.NodeOperationError(ef.getNode(), resp.message || 'RCSZilla API returned an error', {
            itemIndex,
            description: JSON.stringify(response),
        });
    }
}
function toNodeApiError(ef, error, itemIndex) {
    if (error instanceof n8n_workflow_1.NodeApiError || error instanceof n8n_workflow_1.NodeOperationError)
        return error;
    return new n8n_workflow_1.NodeApiError(ef.getNode(), error, { itemIndex });
}
function parseBulkItems(value, fallbackMessage, fallbackChannel, fallbackScheduledAt) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const raw = Array.isArray(value) ? value : String(value).split(/[\n,;]+/);
    const items = [];
    for (const entry of raw) {
        if (typeof entry === 'object' && entry !== null) {
            const obj = entry;
            // accept to/phone and message/body as equivalent field names
            const to = String((_b = (_a = obj.to) !== null && _a !== void 0 ? _a : obj.phone) !== null && _b !== void 0 ? _b : '').trim();
            const msg = String((_e = (_d = (_c = obj.message) !== null && _c !== void 0 ? _c : obj.body) !== null && _d !== void 0 ? _d : fallbackMessage) !== null && _e !== void 0 ? _e : '').trim();
            if (!to || !msg)
                continue;
            const item = { to, message: msg, channel: (_f = obj.channel) !== null && _f !== void 0 ? _f : fallbackChannel };
            const sched = String((_h = (_g = obj.scheduled_at) !== null && _g !== void 0 ? _g : fallbackScheduledAt) !== null && _h !== void 0 ? _h : '').trim();
            if (sched)
                item.scheduled_at = formatDateTime(sched);
            items.push(item);
        }
        else {
            // plain phone number — use the shared Message field
            const to = String(entry).trim();
            if (!to || !fallbackMessage)
                continue;
            const item = { to, message: fallbackMessage, channel: fallbackChannel };
            if (fallbackScheduledAt)
                item.scheduled_at = formatDateTime(fallbackScheduledAt);
            items.push(item);
        }
    }
    return items;
}
function buildQueueMessageRequest(ef, itemIndex, toPhone) {
    const scheduledAt = ef.getNodeParameter('scheduledAt', itemIndex, '');
    const body = {
        to: toPhone,
        message: ef.getNodeParameter('message', itemIndex),
        channel: ef.getNodeParameter('channel', itemIndex),
    };
    if (scheduledAt)
        body.scheduled_at = formatDateTime(scheduledAt);
    return { method: 'POST', qs: { endpoint: 'queue_sms' }, body };
}
function buildRequest(ef, operation, itemIndex) {
    switch (operation) {
        case 'queueMessage': {
            const to = ef.getNodeParameter('to', itemIndex);
            return buildQueueMessageRequest(ef, itemIndex, to);
        }
        case 'getQueueStatus':
            return {
                method: 'GET',
                qs: { endpoint: 'queue_status', id: ef.getNodeParameter('queueId', itemIndex) },
            };
        case 'getPendingMessages':
            return {
                method: 'GET',
                qs: {
                    endpoint: 'pending_messages',
                    limit: ef.getNodeParameter('limit', itemIndex),
                    channel: ef.getNodeParameter('channel', itemIndex),
                },
            };
        case 'markProcessing':
            return queueStateRequest(ef, 'mark_processing', itemIndex);
        case 'markSent':
            return queueStateRequest(ef, 'mark_sent', itemIndex);
        case 'markDelivered':
            return queueStateRequest(ef, 'mark_delivered', itemIndex);
        case 'markFailed':
            return {
                method: 'POST',
                qs: { endpoint: 'mark_failed' },
                body: {
                    id: ef.getNodeParameter('queueId', itemIndex),
                    reason: ef.getNodeParameter('reason', itemIndex, ''),
                },
            };
        case 'submitReply':
            return {
                method: 'POST',
                qs: { endpoint: 'submit_reply' },
                body: {
                    from_phone: ef.getNodeParameter('fromPhone', itemIndex),
                    message: ef.getNodeParameter('message', itemIndex),
                    channel: ef.getNodeParameter('channel', itemIndex),
                },
            };
        case 'logOutgoing':
            return {
                method: 'POST',
                qs: { endpoint: 'log_outgoing' },
                body: {
                    to_phone: ef.getNodeParameter('toPhone', itemIndex),
                    message: ef.getNodeParameter('message', itemIndex),
                    channel: ef.getNodeParameter('channel', itemIndex),
                },
            };
        case 'sendOtp': {
            const opts = ef.getNodeParameter('otpOptions', itemIndex, {});
            const body = {
                recipient: ef.getNodeParameter('otpRecipient', itemIndex),
                channel: ef.getNodeParameter('otpChannel', itemIndex),
            };
            if (opts.lang)
                body.lang = opts.lang;
            if (opts.refId)
                body.ref_id = opts.refId;
            return { method: 'POST', qs: { endpoint: 'send_otp' }, body };
        }
        case 'verifyOtp':
            return {
                method: 'POST',
                qs: { endpoint: 'verify_otp' },
                body: {
                    recipient: ef.getNodeParameter('verifyRecipient', itemIndex),
                    code: ef.getNodeParameter('verifyCode', itemIndex),
                },
            };
        case 'getIncomingMessages': {
            const f = ef.getNodeParameter('incomingMsgFilters', itemIndex, {});
            const qs = { endpoint: 'incoming_messages' };
            if (f.channel)
                qs.channel = f.channel;
            if (f.fromPhone)
                qs.from_phone = f.fromPhone;
            if (f.since)
                qs.since = f.since;
            if (f.until)
                qs.until = f.until;
            if (f.afterId)
                qs.after_id = f.afterId;
            if (f.limit)
                qs.limit = f.limit;
            if (f.offset)
                qs.offset = f.offset;
            return { method: 'GET', qs };
        }
        case 'getIncomingEmails': {
            const f = ef.getNodeParameter('incomingEmailFilters', itemIndex, {});
            const qs = { endpoint: 'incoming_emails' };
            if (f.fromEmail)
                qs.from_email = f.fromEmail;
            if (f.search)
                qs.search = f.search;
            if (f.since)
                qs.since = f.since;
            if (f.until)
                qs.until = f.until;
            if (f.afterId)
                qs.after_id = f.afterId;
            if (f.limit)
                qs.limit = f.limit;
            if (f.offset)
                qs.offset = f.offset;
            return { method: 'GET', qs };
        }
        default:
            throw new n8n_workflow_1.NodeOperationError(ef.getNode(), `Unsupported operation: ${operation}`, {
                itemIndex,
            });
    }
}
function queueStateRequest(ef, endpoint, itemIndex) {
    return {
        method: 'POST',
        qs: { endpoint },
        body: { id: ef.getNodeParameter('queueId', itemIndex) },
    };
}
function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    const pad = (n) => String(n).padStart(2, '0');
    return ([date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
        ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`);
}
