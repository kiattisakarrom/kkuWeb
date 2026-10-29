import { useEffect, useRef, useState } from 'react';

// Render the same Blob that is downloaded, without depending on a browser PDF
// plug-in. The worker and fonts stay local; no patient document leaves the app.
export default function ReportPdfPreview({
  file,
  page,
  zoom,
  title = 'รายงานการบรรจุยาเข้ารถเข็น',
}) {
  const host = useRef(null),
    canvas = useRef(null);
  const [document, setDocument] = useState(null),
    [error, setError] = useState(''),
    [rendering, setRendering] = useState(true);
  const [size, setSize] = useState({ width: 1, height: 1 });
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.max(1, width), height: Math.max(1, height) });
    });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let stopped = false,
      task;
    setDocument(null);
    setError('');
    setRendering(true);
    (async () => {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (stopped) return;
      task = pdfjs.getDocument({ data: bytes, isEvalSupported: false });
      const loaded = await task.promise;
      if (!stopped) setDocument(loaded);
    })().catch(() => {
      if (!stopped) {
        setError(
          'แสดงตัวอย่างรายงานไม่ได้ กรุณาลองค้นหาใหม่ หรือดาวน์โหลด PDF'
        );
        setRendering(false);
      }
    });
    return () => {
      stopped = true;
      task?.destroy();
    };
  }, [file]);
  useEffect(() => {
    if (!document) return;
    let stopped = false,
      task;
    setRendering(true);
    setError('');
    (async () => {
      const sheet = await document.getPage(page);
      if (stopped) return;
      const original = sheet.getViewport({ scale: 1 });
      const scale =
        zoom === 'FitH'
          ? size.width / original.width
          : zoom === 'Fit'
            ? Math.min(
                size.width / original.width,
                size.height / original.height
              )
            : Number(zoom) / 100;
      const viewport = sheet.getViewport({ scale: Math.max(0.1, scale) }),
        density = Math.min(window.devicePixelRatio || 1, 2);
      const element = canvas.current;
      element.width = Math.ceil(viewport.width * density);
      element.height = Math.ceil(viewport.height * density);
      element.style.width = `${viewport.width}px`;
      element.style.height = `${viewport.height}px`;
      task = sheet.render({
        canvas: element,
        canvasContext: element.getContext('2d'),
        viewport,
        // These reports preview the printable PDF. Print intent also finishes
        // rendering when a browser panel pauses display animation frames.
        intent: 'print',
        transform: [density, 0, 0, density, 0, 0],
      });
      await task.promise;
      if (!stopped) setRendering(false);
    })().catch(() => {
      if (!stopped) {
        setError('แสดงหน้ารายงานไม่ได้ กรุณาลองเปลี่ยนหน้าหรือดาวน์โหลด PDF');
        setRendering(false);
      }
    });
    return () => {
      stopped = true;
      task?.cancel();
    };
  }, [document, page, zoom, size.width, size.height]);
  return (
    <div
      ref={host}
      className="relative min-h-0 flex-1 overflow-auto p-4"
      style={{ scrollbarGutter: 'stable' }}
      aria-label="หน้ารายงาน PDF"
    >
      {rendering && (
        // Keep status outside normal flow: a fit-page canvas already fills the
        // viewport. An added line toggles scrollbars and can restart rendering.
        <p
          role="status"
          className="absolute inset-x-4 top-4 z-10 bg-gray-200 p-2 text-center"
        >
          กำลังแสดงรายงาน…
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="absolute inset-x-4 top-4 z-10 bg-gray-200 p-2 text-center text-red-700"
        >
          {error}
        </p>
      )}
      <canvas
        ref={canvas}
        role="img"
        aria-label={`${title} หน้า ${page}`}
        className={`mx-auto block bg-white shadow ${rendering || error ? 'invisible' : 'visible'}`}
      />
    </div>
  );
}
ReportPdfPreview.propTypes = {
  file: () => null,
  page: () => null,
  zoom: () => null,
  title: () => null,
};
