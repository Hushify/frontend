import { entropyToMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { expose } from 'comlink';
import sodium from 'libsodium-wrappers-sumo';

export const CryptoService = {
    generateRequiredKeys: async (password: string) => {
        await sodium.ready;

        const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
        const passwordHash = sodium.crypto_pwhash(
            sodium.crypto_box_SEEDBYTES,
            password,
            salt,
            sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_ALG_DEFAULT
        );

        // Master Key
        const masterKey = sodium.crypto_kdf_keygen();
        const nonce = sodium.randombytes_buf(
            sodium.crypto_secretbox_NONCEBYTES
        );

        const encMasterKey = sodium.crypto_secretbox_easy(
            masterKey,
            nonce,
            passwordHash
        );

        // Asymmetric Keys
        const asymmetricEncKp = sodium.crypto_box_keypair();
        const asymmetricEncKeyNonce = sodium.randombytes_buf(
            sodium.crypto_secretbox_NONCEBYTES
        );
        const encAsymmetricPrivateKey = sodium.crypto_secretbox_easy(
            asymmetricEncKp.privateKey,
            asymmetricEncKeyNonce,
            masterKey
        );

        const signingKp = sodium.crypto_sign_keypair();
        const signingKeyNonce = sodium.randombytes_buf(
            sodium.crypto_secretbox_NONCEBYTES
        );
        const encSigningPrivateKey = sodium.crypto_secretbox_easy(
            signingKp.privateKey,
            signingKeyNonce,
            masterKey
        );

        // Recovery Keys
        const recoveryKey = sodium.crypto_kdf_keygen();
        const recoveryMasterKeyNonce = sodium.randombytes_buf(
            sodium.crypto_secretbox_NONCEBYTES
        );

        const recoveryEncMasterKey = sodium.crypto_secretbox_easy(
            masterKey,
            recoveryMasterKeyNonce,
            recoveryKey,
            'base64'
        );

        const recoveryKeyNonce = sodium.randombytes_buf(
            sodium.crypto_secretbox_NONCEBYTES
        );

        const encRecoveryKey = sodium.crypto_secretbox_easy(
            recoveryKey,
            recoveryKeyNonce,
            passwordHash,
            'base64'
        );

        const recoveryMnemonic = entropyToMnemonic(recoveryKey, wordlist);

        return {
            salt: sodium.to_base64(salt),
            masterKeyBundle: {
                nonce: sodium.to_base64(nonce),
                encKey: sodium.to_base64(encMasterKey),
            },
            recoveryMasterKeyBundle: {
                nonce: sodium.to_base64(recoveryMasterKeyNonce),
                encKey: recoveryEncMasterKey,
            },
            recoveryKeyBundle: {
                nonce: sodium.to_base64(recoveryKeyNonce),
                encKey: encRecoveryKey,
            },
            asymmetricEncKeyBundle: {
                nonce: sodium.to_base64(asymmetricEncKeyNonce),
                publicKey: sodium.to_base64(asymmetricEncKp.publicKey),
                encPrivateKey: sodium.to_base64(encAsymmetricPrivateKey),
            },
            signingKeyBundle: {
                nonce: sodium.to_base64(signingKeyNonce),
                publicKey: sodium.to_base64(signingKp.publicKey),
                encPrivateKey: sodium.to_base64(encSigningPrivateKey),
            },
            recoveryMnemonic,
            masterKey: sodium.to_base64(masterKey),
            asymmetricEncPrivateKey: sodium.to_base64(
                asymmetricEncKp.privateKey
            ),
            signingPrivateKey: sodium.to_base64(signingKp.privateKey),
        };
    },

    decryptRequiredKeys: async (
        password: string,
        salt: string,
        masterKeyNonce: string,
        encMasterKey: string,
        asymmetricEncKeyNonce: string,
        encAsymmetricPrivateKey: string,
        signingKeyNonce: string,
        encSigningPrivateKey: string
    ) => {
        await sodium.ready;

        const passwordHash = sodium.crypto_pwhash(
            sodium.crypto_box_SEEDBYTES,
            password,
            sodium.from_base64(salt),
            sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_ALG_DEFAULT
        );

        const masterKey = sodium.crypto_secretbox_open_easy(
            sodium.from_base64(encMasterKey),
            sodium.from_base64(masterKeyNonce),
            passwordHash
        );

        const asymmetricPrivateKey = sodium.crypto_secretbox_open_easy(
            sodium.from_base64(encAsymmetricPrivateKey),
            sodium.from_base64(asymmetricEncKeyNonce),
            masterKey
        );

        const signingPrivateKey = sodium.crypto_secretbox_open_easy(
            sodium.from_base64(encSigningPrivateKey),
            sodium.from_base64(signingKeyNonce),
            masterKey
        );

        return {
            masterKey: sodium.to_base64(masterKey),
            asymmetricPrivateKey: sodium.to_base64(asymmetricPrivateKey),
            signingPrivateKey: sodium.to_base64(signingPrivateKey),
        };
    },

    decryptAccessToken: async (
        encAccessToken: string,
        encAccessTokenNonce: string,
        serverPublicKey: string,
        asymmetricPrivateKey: string
    ) => {
        await sodium.ready;

        const token = sodium.crypto_box_open_easy(
            sodium.from_base64(encAccessToken),
            sodium.from_base64(encAccessTokenNonce),
            sodium.from_base64(serverPublicKey),
            sodium.from_base64(asymmetricPrivateKey)
        );

        return sodium.to_string(token);
    },

    generateFolderKey: async (key: string) => {
        await sodium.ready;

        const folderKey = sodium.crypto_secretbox_keygen();

        const nonce = sodium.randombytes_buf(
            sodium.crypto_secretbox_NONCEBYTES
        );

        const encFolderKey = sodium.crypto_secretbox_easy(
            folderKey,
            nonce,
            sodium.from_base64(key),
            'base64'
        );

        return {
            folderKey,
            folderKeyB64: sodium.to_base64(folderKey),
            encFolderKey,
            nonce: sodium.to_base64(nonce),
        };
    },

    decryptFolderKey: async (
        key: string,
        encryptedFolderKey: string,
        folderKeyNonce: string
    ) => {
        await sodium.ready;

        const folderKey = sodium.crypto_secretbox_open_easy(
            sodium.from_base64(encryptedFolderKey),
            sodium.from_base64(folderKeyNonce),
            sodium.from_base64(key),
            'base64'
        );

        return folderKey;
    },

    generateFileKey: async (folderKey: string) => {
        await sodium.ready;

        const fileKey = sodium.crypto_secretstream_xchacha20poly1305_keygen();

        const nonce = sodium.randombytes_buf(
            sodium.crypto_secretbox_NONCEBYTES
        );

        const encFileKey = sodium.crypto_secretbox_easy(
            fileKey,
            nonce,
            sodium.from_base64(folderKey),
            'base64'
        );

        return {
            fileKey,
            fileKeyB64: sodium.to_base64(fileKey),
            encFileKey,
            nonce: sodium.to_base64(nonce),
        };
    },

    decryptFileKey: async (
        folderKey: string,
        encryptedFileKey: string,
        fileKeyNonce: string
    ) => {
        await sodium.ready;

        const fileKey = sodium.crypto_secretbox_open_easy(
            sodium.from_base64(encryptedFileKey),
            sodium.from_base64(fileKeyNonce),
            sodium.from_base64(folderKey),
            'base64'
        );

        return fileKey;
    },

    encryptMetadata: async (key: Uint8Array | string, metadata: unknown) => {
        await sodium.ready;

        const nonce = sodium.randombytes_buf(
            sodium.crypto_secretbox_NONCEBYTES
        );

        const encMetadata = sodium.crypto_secretbox_easy(
            JSON.stringify(metadata),
            nonce,
            typeof key === 'string' ? sodium.from_base64(key) : key,
            'base64'
        );

        return { encMetadata, nonce: sodium.to_base64(nonce) };
    },

    decryptMetadata: async (
        key: string,
        encryptedMetadata: string,
        metadataNonce: string
    ) => {
        await sodium.ready;

        const decryptedMetadata = sodium.crypto_secretbox_open_easy(
            sodium.from_base64(encryptedMetadata),
            sodium.from_base64(metadataNonce),
            sodium.from_base64(key)
        );

        return sodium.to_string(decryptedMetadata);
    },

    getNonce: async () => {
        const nonce = sodium.randombytes_buf(
            sodium.crypto_secretbox_NONCEBYTES
        );
        return { nonce, nonceB64: sodium.to_base64(nonce) };
    },

    encryptFile: async (
        key: Uint8Array,
        file: Uint8Array,
        nonce: Uint8Array
    ) => {
        await sodium.ready;
        return sodium.crypto_secretbox_easy(file, nonce, key);
    },

    decryptFile: async (key: string, data: Uint8Array, nonce: string) => {
        await sodium.ready;
        return sodium.crypto_secretbox_open_easy(
            data,
            sodium.from_base64(nonce),
            sodium.from_base64(key)
        );
    },

    streamingEncryptionInit: async (key: string) => {
        await sodium.ready;
        return sodium.crypto_secretstream_xchacha20poly1305_init_push(
            sodium.from_base64(key)
        );
    },

    streamingEncryptionPush: async (
        state: sodium.StateAddress,
        data: Uint8Array,
        isFinal: boolean
    ) => {
        await sodium.ready;
        return sodium.crypto_secretstream_xchacha20poly1305_push(
            state,
            data,
            null,
            isFinal ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL : 0
        );
    },

    streamingDecryptionInit: async (
        header: Uint8Array,
        key: string
    ): Promise<sodium.StateAddress> => {
        await sodium.ready;
        return sodium.crypto_secretstream_xchacha20poly1305_init_pull(
            header,
            sodium.from_base64(key)
        );
    },

    streamingDecryptionPull: async (
        state: sodium.StateAddress,
        cipher: Uint8Array
    ) => {
        await sodium.ready;
        return sodium.crypto_secretstream_xchacha20poly1305_pull(state, cipher);
    },

    pad: async (data: Uint8Array, blockSize: number) => {
        await sodium.ready;
        return sodium.pad(data, blockSize);
    },

    unpad: async (data: Uint8Array, blockSize: number) => {
        await sodium.ready;
        return sodium.unpad(data, blockSize);
    },
};

expose(CryptoService);
