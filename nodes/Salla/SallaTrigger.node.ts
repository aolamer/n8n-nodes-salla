import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
} from 'n8n-workflow';

import { validateWebhook } from './GenericFunctions';

export class SallaTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Salla Trigger',
		name: 'sallaTrigger',
		icon: 'file:salla.svg',
		group: ['trigger'],
		version: 1,
		description: 'Handle Salla webhooks',
		defaults: {
			name: 'Salla Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'sallaOAuth2Api',
				required: false,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'Order Created',
						value: 'order.created',
						description: 'Triggered when a new order is created',
					},
					{
						name: 'Order Updated',
						value: 'order.updated',
						description: 'Triggered when an order is updated',
					},
					{
						name: 'Order Cancelled',
						value: 'order.cancelled',
						description: 'Triggered when an order is cancelled',
					},
					{
						name: 'Order Shipped',
						value: 'order.shipped',
						description: 'Triggered when an order is shipped',
					},
					{
						name: 'Order Delivered',
						value: 'order.delivered',
						description: 'Triggered when an order is delivered',
					},
					{
						name: 'Product Created',
						value: 'product.created',
						description: 'Triggered when a new product is created',
					},
					{
						name: 'Product Updated',
						value: 'product.updated',
						description: 'Triggered when a product is updated',
					},
					{
						name: 'Product Deleted',
						value: 'product.deleted',
						description: 'Triggered when a product is deleted',
					},
					{
						name: 'Customer Created',
						value: 'customer.created',
						description: 'Triggered when a new customer is created',
					},
					{
						name: 'Customer Updated',
						value: 'customer.updated',
						description: 'Triggered when a customer is updated',
					},
					{
						name: 'Customer Deleted',
						value: 'customer.deleted',
						description: 'Triggered when a customer is deleted',
					},
					{
						name: 'Payment Created',
						value: 'payment.created',
						description: 'Triggered when a payment is created',
					},
					{
						name: 'Payment Updated',
						value: 'payment.updated',
						description: 'Triggered when a payment is updated',
					},
					{
						name: 'Coupon Used',
						value: 'coupon.used',
						description: 'Triggered when a coupon is used',
					},
					{
						name: 'Special Offer Applied',
						value: 'special_offer.applied',
						description: 'Triggered when a special offer is applied',
					},
					{
						name: 'Shipment Created',
						value: 'shipment.created',
						description: 'Triggered when a shipment is created',
					},
					{
						name: 'Shipment Updated',
						value: 'shipment.updated',
						description: 'Triggered when a shipment is updated',
					},
					{
						name: 'Review Created',
						value: 'review.created',
						description: 'Triggered when a new review is created',
					},
					{
						name: 'All Events',
						value: '*',
						description: 'Triggered for all webhook events',
					},
				],
				default: [],
				description: 'The events to listen to',
				required: true,
			},
			{
				displayName: 'Validate Webhook',
				name: 'validateWebhook',
				type: 'boolean',
				default: true,
				description: 'Whether to validate the webhook signature',
			},
			{
				displayName: 'Webhook Secret',
				name: 'webhookSecret',
				type: 'string',
				typeOptions: {
					password: true,
				},
				displayOptions: {
					show: {
						validateWebhook: [true],
					},
				},
				default: '',
				description: 'The webhook secret for signature validation. If empty, will use the secret from credentials.',
			},
			{
				displayName: 'Return Raw Data',
				name: 'returnRawData',
				type: 'boolean',
				default: false,
				description: 'Whether to return the raw webhook data instead of the parsed event data',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData() as IDataObject;
		const headers = this.getHeaderData() as IDataObject;
		const events = this.getNodeParameter('events') as string[];
		const validateWebhookSignature = this.getNodeParameter('validateWebhook') as boolean;
		const webhookSecret = this.getNodeParameter('webhookSecret') as string;
		const returnRawData = this.getNodeParameter('returnRawData') as boolean;

		let eventType = headers['x-salla-event-type'] as string;
		if (!eventType) {
			eventType = bodyData.event as string || 'unknown';
		}

		// Check if this event should be processed
		const shouldProcess = events.includes('*') || events.includes(eventType);
		if (!shouldProcess) {
			return {
				webhookResponse: {
					status: 200,
					body: { message: 'Event ignored' },
				},
			};
		}

		// Validate webhook signature if enabled
		if (validateWebhookSignature) {
			const signature = headers['x-salla-signature'] as string;
			let secret = webhookSecret;

			// If no secret provided in node, try to get from credentials
			if (!secret) {
				try {
					const credentials = await this.getCredentials('sallaOAuth2Api');
					secret = credentials.webhookSecret as string;
				} catch (error) {
					// Credentials not required for webhook, continue without validation
				}
			}

			if (secret && signature) {
				const rawBody = this.getBodyData('raw') as string;
				const isValid = validateWebhook(rawBody, signature, secret);
				
				if (!isValid) {
					throw new NodeOperationError(this.getNode(), 'Invalid webhook signature');
				}
			}
		}

		// Parse and format the webhook data
		let responseData: IDataObject;

		if (returnRawData) {
			responseData = {
				headers,
				body: bodyData,
				event: eventType,
				timestamp: new Date().toISOString(),
			};
		} else {
			responseData = {
				event: eventType,
				timestamp: headers['x-salla-timestamp'] || new Date().toISOString(),
				merchantId: headers['x-salla-merchant'] || bodyData.merchant_id,
				data: bodyData.data || bodyData,
				...bodyData,
			};

			// Remove redundant fields
			delete responseData.merchant_id;
		}

		return {
			workflowData: [
				[
					{
						json: responseData,
					},
				],
			],
			webhookResponse: {
				status: 200,
				body: { message: 'Webhook received successfully' },
			},
		};
	}
} 