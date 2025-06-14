import {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeApiError,
	NodeConnectionType,
} from 'n8n-workflow';

import { sallaApiRequest, sallaApiRequestAllItems } from './GenericFunctions';

// Import will be added back once SallaFields.ts is created

export class Salla implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Salla',
		name: 'salla',
		icon: 'file:salla.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Salla.sa e-commerce platform API',
		defaults: {
			name: 'Salla',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'sallaOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Order',
						value: 'order',
					},
					{
						name: 'Product',
						value: 'product',
					},
					{
						name: 'Customer',
						value: 'customer',
					},
					{
						name: 'Address',
						value: 'address',
					},
					{
						name: 'Special Offer',
						value: 'specialOffer',
					},
					{
						name: 'Coupon',
						value: 'coupon',
					},
					{
						name: 'Shipment',
						value: 'shipment',
					},
					{
						name: 'Digital Product',
						value: 'digitalProduct',
					},
				],
				default: 'order',
				description: 'Resource to consume',
			},

			// Order Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['order'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get an order',
						action: 'Get an order',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all orders',
						action: 'Get all orders',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an order',
						action: 'Update an order',
					},
					{
						name: 'Cancel',
						value: 'cancel',
						description: 'Cancel an order',
						action: 'Cancel an order',
					},
				],
				default: 'get',
			},

			// Product Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['product'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a product',
						action: 'Create a product',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a product',
						action: 'Get a product',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all products',
						action: 'Get all products',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a product',
						action: 'Update a product',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a product',
						action: 'Delete a product',
					},
				],
				default: 'get',
			},

			// Customer Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['customer'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a customer',
						action: 'Get a customer',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all customers',
						action: 'Get all customers',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a customer',
						action: 'Update a customer',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a customer',
						action: 'Delete a customer',
					},
				],
				default: 'get',
			},

			// Address Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['address'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get an address',
						action: 'Get an address',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all addresses',
						action: 'Get all addresses',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create an address',
						action: 'Create an address',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an address',
						action: 'Update an address',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an address',
						action: 'Delete an address',
					},
				],
				default: 'get',
			},

			// Special Offer Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['specialOffer'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a special offer',
						action: 'Get a special offer',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all special offers',
						action: 'Get all special offers',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a special offer',
						action: 'Create a special offer',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a special offer',
						action: 'Update a special offer',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a special offer',
						action: 'Delete a special offer',
					},
				],
				default: 'get',
			},

			// Coupon Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['coupon'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a coupon',
						action: 'Get a coupon',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all coupons',
						action: 'Get all coupons',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a coupon',
						action: 'Create a coupon',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a coupon',
						action: 'Update a coupon',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a coupon',
						action: 'Delete a coupon',
					},
				],
				default: 'get',
			},

			// Shipment Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['shipment'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a shipment',
						action: 'Get a shipment',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all shipments',
						action: 'Get all shipments',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a shipment',
						action: 'Create a shipment',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a shipment',
						action: 'Update a shipment',
					},
					{
						name: 'Track',
						value: 'track',
						description: 'Track a shipment',
						action: 'Track a shipment',
					},
				],
				default: 'get',
			},

			// Digital Product Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['digitalProduct'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a digital product',
						action: 'Get a digital product',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all digital products',
						action: 'Get all digital products',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a digital product',
						action: 'Create a digital product',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a digital product',
						action: 'Update a digital product',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a digital product',
						action: 'Delete a digital product',
					},
				],
				default: 'get',
			},

			// Common Fields
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete', 'cancel', 'track'],
					},
				},
				default: '',
				description: 'The ID of the resource',
			},

			// Pagination
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['getAll'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getAll'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 50,
				description: 'Max number of results to return',
			},

			// Additional Options
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the resource',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the resource',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{
								name: 'Active',
								value: 'active',
							},
							{
								name: 'Inactive',
								value: 'inactive',
							},
							{
								name: 'Draft',
								value: 'draft',
							},
						],
						default: 'active',
						description: 'Status of the resource',
					},
				],
			},

			// Filters
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'multiOptions',
						options: [
							{
								name: 'Active',
								value: 'active',
							},
							{
								name: 'Inactive',
								value: 'inactive',
							},
							{
								name: 'Draft',
								value: 'draft',
							},
							{
								name: 'Pending',
								value: 'pending',
							},
							{
								name: 'Completed',
								value: 'completed',
							},
							{
								name: 'Cancelled',
								value: 'cancelled',
							},
						],
						default: [],
					},
					{
						displayName: 'Date From',
						name: 'dateFrom',
						type: 'dateTime',
						default: '',
						description: 'Filter by date from',
					},
					{
						displayName: 'Date To',
						name: 'dateTo',
						type: 'dateTime',
						default: '',
						description: 'Filter by date to',
					},
					{
						displayName: 'Search',
						name: 'search',
						type: 'string',
						default: '',
						description: 'Search term to filter results',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				if (resource === 'order') {
					responseData = await handleOrderOperations.call(this, i, operation);
				} else if (resource === 'product') {
					responseData = await handleProductOperations.call(this, i, operation);
				} else if (resource === 'customer') {
					responseData = await handleCustomerOperations.call(this, i, operation);
				} else if (resource === 'address') {
					responseData = await handleAddressOperations.call(this, i, operation);
				} else if (resource === 'specialOffer') {
					responseData = await handleSpecialOfferOperations.call(this, i, operation);
				} else if (resource === 'coupon') {
					responseData = await handleCouponOperations.call(this, i, operation);
				} else if (resource === 'shipment') {
					responseData = await handleShipmentOperations.call(this, i, operation);
				} else if (resource === 'digitalProduct') {
					responseData = await handleDigitalProductOperations.call(this, i, operation);
				}

				if (Array.isArray(responseData)) {
					returnData.push(...responseData);
				} else if (responseData) {
					returnData.push(responseData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: (error as Error).message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}

// Handler functions moved outside the class
async function handleOrderOperations(this: IExecuteFunctions, itemIndex: number, operation: string): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		const orderId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'GET', `/orders/${orderId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		
		if (returnAll) {
			return await sallaApiRequestAllItems.call(this, 'GET', '/orders', {}, filters);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			const response = await sallaApiRequest.call(this, 'GET', '/orders', {}, { ...filters, per_page: limit });
			return response.data || [];
		}
	}

	if (operation === 'update') {
		const orderId = this.getNodeParameter('id', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'PUT', `/orders/${orderId}`, additionalFields);
	}

	if (operation === 'cancel') {
		const orderId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'PUT', `/orders/${orderId}/cancel`);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for orders!`);
}

