import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestMethods,
	IRequestOptions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import * as moment from 'moment';

export async function sallaApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
	headers?: IDataObject,
): Promise<any> {
	const credentials = await this.getCredentials('sallaOAuth2Api');
	
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials found!');
	}

	const environment = credentials.environment as string;
	const apiVersion = credentials.apiVersion as string;
	const rateLimitHandling = credentials.rateLimitHandling as string;
	const maxRetries = credentials.maxRetries as number || 3;
	const autoRefreshTokens = credentials.autoRefreshTokens as boolean ?? true;
	const tokenRefreshBuffer = credentials.tokenRefreshBuffer as number || 30;

	// Base URL based on environment
	const baseURL = environment === 'sandbox' 
		? `https://api.s-cart.com/admin/${apiVersion}`
		: `https://api.salla.dev/admin/${apiVersion}`;

	const options: IRequestOptions = {
		method,
		url: `${baseURL}${endpoint}`,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			...headers,
		},
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (qs && Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	let attempts = 0;
	const maxAttempts = rateLimitHandling === 'retry' ? maxRetries + 1 : 1;

	while (attempts < maxAttempts) {
		try {
			// Check if token needs refresh (if auto refresh is enabled)
			if (autoRefreshTokens) {
				await checkAndRefreshToken.call(this, tokenRefreshBuffer);
			}
			
			const response = await this.helpers.requestOAuth2.call(this, 'sallaOAuth2Api', options);
			return response;
		} catch (error: any) {
			attempts++;
			
			// Handle rate limiting
			if (error.httpCode === '429' && rateLimitHandling === 'retry' && attempts < maxAttempts) {
				const retryAfter = error.response?.headers?.['retry-after'] || error.response?.headers?.['x-ratelimit-reset'];
				let waitTime = 60; // Default wait time in seconds
				
				if (retryAfter) {
					// If retry-after is a timestamp
					if (retryAfter.length > 10) {
						waitTime = Math.max(moment.unix(parseInt(retryAfter)).diff(moment(), 'seconds'), 1);
					} else {
						waitTime = parseInt(retryAfter);
					}
				}

				// Use setTimeout in a way that works in both browser and Node.js environments
				await new Promise(resolve => {
					if (typeof setTimeout !== 'undefined') {
						setTimeout(resolve, waitTime * 1000);
					} else {
						// Fallback for environments where setTimeout might not be available
						const start = Date.now();
						while (Date.now() - start < waitTime * 1000) {
							// Busy wait (not ideal, but works as fallback)
						}
						resolve(undefined);
					}
				});
				continue;
			}

			// Handle OAuth errors by attempting token refresh
			if (error.httpCode === '401' && attempts === 1 && autoRefreshTokens) {
				try {
					await refreshAccessToken.call(this);
					continue; // Retry with new token
				} catch (refreshError: any) {
					throw new NodeApiError(this.getNode(), refreshError);
				}
			}

			throw new NodeApiError(this.getNode(), error);
		}
	}

	throw new NodeOperationError(this.getNode(), 'Max retry attempts reached');
}

export async function sallaApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<any[]> {
	const returnData: IDataObject[] = [];
	let page = 1;
	const perPage = 100;

	do {
		const qs = {
			...query,
			page,
			per_page: perPage,
		};

		const responseData = await sallaApiRequest.call(this, method, endpoint, body, qs);
		
		if (responseData.data && Array.isArray(responseData.data)) {
			returnData.push(...responseData.data);
		} else if (Array.isArray(responseData)) {
			returnData.push(...responseData);
		} else {
			break;
		}

		// Check if there are more pages
		if (responseData.pagination) {
			if (responseData.pagination.current_page >= responseData.pagination.last_page) {
				break;
			}
		} else if (responseData.data && responseData.data.length < perPage) {
			break;
		}

		page++;
	} while (true);

	return returnData;
}

