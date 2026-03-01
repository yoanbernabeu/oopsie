export function isScreenCaptureSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices !== 'undefined' &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'
  );
}

export async function captureScreen(): Promise<HTMLCanvasElement> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'browser',
    } as MediaTrackConstraints,
    audio: false,
    preferCurrentTab: true,
  } as DisplayMediaStreamOptions);

  const track = stream.getVideoTracks()[0];
  const settings = track.getSettings();

  const canvas = document.createElement('canvas');
  canvas.width = settings.width ?? 1920;
  canvas.height = settings.height ?? 1080;

  const video = document.createElement('video');
  video.srcObject = stream;
  video.muted = true;

  await video.play();

  // Wait one frame for the video to render
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Stop all tracks immediately
  stream.getTracks().forEach((t) => t.stop());
  video.srcObject = null;

  return canvas;
}
