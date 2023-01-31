'use client';

import CheckList from '@editorjs/checklist';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import Embed from '@editorjs/embed';
import Header from '@editorjs/header';
import Image from '@editorjs/image';
import InlineCode from '@editorjs/inline-code';
import LinkTool from '@editorjs/link';
import List from '@editorjs/list';
import Marker from '@editorjs/marker';
import Quote from '@editorjs/quote';
import Raw from '@editorjs/raw';
import Table from '@editorjs/table';
import Warning from '@editorjs/warning';
import { useEffect, useRef } from 'react';

const EDITOR_JS_TOOLS = {
    embed: Embed,
    table: Table,
    marker: Marker,
    list: List,
    warning: Warning,
    code: Code,
    linkTool: LinkTool,
    image: Image,
    raw: Raw,
    header: Header,
    quote: Quote,
    checklist: CheckList,
    delimiter: Delimiter,
    inlineCode: InlineCode,
};

export const EditorJsWrapper = ({ config = {}, ...restProps }) => {
    const elmtRef = useRef();
    const editorJs = useRef();

    useEffect(() => {
        if (!elmtRef.current) {
            return () => {};
        }

        (async () => {
            const { default: EditorJS } = await import('@editorjs/editorjs');

            if (editorJs.current) {
                editorJs.current.destroy();
            }

            editorJs.current = new EditorJS({
                ...config,
                holder: elmtRef.current,
                tools: EDITOR_JS_TOOLS,
                placeholder: 'Notes...',
                minHeight: 2000,
            });
        })().catch(console.error);

        return () => {
            if (editorJs.current) {
                editorJs.current.destroy();
            }
        };
    }, [config]);

    return (
        <div
            className='prose h-96 [&>div]:mx-auto [&>div]:max-w-prose [&>div]:overflow-y-auto [&>div]:overflow-x-hidden'
            {...restProps}
            ref={elmtRef}
        />
    );
};
