import React from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

const CustomBottomSheet = ({ isOpen, onDismiss, snapPoints, children }) => {
    return (
        <BottomSheet
            open={isOpen}
            onDismiss={onDismiss}
            snapPoints={snapPoints}
            style={{ maxHeight: '50vh' }}
        >
            <div style={{ padding: '16px', marginBottom: '60px' }}>
                {children}
            </div>
        </BottomSheet>
    );
};

export default CustomBottomSheet;
