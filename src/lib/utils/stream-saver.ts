import saver from 'streamsaver';

import 'web-streams-polyfill/ponyfill';

saver.mitm = '/mitm.html';

export const streamSaver = saver;
