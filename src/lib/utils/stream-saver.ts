import saver from 'streamsaver';
import { WritableStream } from 'web-streams-polyfill/ponyfill';

saver.mitm = '/mitm.html';
saver.WritableStream = saver.WritableStream || WritableStream;
export const streamSaver = saver;