async function handleProductOperations(this: IExecuteFunctions, itemIndex: number, operation: string): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		const productId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'GET', `/products/${productId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		
		if (returnAll) {
			return await sallaApiRequestAllItems.call(this, 'GET', '/products', {}, filters);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			const response = await sallaApiRequest.call(this, 'GET', '/products', {}, { ...filters, per_page: limit });
			return response.data || [];
		}
	}

	if (operation === 'create') {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'POST', '/products', additionalFields);
	}

	if (operation === 'update') {
		const productId = this.getNodeParameter('id', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'PUT', `/products/${productId}`, additionalFields);
	}

	if (operation === 'delete') {
		const productId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'DELETE', `/products/${productId}`);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for products!`);
}

async function handleCustomerOperations(this: IExecuteFunctions, itemIndex: number, operation: string): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		const customerId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'GET', `/customers/${customerId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		
		if (returnAll) {
			return await sallaApiRequestAllItems.call(this, 'GET', '/customers', {}, filters);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			const response = await sallaApiRequest.call(this, 'GET', '/customers', {}, { ...filters, per_page: limit });
			return response.data || [];
		}
	}

	if (operation === 'update') {
		const customerId = this.getNodeParameter('id', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'PUT', `/customers/${customerId}`, additionalFields);
	}

	if (operation === 'delete') {
		const customerId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'DELETE', `/customers/${customerId}`);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for customers!`);
}

