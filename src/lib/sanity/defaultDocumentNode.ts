import Iframe from 'sanity-plugin-iframe-pane';
import { DefaultDocumentNodeResolver } from 'sanity/desk';

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
                    url: `${window.location.protocol}//${window.location.host}/api/preview`,
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
