import { zxcvbnOptions } from '@zxcvbn-ts/core';
import { OptionsType } from '@zxcvbn-ts/core/dist/types';
import zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import zxcvbnEnPackage from '@zxcvbn-ts/language-en';

const options: OptionsType = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
    },
};

zxcvbnOptions.setOptions(options);

export { zxcvbn } from '@zxcvbn-ts/core';
