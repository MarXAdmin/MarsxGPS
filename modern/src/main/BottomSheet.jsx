import React, { useState, useRef, useEffect } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

const CustomBottomSheet = ({ isOpen, onClose, children, selectedDevices }) => {
    const [currentSnap, setCurrentSnap] = useState(0.5);
    const sheetRef = useRef();

    useEffect(() => {
        if (selectedDevices.length > 0) {
            changeSnap(0.1);
        }
    }, [selectedDevices]);

    const changeSnap = (snapValue) => {
        setCurrentSnap(snapValue);
        sheetRef.current.snapTo(({ maxHeight }) => snapValue * maxHeight);
    };

    return (
        <BottomSheet
            open={isOpen}
            ref={sheetRef}
            snapPoints={({ maxHeight }) => [0.15 * maxHeight, 0.5 * maxHeight, 0.8 * maxHeight]}
            defaultSnap={({ maxHeight }) => currentSnap * maxHeight}
            onDismiss={onClose}
            blocking={false}
        >
            <div style={{ padding: '16px' }}>
                {children}
            </div>
        </BottomSheet>
    );
};

export default CustomBottomSheet;
