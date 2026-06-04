import { useState, useEffect, useRef } from 'react';
import Button from '../../../../components/ui/Button';
import Icon from 'components/AppIcon';

interface ScannerState {
    isScanning: boolean;
    hasPermission: boolean;
    error: string | null;
}

interface FoodAccessScannerProps {
    onScan: (qrCode: string) => void;
    isProcessing: boolean;
    testCodes?: string[];
}

const FoodAccessScanner = ({ onScan, isProcessing, testCodes = [] }: FoodAccessScannerProps) => {
    const [scannerState, setScannerState] = useState<ScannerState>({
        isScanning: false,
        hasPermission: false,
        error: null
    });
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startScanning = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            setScannerState({
                isScanning: true,
                hasPermission: true,
                error: null
            });
            streamRef.current = stream;
        } catch (error) {
            setScannerState({
                isScanning: false,
                hasPermission: false,
                error: 'Camera access denied. Please enable camera permissions to scan QR codes.'
            });
        }
    };

    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }

        setScannerState({
            isScanning: false,
            hasPermission: scannerState.hasPermission,
            error: null
        });
    };

    const simulateScan = () => {
        // Use a valid code if available, otherwise random
        let mockCode;
        if (testCodes.length > 0) {
            mockCode = testCodes[Math.floor(Math.random() * testCodes.length)];
        } else {
            mockCode = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        }
        onScan(mockCode);
    };

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
            }
        };
    }, []);

    // Attach stream to video element when it becomes available
    useEffect(() => {
        if (scannerState.isScanning && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [scannerState.isScanning]);

    return (
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Icon name="Utensils" size={20} className="text-orange-500" />
            
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Food Access Scanner</h2>
                        <p className="text-sm text-muted-foreground">Scan QR code to verify food eligibility</p>
                    </div>
                </div>
                {scannerState.isScanning && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-green-500">Camera Active</span>
                    </div>
                )}
            </div>

            <div className="relative bg-muted rounded-lg overflow-hidden h-[300px] lg:h-[400px]">
                {!scannerState.isScanning ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        {scannerState.error ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                    <Icon name="AlertCircle" size={32} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Camera Error</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md">{scannerState.error}</p>
                                <Button variant="default" onClick={startScanning} iconName="Camera">
                                    Retry
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                                    <Icon name="QrCode" size={40} className="text-orange-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Serve</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                                    Start the camera to scan participant QR codes for food access verification.
                                </p>
                                <Button variant="default" onClick={startScanning} iconName="Camera" size="lg">
                                    Start Scanner
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative w-64 h-64">
                                <div className="absolute inset-0 border-2 border-orange-500 rounded-lg" />
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-lg" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-0.5 bg-orange-500/50 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-3 mt-6">
                {scannerState.isScanning ? (
                    <Button
                        variant="outline"
                        onClick={stopScanning}
                        iconName="Square"
                        fullWidth
                        disabled={isProcessing}
                    >
                        Stop
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        onClick={startScanning}
                        iconName="Camera"
                        fullWidth
                        disabled={isProcessing}
                    >
                        {scannerState.error ? 'Retry Camera' : 'Start Camera'}
                    </Button>
                )}

                <Button
                    variant="outline"
                    onClick={simulateScan}
                    iconName="Scan"
                    fullWidth
                    disabled={isProcessing}
                >
                    Simulate Scan
                </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const input = form.elements.namedItem('manualCode') as HTMLInputElement;
                        if (input.value.trim()) {
                            onScan(input.value.trim());
                            input.value = '';
                        }
                    }}
                    className="flex gap-2"
                >
                    <div className="relative flex-1">
                        <input
                            type="text"
                            name="manualCode"
                            placeholder="Enter QR Code manually..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            disabled={isProcessing}
                        />
                        <Icon name="Keyboard" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <Button type="submit" disabled={isProcessing}>
                        Check
                    </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    Use this to verify a specific person. The camera view is currently a preview.
                </p>
            </div>
        </div>
    );
};

export default FoodAccessScanner;

