import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class RCSZillaApi implements ICredentialType {
    name: string;
    displayName: string;
    icon: "file:../nodes/RCSZilla/rcszilla.png";
    documentationUrl: string;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
