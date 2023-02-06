import { SanityDocument } from 'sanity';
import Iframe from 'sanity-plugin-iframe-pane';
import { DefaultDocumentNodeResolver } from 'sanity/desk';

function getPreviewUrl(doc: SanityDocument) {
    const slug = doc?.slug as { current: string } | undefined;
    return slug?.current
        ? `${window.location.protocol}//${window.location.host}/api/preview?destination=/blog/${slug.current}`
        : `${window.location.protocol}//${window.location.host}/api/preview`;
}

export const defaultDocumentNode: DefaultDocumentNodeResolver = (
    S,
    { schemaType }
) => {
    if (schemaType === 'post') {
        return S.document().views([
            S.view.form(),
            S.view
                .component(Iframe)
                .options({
                    url: getPreviewUrl,
                    reload: {
                        button: true,
                    },
                    attributes: {},
                })
                .title('Preview'),
        ]);
    }

    return S.document().views([S.view.form()]);
};
