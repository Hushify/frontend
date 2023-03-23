export async function StreamToBlob(stream: ReadableStream<Uint8Array> | null) {
    if (!stream) {
        return null;
    }

    let content = new Uint8Array();
    const reader = stream.getReader();

    async function saveChunk(chunk: ReadableStreamReadResult<Uint8Array>): Promise<void> {
        if (chunk.done) {
            return;
        }

        content = new Uint8Array([...content, ...chunk.value]);

        const result = await reader.read();
        return await saveChunk(result);
    }

    const result = await reader.read();
    await saveChunk(result);
    return content;
}
