export async function detectWebcam() {
    let md = navigator.mediaDevices;
    if (!md || !md.enumerateDevices) {
        return false;
    }

    const devices = await md.enumerateDevices();
    return devices.some(device => 'videoinput' === device.kind);
}
