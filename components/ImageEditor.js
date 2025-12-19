import React, { useRef, useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import {
    FaRedo,
    FaUndo,
    FaArrowsAltH,
    FaArrowsAltV,
    FaCheck,
    FaTimes,
    FaSearchPlus,
    FaSearchMinus
} from 'react-icons/fa';

export default function ImageEditor({ image, onSave, onCancel }) {
    const cropperRef = useRef(null);
    const [scaleX, setScaleX] = useState(1);
    const [scaleY, setScaleY] = useState(1);

    const onCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            // Get cropped canvas
            const canvas = cropper.getCroppedCanvas({
                maxWidth: 4096,
                maxHeight: 4096,
                imageSmoothingQuality: 'high',
            });

            // Convert to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    onSave(blob);
                }
            }, 'image/jpeg', 0.9);
        }
    };

    const handleRotate = (degree) => {
        cropperRef.current?.cropper?.rotate(degree);
    };

    const handleFlip = (direction) => {
        const cropper = cropperRef.current?.cropper;
        if (direction === 'h') {
            const newScaleX = -scaleX;
            cropper.scaleX(newScaleX);
            setScaleX(newScaleX);
        } else {
            const newScaleY = -scaleY;
            cropper.scaleY(newScaleY);
            setScaleY(newScaleY);
        }
    };

    const handleZoom = (ratio) => {
        cropperRef.current?.cropper?.zoom(ratio);
    }

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col p-4 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 text-white">
                <h3 className="text-xl font-bold">Edit Foto</h3>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <FaTimes size={24} />
                </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden bg-gray-900 rounded-xl relative">
                <Cropper
                    src={image}
                    style={{ height: '100%', width: '100%' }}
                    initialAspectRatio={NaN}
                    guides={true}
                    ref={cropperRef}
                    viewMode={1}
                    autoCropArea={1}
                    background={false}
                    responsive={true}
                    checkOrientation={false}
                />
            </div>

            {/* Toolbar */}
            <div className="mt-4 bg-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-center">
                <div className="flex gap-2 border-r border-gray-600 pr-4">
                    <button
                        onClick={() => handleRotate(-90)}
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                        title="Rotate Left"
                    >
                        <FaUndo />
                    </button>
                    <button
                        onClick={() => handleRotate(90)}
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                        title="Rotate Right"
                    >
                        <FaRedo />
                    </button>
                </div>

                <div className="flex gap-2 border-r border-gray-600 pr-4">
                    <button
                        onClick={() => handleFlip('h')}
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                        title="Flip Horizontal"
                    >
                        <FaArrowsAltH />
                    </button>
                    <button
                        onClick={() => handleFlip('v')}
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                        title="Flip Vertical"
                    >
                        <FaArrowsAltV />
                    </button>
                </div>

                <div className="flex gap-2 border-r border-gray-600 pr-4">
                    <button
                        onClick={() => handleZoom(0.1)}
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                        title="Zoom In"
                    >
                        <FaSearchPlus />
                    </button>
                    <button
                        onClick={() => handleZoom(-0.1)}
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                        title="Zoom Out"
                    >
                        <FaSearchMinus />
                    </button>
                </div>

                <button
                    onClick={onCrop}
                    className="px-6 py-3 bg-sky-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-sky-blue/20"
                >
                    <FaCheck /> Simpan
                </button>
            </div>
        </div>
    );
}