async function checkAndRefreshToken(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	refreshBuffer: number = 30
): Promise<void> {
	const credentials = await this.getCredentials('sallaOAuth2Api');
	
	if (!credentials.oauthTokenData) {
		return; // No token data available
	}

	const tokenData = credentials.oauthTokenData as IDataObject;
	const expiresAt = tokenData.expires_at as string;
	
	if (!expiresAt) {
		return; // No expiration data
	}

	const expirationTime = moment(expiresAt);
	const now = moment();
	const minutesUntilExpiry = expirationTime.diff(now, 'minutes');

	// Refresh token if it expires within the specified buffer time
	if (minutesUntilExpiry < refreshBuffer) {
		await refreshAccessToken.call(this);
	}
}

async function refreshAccessToken(this: IExecuteFunctions | ILoadOptionsFunctions): Promise<void> {
	const credentials = await this.getCredentials('sallaOAuth2Api');
	
	if (!credentials.oauthTokenData) {
		throw new NodeOperationError(this.getNode(), 'No OAuth token data found');
	}

	const tokenData = credentials.oauthTokenData as IDataObject;
	const refreshToken = tokenData.refresh_token as string;
	
	if (!refreshToken) {
		throw new NodeOperationError(this.getNode(), 'No refresh token found');
	}

	const environment = credentials.environment as string;
	const clientId = credentials.clientId as string;
	const clientSecret = credentials.clientSecret as string;

	const tokenUrl = environment === 'sandbox' 
		? 'https://accounts.s-cart.com/oauth2/token'
		: 'https://accounts.salla.sa/oauth2/token';

	const options: IRequestOptions = {
		method: 'POST',
		url: tokenUrl,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json',
		},
		form: {
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
			client_id: clientId,
			client_secret: clientSecret,
		},
		json: true,
	};

	try {
		const response = await this.helpers.request(options);
		
		// Update the credentials with new token data
		const newTokenData = {
			...tokenData,
			access_token: response.access_token,
			refresh_token: response.refresh_token || refreshToken,
			expires_in: response.expires_in,
			expires_at: moment().add(response.expires_in, 'seconds').toISOString(),
			obtained_at: new Date().toISOString(),
			environment: environment,
		};

		// Save the updated credentials - this should trigger n8n to update the stored credentials
		const updatedCredentials = {
			...credentials,
			oauthTokenData: newTokenData,
		};

		// Note: n8n should handle saving the updated credentials automatically
		// The requestOAuth2 helper should use the updated token for subsequent requests
		
	} catch (error: any) {
		throw new NodeOperationError(this.getNode(), `Failed to refresh access token: ${error.message || 'Unknown error'}`);
	}
}

export function validateWebhook(body: string, signature: string, secret: string): boolean {
	// Use require in a way that works in both Node.js and browser environments
	let crypto: any;
	try {
		// Try to require crypto module (Node.js environment)
		crypto = require('crypto');
	} catch (error) {
		// Fallback for browser environment or when crypto is not available
		throw new Error('Crypto module not available for webhook validation');
	}
	
	const expectedSignature = crypto
		.createHmac('sha256', secret)
		.update(body)
		.digest('hex');
	
	return `sha256=${expectedSignature}` === signature;
}

export function formatSallaDate(date: string | Date): string {
	return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

export function parseSallaFilters(filters: IDataObject): IDataObject {
	const queryParams: IDataObject = {};

	if (filters.status) {
		if (Array.isArray(filters.status)) {
			queryParams.status = filters.status.join(',');
		} else {
			queryParams.status = filters.status;
		}
	}

	if (filters.dateFrom) {
		queryParams.created_from = formatSallaDate(filters.dateFrom as string);
	}

	if (filters.dateTo) {
		queryParams.created_to = formatSallaDate(filters.dateTo as string);
	}

	if (filters.search) {
		queryParams.search = filters.search;
	}

	return queryParams;
} 