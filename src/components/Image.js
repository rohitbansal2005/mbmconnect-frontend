import React, { useState } from 'react';

const Image = ({ src, alt, className, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setError(true);
    };

    return (
        <div className={`image-container ${className || ''}`}>
            {!isLoaded && !error && (
                <div className="image-placeholder">
                    <div className="loading-spinner"></div>
                </div>
            )}
            {error ? (
                <div className="image-error">
                    <span>Failed to load image</span>
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="eager"
                    className={`image ${isLoaded ? 'loaded' : 'loading'}`}
                    {...props}
                />
            )}
            <style jsx>{`
                .image-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                .image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: opacity 0.3s ease;
                }
                .image.loading {
                    opacity: 0;
                }
                .image.loaded {
                    opacity: 1;
                }
                .image-placeholder {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f5f5f5;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .image-error {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f5f5f5;
                    color: #666;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Image; 