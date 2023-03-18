export type UserCryptoProperties = {
    salt: string;
    masterKeyBundle: SecretKeyBundle;
    recoveryMasterKeyBundle: SecretKeyBundle;
    recoveryKeyBundle: SecretKeyBundle;
    asymmetricKeyBundle: KeyPairBundle;
    signingKeyBundle: KeyPairBundle;
};

export type MetadataBundle = {
    nonce: string;
    encryptedMetadata: string;
};

export type SecretKeyBundle = {
    nonce: string;
    encryptedKey: string;
};

export type KeyPairBundle = {
    nonce: string;
    publicKey: string;
    encryptedPrivateKey: string;
};