async function handleAddressOperations(this: IExecuteFunctions, itemIndex: number, operation: string): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		const addressId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'GET', `/addresses/${addressId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		
		if (returnAll) {
			return await sallaApiRequestAllItems.call(this, 'GET', '/addresses', {}, filters);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			const response = await sallaApiRequest.call(this, 'GET', '/addresses', {}, { ...filters, per_page: limit });
			return response.data || [];
		}
	}

	if (operation === 'create') {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'POST', '/addresses', additionalFields);
	}

	if (operation === 'update') {
		const addressId = this.getNodeParameter('id', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'PUT', `/addresses/${addressId}`, additionalFields);
	}

	if (operation === 'delete') {
		const addressId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'DELETE', `/addresses/${addressId}`);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for addresses!`);
}

async function handleSpecialOfferOperations(this: IExecuteFunctions, itemIndex: number, operation: string): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		const offerId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'GET', `/special-offers/${offerId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		
		if (returnAll) {
			return await sallaApiRequestAllItems.call(this, 'GET', '/special-offers', {}, filters);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			const response = await sallaApiRequest.call(this, 'GET', '/special-offers', {}, { ...filters, per_page: limit });
			return response.data || [];
		}
	}

	if (operation === 'create') {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'POST', '/special-offers', additionalFields);
	}

	if (operation === 'update') {
		const offerId = this.getNodeParameter('id', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'PUT', `/special-offers/${offerId}`, additionalFields);
	}

	if (operation === 'delete') {
		const offerId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'DELETE', `/special-offers/${offerId}`);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for special offers!`);
}

async function handleCouponOperations(this: IExecuteFunctions, itemIndex: number, operation: string): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		const couponId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'GET', `/coupons/${couponId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		
		if (returnAll) {
			return await sallaApiRequestAllItems.call(this, 'GET', '/coupons', {}, filters);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			const response = await sallaApiRequest.call(this, 'GET', '/coupons', {}, { ...filters, per_page: limit });
			return response.data || [];
		}
	}

	if (operation === 'create') {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'POST', '/coupons', additionalFields);
	}

	if (operation === 'update') {
		const couponId = this.getNodeParameter('id', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'PUT', `/coupons/${couponId}`, additionalFields);
	}

	if (operation === 'delete') {
		const couponId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'DELETE', `/coupons/${couponId}`);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for coupons!`);
}

async function handleShipmentOperations(this: IExecuteFunctions, itemIndex: number, operation: string): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		const shipmentId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'GET', `/shipments/${shipmentId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		
		if (returnAll) {
			return await sallaApiRequestAllItems.call(this, 'GET', '/shipments', {}, filters);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			const response = await sallaApiRequest.call(this, 'GET', '/shipments', {}, { ...filters, per_page: limit });
			return response.data || [];
		}
	}

	if (operation === 'create') {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'POST', '/shipments', additionalFields);
	}

	if (operation === 'update') {
		const shipmentId = this.getNodeParameter('id', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'PUT', `/shipments/${shipmentId}`, additionalFields);
	}

	if (operation === 'track') {
		const shipmentId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'GET', `/shipments/${shipmentId}/track`);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for shipments!`);
}

async function handleDigitalProductOperations(this: IExecuteFunctions, itemIndex: number, operation: string): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		const digitalProductId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'GET', `/digital-products/${digitalProductId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		
		if (returnAll) {
			return await sallaApiRequestAllItems.call(this, 'GET', '/digital-products', {}, filters);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			const response = await sallaApiRequest.call(this, 'GET', '/digital-products', {}, { ...filters, per_page: limit });
			return response.data || [];
		}
	}

	if (operation === 'create') {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'POST', '/digital-products', additionalFields);
	}

	if (operation === 'update') {
		const digitalProductId = this.getNodeParameter('id', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		return await sallaApiRequest.call(this, 'PUT', `/digital-products/${digitalProductId}`, additionalFields);
	}

	if (operation === 'delete') {
		const digitalProductId = this.getNodeParameter('id', itemIndex) as string;
		return await sallaApiRequest.call(this, 'DELETE', `/digital-products/${digitalProductId}`);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for digital products!`);
} 