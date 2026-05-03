"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RCSZillaApi = void 0;
class RCSZillaApi {
    constructor() {
        this.name = 'rcsZillaApi';
        this.displayName = 'RCSZilla API';
        this.icon = 'file:../nodes/RCSZilla/rcszilla.png';
        this.documentationUrl = 'https://docs.rcszilla.com/';
        this.properties = [
            {
                displayName: 'You need a RCSZilla account to use this credential. Register at <a href="https://rcszilla.com/" target="_blank">rcszilla.com</a>, then create an API key or device token in RCSZilla.',
                name: 'accountNotice',
                type: 'notice',
                default: '',
            },
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'https://api.rcszilla.com',
                required: true,
                description: 'RCSZilla API base URL, without the /?endpoint=... part',
            },
            {
                displayName: 'API Token',
                name: 'apiToken',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'A user API key or device token generated in your RCSZilla account. Register at https://rcszilla.com/ if you do not have an account yet.',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.apiToken}}',
                    'X-API-Token': '={{$credentials.apiToken}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl.replace(/\\/+$/, "")}}',
                url: '/',
                method: 'GET',
                qs: {
                    endpoint: 'pending_messages',
                    limit: 1,
                },
            },
        };
    }
}
exports.RCSZillaApi = RCSZillaApi;
