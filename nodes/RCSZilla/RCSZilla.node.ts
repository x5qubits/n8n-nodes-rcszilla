import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

type HttpMethod = 'GET' | 'POST';

export class RCSZilla implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RCSZilla',
		name: 'rcsZilla',
		icon: 'file:rcszilla.png',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send free device-based or paid provider SMS and WhatsApp messages with queue tracking, replies, and AI auto-reply support',
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
				displayName:
					'You need a RCSZilla account to use this node. Register at <a href="https://rcszilla.com/" target="_blank">rcszilla.com</a>, then create an API key or device token in RCSZilla.',
				name: 'accountNotice',
				type: 'notice',
				default: '',
			},
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('rcsZillaApi');
		const baseUrl = String(credentials.baseUrl).replace(/\/+$/, '');

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const request = buildRequest(this, operation, i);

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'rcsZillaApi',
					{
						method: request.method,
						baseURL: baseUrl,
						url: '/',
						qs: request.qs,
						body: request.body,
						json: true,
					},
				);

				if (response?.success === false) {
					throw new NodeOperationError(this.getNode(), response.message || 'RCSZilla API error', {
						itemIndex: i,
						description: JSON.stringify(response),
					});
				}

				returnData.push({
					json: response as IDataObject,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
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

function buildRequest(executeFunctions: IExecuteFunctions, operation: string, itemIndex: number): {
	method: HttpMethod;
	qs: IDataObject;
	body?: IDataObject;
} {
	switch (operation) {
		case 'queueMessage': {
			const scheduledAt = executeFunctions.getNodeParameter('scheduledAt', itemIndex, '') as string;
			const body: IDataObject = {
				to: executeFunctions.getNodeParameter('to', itemIndex) as string,
				message: executeFunctions.getNodeParameter('message', itemIndex) as string,
				channel: executeFunctions.getNodeParameter('channel', itemIndex) as string,
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
					id: executeFunctions.getNodeParameter('queueId', itemIndex) as number,
				},
			};
		case 'getPendingMessages':
			return {
				method: 'GET',
				qs: {
					endpoint: 'pending_messages',
					limit: executeFunctions.getNodeParameter('limit', itemIndex) as number,
					channel: executeFunctions.getNodeParameter('channel', itemIndex) as string,
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
					id: executeFunctions.getNodeParameter('queueId', itemIndex) as number,
					reason: executeFunctions.getNodeParameter('reason', itemIndex, '') as string,
				},
			};
		case 'submitReply':
			return {
				method: 'POST',
				qs: { endpoint: 'submit_reply' },
				body: {
					from_phone: executeFunctions.getNodeParameter('fromPhone', itemIndex) as string,
					message: executeFunctions.getNodeParameter('message', itemIndex) as string,
					channel: executeFunctions.getNodeParameter('channel', itemIndex) as string,
				},
			};
		case 'logOutgoing':
			return {
				method: 'POST',
				qs: { endpoint: 'log_outgoing' },
				body: {
					to_phone: executeFunctions.getNodeParameter('toPhone', itemIndex) as string,
					message: executeFunctions.getNodeParameter('message', itemIndex) as string,
					channel: executeFunctions.getNodeParameter('channel', itemIndex) as string,
				},
			};
		default:
			throw new NodeOperationError(executeFunctions.getNode(), `Unsupported operation: ${operation}`, {
				itemIndex,
			});
	}
}

function queueStateRequest(executeFunctions: IExecuteFunctions, endpoint: string, itemIndex: number) {
	return {
		method: 'POST' as const,
		qs: { endpoint },
		body: {
			id: executeFunctions.getNodeParameter('queueId', itemIndex) as number,
		},
	};
}

function formatDateTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	const pad = (part: number) => String(part).padStart(2, '0');
	return [
		date.getFullYear(),
		pad(date.getMonth() + 1),
		pad(date.getDate()),
	].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
