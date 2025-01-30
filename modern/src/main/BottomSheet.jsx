import React, { useState, useEffect } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

const CustomBottomSheet = ({ isOpen, onClose, children }) => {
    const [currentSnap, setCurrentSnap] = useState(0.5);


    useEffect(() => {
        if (!isOpen) {
            setCurrentSnap(0.5);
        }
    }, [isOpen]);

    return (
        <BottomSheet
            open={isOpen}
            snapPoints={({ maxHeight }) => [0.15 * maxHeight, 0.5 * maxHeight, 0.8 * maxHeight]}
            defaultSnap={({ maxHeight }) => currentSnap * maxHeight}
            blocking={false}
            onSpringEnd={({ height }) => {
                const minHeight = 0.2 * window.innerHeight;
                if (height <= minHeight) {
                    onClose();
                }
            }}
            onDismiss={onClose}>
            <div style={{ padding: '16px', marginBottom: '60px', zIndex: '4' }}>
                {children}
            </div>
        </BottomSheet>
    );
};

export default CustomBottomSheet;
