import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * ImageCropper — lets the user pan, zoom, and rotate an image inside a circular crop area.
 * Props:
 *   imageSrc  {string}   Object URL of the selected file
 *   onCrop    {function} called with the cropped Blob
 *   onCancel  {function} called when user cancels
 */
export default function ImageCropper({ imageSrc, onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropReady, setCropReady] = useState(false);

  const CANVAS_SIZE = 280;
  const CROP_RADIUS = 120;

  // Load the image
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setCropReady(true);
    };
    image.src = imageSrc;
  }, [imageSrc]);

  // Draw the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw the image (panned, zoomed, rotated)
    ctx.save();
    ctx.translate(cx + offset.x, cy + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();

    // Darken area outside the circle
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw circle border
    ctx.beginPath();
    ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw dashed guide crosshairs
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - CROP_RADIUS);
    ctx.lineTo(cx, cy + CROP_RADIUS);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - CROP_RADIUS, cy);
    ctx.lineTo(cx + CROP_RADIUS, cy);
    ctx.stroke();
    ctx.restore();
  }, [img, zoom, rotation, offset]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Pointer events for panning
  const getPointerPos = (e) => {
    if (e.touches) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const pos = getPointerPos(e);
    setDragging(true);
    setDragStart({ x: pos.x - offset.x, y: pos.y - offset.y });
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = getPointerPos(e);
    setOffset({ x: pos.x - dragStart.x, y: pos.y - dragStart.y });
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((z) => Math.min(3, Math.max(0.5, z + delta)));
  };

  // Crop and return blob
  const handleCrop = () => {
    if (!img) return;
    const outputSize = 400; // px, exported square
    const outCanvas = document.createElement('canvas');
    outCanvas.width = outputSize;
    outCanvas.height = outputSize;
    const ctx = outCanvas.getContext('2d');

    // Scale factor: outputSize / CANVAS_SIZE
    const sf = outputSize / CANVAS_SIZE;
    const cx = outputSize / 2;
    const cy = outputSize / 2;
    const cropR = CROP_RADIUS * sf;

    // Clip to circle
    ctx.beginPath();
    ctx.arc(cx, cy, cropR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Draw image with same transforms
    ctx.translate(cx + offset.x * sf, cy + offset.y * sf);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
    const w = img.width * scale * sf;
    const h = img.height * scale * sf;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);

    outCanvas.toBlob(
      (blob) => {
        if (blob) onCrop(blob);
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <div className="cropper-overlay" onClick={onCancel}>
      <div className="cropper-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="cropper-title">Adjust Your Photo</h3>
        <p className="cropper-subtitle">Drag to reposition • Scroll or use slider to zoom</p>

        <div className="cropper-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onWheel={handleWheel}
            style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
          />
        </div>

        {/* Controls */}
        <div className="cropper-controls">
          <div className="cropper-control-row">
            <label className="cropper-label">🔍 Zoom</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="cropper-slider"
            />
            <span className="cropper-value">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="cropper-control-row">
            <label className="cropper-label">🔄 Rotate</label>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="cropper-slider"
            />
            <span className="cropper-value">{rotation}°</span>
          </div>
          <div className="cropper-quick-actions">
            <button
              type="button"
              className="cropper-quick-btn"
              onClick={() => setRotation((r) => r - 90)}
              title="Rotate Left"
            >↺ 90°</button>
            <button
              type="button"
              className="cropper-quick-btn"
              onClick={() => setRotation((r) => r + 90)}
              title="Rotate Right"
            >↻ 90°</button>
            <button
              type="button"
              className="cropper-quick-btn"
              onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); setRotation(0); }}
              title="Reset"
            >↩ Reset</button>
          </div>
        </div>

        <div className="cropper-actions">
          <button type="button" className="cropper-btn cropper-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="cropper-btn cropper-btn-confirm"
            onClick={handleCrop}
            disabled={!cropReady}
          >
            ✂️ Crop & Upload
          </button>
        </div>
      </div>
    </div>
  );
}
