'use client';

import { Prism } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function SyntaxHighlighter({
    code,
    language,
}: {
    code: string;
    language: string;
}) {
    return (
        <Prism language={language} style={oneDark}>
            {code}
        </Prism>
    );
}
