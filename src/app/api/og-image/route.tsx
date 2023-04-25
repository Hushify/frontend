import { ImageResponse, NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const title = request.nextUrl.searchParams.get('title');
    const subtitle = request.nextUrl.searchParams.get('subtitle');
    if (!title) {
        throw new Error('Title is required');
    }

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    backgroundColor: 'white',
                    backgroundImage:
                        'radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <svg viewBox='0 0 634 724' fill='black' height={80}>
                        <path
                            fillRule='evenodd'
                            clipRule='evenodd'
                            d='M90.5714 316.75V226.25C90.5714 166.245 114.427 108.697 156.891 66.2671C199.354 23.837 256.947 0 317 0C377.053 0 434.646 23.837 477.109 66.2671C519.573 108.697 543.429 166.245 543.429 226.25V316.75C567.45 316.75 590.487 326.285 607.472 343.257C624.458 360.229 634 383.248 634 407.25V633.5C634 657.502 624.458 680.521 607.472 697.493C590.487 714.465 567.45 724 543.429 724H90.5714C66.5504 724 43.5132 714.465 26.5278 697.493C9.54232 680.521 0 657.502 0 633.5V407.25C0 383.248 9.54232 360.229 26.5278 343.257C43.5132 326.285 66.5504 316.75 90.5714 316.75ZM452.857 226.25V316.75H181.143V226.25C181.143 190.247 195.456 155.718 220.934 130.26C246.413 104.802 280.968 90.5 317 90.5C353.032 90.5 387.587 104.802 413.066 130.26C438.544 155.718 452.857 190.247 452.857 226.25Z'
                            fill='currentColor'
                        />
                    </svg>
                </div>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 40,
                        fontStyle: 'bold',
                        color: 'black',
                        marginTop: 16,
                        whiteSpace: 'pre-wrap',
                    }}>
                    {title}
                </div>
                {subtitle && (
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 24,
                            color: 'black',
                            whiteSpace: 'pre-wrap',
                        }}>
                        {subtitle}
                    </div>
                )}
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
