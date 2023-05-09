import { downloadZip } from 'client-zip';

import { FileNodeDecrypted, SelectedNode } from '@/lib/types/drive';
import { StreamDecrypter } from '@/lib/utils/stream-decryptor';
import { getStreamSaver } from '@/lib/utils/stream-saver';
import { StreamSlicer } from '@/lib/utils/stream-slicer';

export async function downloadFile(node: FileNodeDecrypted) {
    const responseStream = await fetch(node.url);
    if (!responseStream.body) {
        return;
    }

    const streamSaver = await getStreamSaver();
    const stream = streamSaver.createWriteStream(node.metadata.name, {
        size: node.metadata.size,
    });

    window.onunload = () => {
        stream.abort();
    };

    let done = false;

    window.onbeforeunload = evt => {
        if (!done) {
            evt.returnValue = `Download in progress. Are you sure you want to leave?`;
        }
    };

    try {
        await responseStream.body
            .pipeThrough(new TransformStream(new StreamSlicer()))
            .pipeThrough(new TransformStream(new StreamDecrypter(node.key)))
            .pipeTo(stream);
    } catch (error) {
        throw error;
    } finally {
        done = true;
    }
}

async function* downloadGenerator(nodes: FileNodeDecrypted[]) {
    for (const node of nodes)
        yield {
            input: await fetch(node.url).then(response => {
                if (!response.body) {
                    return response;
                }
                return response.body
                    .pipeThrough(new TransformStream(new StreamSlicer()))
                    .pipeThrough(new TransformStream(new StreamDecrypter(node.key)));
            }),
            name: node.metadata.name,
        };
}

export async function downloadMultiple(selectedNodes: SelectedNode[]) {
    const zip = downloadZip(
        downloadGenerator(
            selectedNodes.filter(f => f.type === 'file').map(f => f.node as FileNodeDecrypted)
        ),
        {
            buffersAreUTF8: true,
        }
    );

    const streamSaver = await getStreamSaver();
    const stream = streamSaver.createWriteStream('download.zip');

    window.onunload = () => {
        stream.abort();
    };

    let done = false;

    window.onbeforeunload = evt => {
        if (!done) {
            evt.returnValue = `Download in progress. Are you sure you want to leave?`;
        }
    };

    if (!zip.body) {
        done = true;
        throw new Error('Download failed!');
    }

    try {
        await zip.body.pipeTo(stream);
    } catch (error) {
        throw error;
    } finally {
        done = true;
    }
}
