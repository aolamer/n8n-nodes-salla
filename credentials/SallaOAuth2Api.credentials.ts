import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	ICredentialDataDecryptedObject,
	INodeCredentialTestResult,
} from 'n8n-workflow';

export class SallaOAuth2Api implements ICredentialType {
	name = 'sallaOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'Salla OAuth2 API';
	documentationUrl = 'https://docs.salla.dev/';
	icon = 'file:salla.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://accounts.salla.sa/oauth2/auth',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://accounts.salla.sa/oauth2/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'offline_access',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Sandbox',
					value: 'sandbox',
				},
			],
			default: 'production',
			description: 'Select the Salla environment to connect to',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Salla application Client ID from Salla Partner Dashboard',
			placeholder: 'e.g., 123456789-abcd-1234-efgh-123456789012',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Salla application Client Secret from Salla Partner Dashboard',
			placeholder: 'Your secret client key...',
		},
		{
			displayName: 'OAuth Scopes',
			name: 'oauthScopes',
			type: 'string',
			default: 'offline_access',
			description: 'OAuth scopes to request. Common scopes: offline_access, read, write, orders, products, customers',
			placeholder: 'offline_access',
		},
		{
			displayName: 'Webhook Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Webhook secret for validating incoming webhooks from Salla (optional)',
			placeholder: 'Your webhook secret...',
		},
		{
			displayName: 'Store Domain',
			name: 'storeDomain',
			type: 'string',
			default: '',
			placeholder: 'your-store.salla.sa',
			description: 'Your Salla store domain (optional - will be auto-detected from token)',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'options',
			options: [
				{
					name: 'v2 (Recommended)',
					value: 'v2',
				},
				{
					name: 'v1',
					value: 'v1',
				},
			],
			default: 'v2',
			description: 'Salla API version to use',
		},
		{
			displayName: 'Rate Limit Handling',
			name: 'rateLimitHandling',
			type: 'options',
			options: [
				{
					name: 'Retry (Recommended)',
					value: 'retry',
				},
				{
					name: 'Fail',
					value: 'fail',
				},
			],
			default: 'retry',
			description: 'How to handle rate limit responses from Salla API',
		},
		{
			displayName: 'Max Retries',
			name: 'maxRetries',
			type: 'number',
			default: 3,
			typeOptions: {
				minValue: 1,
				maxValue: 10,
			},
			description: 'Maximum number of retries for rate limited requests',
			displayOptions: {
				show: {
					rateLimitHandling: ['retry'],
				},
			},
		},
		{
			displayName: 'Auto Refresh Tokens',
			name: 'autoRefreshTokens',
			type: 'boolean',
			default: true,
			description: 'Automatically refresh access tokens when they expire (considering 14-day Salla token expiry)',
		},
		{
			displayName: 'Token Refresh Buffer (Minutes)',
			name: 'tokenRefreshBuffer',
			type: 'number',
			default: 30,
			typeOptions: {
				minValue: 5,
				maxValue: 1440, // 24 hours
			},
			description: 'Refresh tokens this many minutes before they expire',
			displayOptions: {
				show: {
					autoRefreshTokens: [true],
				},
			},
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "sandbox" ? "https://api.s-cart.com" : "https://api.salla.dev"}}/admin/{{$credentials.apiVersion}}',
			url: '/profile',
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'status',
					value: 200,
				},
			},
		],
	};

	async preAuthentication(this: ICredentialType, credentials: ICredentialDataDecryptedObject) {
		// Set the correct URLs based on environment
		const isSandbox = credentials.environment === 'sandbox';
		const scope = credentials.oauthScopes || 'offline_access';
		
		return {
			...credentials,
			authUrl: isSandbox 
				? 'https://accounts.s-cart.com/oauth2/auth'
				: 'https://accounts.salla.sa/oauth2/auth',
			accessTokenUrl: isSandbox
				? 'https://accounts.s-cart.com/oauth2/token'
				: 'https://accounts.salla.sa/oauth2/token',
			scope,
		};
	}

	async authenticate(
		this: ICredentialType,
		credentials: ICredentialDataDecryptedObject,
	): Promise<ICredentialDataDecryptedObject> {
		// This method is called after successful OAuth flow
		// The oauthTokenData will be automatically saved by n8n
		
		// Add timestamp for token expiry tracking
		if (credentials.oauthTokenData) {
			const tokenData = credentials.oauthTokenData as any;
			if (tokenData.expires_in && !tokenData.expires_at) {
				const expiresAt = new Date();
				expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(tokenData.expires_in));
				tokenData.expires_at = expiresAt.toISOString();
			}
			
			// Store additional metadata
			tokenData.obtained_at = new Date().toISOString();
			tokenData.environment = credentials.environment;
		}

		return credentials;
	}

	async testCredential(
		this: ICredentialType,
		credentials: ICredentialDataDecryptedObject,
	): Promise<INodeCredentialTestResult> {
		try {
			// Basic validation
			if (!credentials.clientId || !credentials.clientSecret) {
				return {
					status: 'Error',
					message: 'Client ID and Client Secret are required',
				};
			}

			// Check if OAuth token exists
			if (!credentials.oauthTokenData) {
				return {
					status: 'Error',
					message: 'OAuth authentication required. Please complete the OAuth flow.',
				};
			}

			const tokenData = credentials.oauthTokenData as any;
			if (!tokenData.access_token) {
				return {
					status: 'Error',
					message: 'No access token found. Please re-authenticate.',
				};
			}

			// Check token expiry
			if (tokenData.expires_at) {
				const expiresAt = new Date(tokenData.expires_at);
				const now = new Date();
				if (expiresAt <= now) {
					return {
						status: 'Error',
						message: 'Access token has expired. Please re-authenticate.',
					};
				}
			}

			return {
				status: 'OK',
				message: 'Authentication successful',
			};
		} catch (error: any) {
			return {
				status: 'Error',
				message: `Authentication test failed: ${error.message || 'Unknown error'}`,
			};
		}
	}
} 