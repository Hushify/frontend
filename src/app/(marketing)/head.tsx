const Head = () => (
    <>
        <meta
            name='viewport'
            content='minimum-scale=1, width=device-width, initial-scale=1, shrink-to-fit=no'
        />
        <meta charSet='utf-8' />
        <meta httpEquiv='x-ua-compatible' content='ie=edge' />

        <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />

        <meta name='robots' content='index, follow' />

        <meta name='keywords' content='Hushify' />
        <meta
            name='description'
            content='Hushify, an opensource end to end encrypted storage'
        />

        <meta name='theme-color' content='#4f46e5' />

        <meta
            property='og:description'
            content='Hushify, an opensource end to end encrypted storage.'
        />
        <meta property='og:type' content='Website' />
        <meta property='og:title' content='Hushify' />
        <meta
            property='og:image'
            content={`https://${
                process.env.NEXT_PUBLIC_DOMAIN ?? 'hushify.io'
            }/og-image.png`}
        />

        <meta
            name='twitter:description'
            content='Hushify, an opensource end to end encrypted storage.'
        />
        <meta name='twitter:title' content='Hushify' />
        <meta name='twitter:card' content='summary' />

        <link
            rel='apple-touch-icon'
            sizes='180x180'
            href='/apple-touch-icon.png'
        />
        <link
            rel='icon'
            type='image/png'
            sizes='32x32'
            href='/favicon-32x32.png'
        />
        <link
            rel='icon'
            type='image/png'
            sizes='16x16'
            href='/favicon-16x16.png'
        />
        <link rel='manifest' href='/manifest.json' />

        <meta name='msapplication-TileColor' content='#ffffff' />
        <meta name='msapplication-TileImage' content='/ms-icon-144x144.png' />
        <meta name='theme-color' content='#4f46e5' />

        <title>Hushify</title>
    </>
);

export default Head;
