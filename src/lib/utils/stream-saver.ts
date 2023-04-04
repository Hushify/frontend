import { WritableStream } from 'web-streams-polyfill/ponyfill';

export async function getStreamSaver() {
    const saver = (await import('streamsaver')).default;
    saver.mitm = '/mitm.html';
    saver.WritableStream = saver.WritableStream || WritableStream;
    return saver;
}
