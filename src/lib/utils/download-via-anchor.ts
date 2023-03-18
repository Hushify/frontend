export function downloadViaAnchor(data: string, fileName: string) {
    const blob = new Blob([data], { type: 'text/plain' });
    const blobUrl = URL.createObjectURL(blob);
    const aTag = document.createElement('a');
    aTag.setAttribute('href', blobUrl);
    aTag.setAttribute('download', fileName);
    document.body.appendChild(aTag);
    aTag.click();
    document.body.removeChild(aTag);
    URL.revokeObjectURL(blobUrl);
}
