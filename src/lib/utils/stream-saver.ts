import saver from 'streamsaver';
import { WritableStream } from 'web-streams-polyfill/ponyfill';

export async function getStreamSaver() {
    saver.mitm = '/mitm.html';
    saver.WritableStream = saver.WritableStream || WritableStream;
    return saver;
}
