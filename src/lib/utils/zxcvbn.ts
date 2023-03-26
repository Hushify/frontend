import { zxcvbnOptions } from '@zxcvbn-ts/core';
import matcherPwnedFactory from '@zxcvbn-ts/matcher-pwned';

zxcvbnOptions.addMatcher('pwned', matcherPwnedFactory(fetch, zxcvbnOptions));
export { zxcvbnAsync } from '@zxcvbn-ts/core';
