import { MetadataBundle, SecretKeyBundle } from '@/lib/types/crypto';

export type SelectedNode =
    | {
          node: FolderNodeDecrypted;
          type: 'folder';
      }
    | {
          node: FileNodeDecrypted;
          type: 'file';
      };

export type Node = {
    id: string;
    metadataBundle: MetadataBundle;
    keyBundle: SecretKeyBundle;
    isShared: boolean;
};

export type Breadcrumb = Node;

export type FileNode = Node & {
    url: string;
};

export type FolderNode = Node;

export type DriveListResponse = {
    workspaceFolderId: string;
    currentFolderId: string;

    breadcrumbs: Breadcrumb[];

    files: FileNode[];
    folders: FolderNode[];
};

export type NodeMetadata = {
    name: string;
    created: string;
    modified: string;
};

export type FolderMetadata = NodeMetadata;

export type FileMetadata = NodeMetadata & {
    size: number;
    mimeType: string;
};

export type DecryptedNode = {
    id: string;
    key: string;
    isShared: boolean;
};

export type FolderNodeDecrypted = DecryptedNode & {
    metadata: FolderMetadata;
};

export type FileNodeDecrypted = DecryptedNode & {
    metadata: FileMetadata;
    url: string;
};

export type BreadcrumbDecrypted = DecryptedNode & {
    metadata: FolderMetadata;
};

export type DriveList = {
    workspaceFolderId: string;
    currentFolderId: string;

    breadcrumbs: BreadcrumbDecrypted[];

    files: FileNodeDecrypted[];
    folders: FolderNodeDecrypted[];
};
