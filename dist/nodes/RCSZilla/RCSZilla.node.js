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
            description: 'Send SMS and WhatsApp messages through RCSZilla',
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
            requestDefaults: {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            },
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    default: 'queueMessage',
                    options: [
                        {
                            name: 'Get Pending Messages',
                            value: 'getPendingMessages',
                            action: 'Get pending messages',
                        },
                        {
                            name: 'Get Queue Status',
                            value: 'getQueueStatus',
                            action: 'Get queue status',
                        },
                        {
                            name: 'Log Outgoing',
                            value: 'logOutgoing',
                            action: 'Log outgoing message',
                        },
                        {
                            name: 'Mark Delivered',
                            value: 'markDelivered',
                            action: 'Mark message delivered',
                        },
                        {
                            name: 'Mark Failed',
                            value: 'markFailed',
                            action: 'Mark message failed',
                        },
                        {
                            name: 'Mark Processing',
                            value: 'markProcessing',
                            action: 'Mark message processing',
                        },
                        {
                            name: 'Mark Sent',
                            value: 'markSent',
                            action: 'Mark message sent',
                        },
                        {
                            name: 'Queue Message',
                            value: 'queueMessage',
                            action: 'Queue a message',
                        },
                        {
                            name: 'Submit Reply',
                            value: 'submitReply',
                            action: 'Submit an inbound reply',
                        },
                    ],
                },
                {
                    displayName: 'To',
                    name: 'to',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '+40712345678',
                    displayOptions: {
                        show: {
                            operation: ['queueMessage'],
                        },
                    },
                    description: 'Recipient phone number',
                },
                {
                    displayName: 'Message',
                    name: 'message',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                    },
                    required: true,
                    default: '',
                    displayOptions: {
                        show: {
                            operation: ['queueMessage', 'submitReply', 'logOutgoing'],
                        },
                    },
                },
                {
                    displayName: 'Channel',
                    name: 'channel',
                    type: 'options',
                    default: 'sms',
                    options: [
                        {
                            name: 'SMS',
                            value: 'sms',
                        },
                        {
                            name: 'WhatsApp',
                            value: 'whatsapp',
                        },
                    ],
                    displayOptions: {
                        show: {
                            operation: ['queueMessage', 'getPendingMessages', 'submitReply', 'logOutgoing'],
                        },
                    },
                },
                {
                    displayName: 'Scheduled At',
                    name: 'scheduledAt',
                    type: 'dateTime',
                    default: '',
                    displayOptions: {
                        show: {
                            operation: ['queueMessage'],
                        },
                    },
                    description: 'Optional time to send the message',
                },
                {
                    displayName: 'Queue ID',
                    name: 'queueId',
                    type: 'number',
                    required: true,
                    default: 0,
                    displayOptions: {
                        show: {
                            operation: [
                                'getQueueStatus',
                                'markProcessing',
                                'markSent',
                                'markDelivered',
                                'markFailed',
                            ],
                        },
                    },
                    description: 'RCSZilla outgoing_queue ID',
                },
                {
                    displayName: 'Failure Reason',
                    name: 'reason',
                    type: 'string',
                    default: '',
                    displayOptions: {
                        show: {
                            operation: ['markFailed'],
                        },
                    },
                },
                {
                    displayName: 'From Phone',
                    name: 'fromPhone',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '+40712345678',
                    displayOptions: {
                        show: {
                            operation: ['submitReply'],
                        },
                    },
                    description: 'Sender phone number for inbound replies',
                },
                {
                    displayName: 'To Phone',
                    name: 'toPhone',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '+40712345678',
                    displayOptions: {
                        show: {
                            operation: ['logOutgoing'],
                        },
                    },
                    description: 'Recipient phone number for an already-sent outgoing message',
                },
                {
                    displayName: 'Limit',
                    name: 'limit',
                    type: 'number',
                    default: 50,
                    typeOptions: {
                        minValue: 1,
                        maxValue: 200,
                    },
                    displayOptions: {
                        show: {
                            operation: ['getPendingMessages'],
                        },
                    },
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
                const request = buildRequest(this, operation, i);
                const response = await this.helpers.httpRequestWithAuthentication.call(this, 'rcsZillaApi', {
                    method: request.method,
                    baseURL: baseUrl,
                    url: '/',
                    qs: request.qs,
                    body: request.body,
                    json: true,
                });
                if ((response === null || response === void 0 ? void 0 : response.success) === false) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), response.message || 'RCSZilla API error', {
                        itemIndex: i,
                        description: JSON.stringify(response),
                    });
                }
                returnData.push({
                    json: response,
                    pairedItem: {
                        item: i,
                    },
                });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                        },
                        pairedItem: {
                            item: i,
                        },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.RCSZilla = RCSZilla;
function buildRequest(executeFunctions, operation, itemIndex) {
    switch (operation) {
        case 'queueMessage': {
            const scheduledAt = executeFunctions.getNodeParameter('scheduledAt', itemIndex, '');
            const body = {
                to: executeFunctions.getNodeParameter('to', itemIndex),
                message: executeFunctions.getNodeParameter('message', itemIndex),
                channel: executeFunctions.getNodeParameter('channel', itemIndex),
            };
            if (scheduledAt) {
                body.scheduled_at = formatDateTime(scheduledAt);
            }
            return {
                method: 'POST',
                qs: { endpoint: 'queue_sms' },
                body,
            };
        }
        case 'getQueueStatus':
            return {
                method: 'GET',
                qs: {
                    endpoint: 'queue_status',
                    id: executeFunctions.getNodeParameter('queueId', itemIndex),
                },
            };
        case 'getPendingMessages':
            return {
                method: 'GET',
                qs: {
                    endpoint: 'pending_messages',
                    limit: executeFunctions.getNodeParameter('limit', itemIndex),
                    channel: executeFunctions.getNodeParameter('channel', itemIndex),
                },
            };
        case 'markProcessing':
            return queueStateRequest(executeFunctions, 'mark_processing', itemIndex);
        case 'markSent':
            return queueStateRequest(executeFunctions, 'mark_sent', itemIndex);
        case 'markDelivered':
            return queueStateRequest(executeFunctions, 'mark_delivered', itemIndex);
        case 'markFailed':
            return {
                method: 'POST',
                qs: { endpoint: 'mark_failed' },
                body: {
                    id: executeFunctions.getNodeParameter('queueId', itemIndex),
                    reason: executeFunctions.getNodeParameter('reason', itemIndex, ''),
                },
            };
        case 'submitReply':
            return {
                method: 'POST',
                qs: { endpoint: 'submit_reply' },
                body: {
                    from_phone: executeFunctions.getNodeParameter('fromPhone', itemIndex),
                    message: executeFunctions.getNodeParameter('message', itemIndex),
                    channel: executeFunctions.getNodeParameter('channel', itemIndex),
                },
            };
        case 'logOutgoing':
            return {
                method: 'POST',
                qs: { endpoint: 'log_outgoing' },
                body: {
                    to_phone: executeFunctions.getNodeParameter('toPhone', itemIndex),
                    message: executeFunctions.getNodeParameter('message', itemIndex),
                    channel: executeFunctions.getNodeParameter('channel', itemIndex),
                },
            };
        default:
            throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), `Unsupported operation: ${operation}`, {
                itemIndex,
            });
    }
}
function queueStateRequest(executeFunctions, endpoint, itemIndex) {
    return {
        method: 'POST',
        qs: { endpoint },
        body: {
            id: executeFunctions.getNodeParameter('queueId', itemIndex),
        },
    };
}
function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    const pad = (part) => String(part).padStart(2, '0');
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
