let emptyImage: HTMLImageElement | undefined;

// Helper from https://github.com/react-dnd/react-dnd/blob/main/packages/backend-html5/src/getEmptyImage.ts
// Image data url from https://png-pixel.com/
export function getEmptyImage() {
    if (!emptyImage) {
        emptyImage = new Image();
        emptyImage.src =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }

    return emptyImage;
}
