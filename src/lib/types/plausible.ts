// https://medium.com/@jmagrippis/website-analytics-with-next-js-and-plausible-io-3620da743a1

export type TrackEvent = 'Signup';

export type PlausibleArgs = [TrackEvent, () => void] | [TrackEvent];

declare global {
    const plausible: {
        (...args: PlausibleArgs): void;
        q?: PlausibleArgs[];
    };

    interface Window {
        plausible?: typeof plausible;
    }
}
