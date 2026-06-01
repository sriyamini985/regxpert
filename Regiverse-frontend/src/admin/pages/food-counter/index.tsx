import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodAccessScanner from './components/FoodAccessScanner';
import FoodAccessLog from './components/FoodAccessLog';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import {
    subscribeToParticipants,
    recordFoodAccess,
    undoFoodAccess,
    getParticipantByQRCode,
    Participant
} from '../../../services/participantService';

const FoodCounter = () => {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [accessedLogs, setAccessedLogs] = useState<Participant[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Feedback state
    const [scanResult, setScanResult] = useState<{
        success: boolean;
        message: string;
        participant?: Participant;
        type: 'success' | 'warning' | 'error';
    } | null>(null);

    const [currentSession, setCurrentSession] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');

    // Subscribe to real-time data
    useEffect(() => {
        document.title = 'Food Access Counter - Regiverse';
        const unsubscribe = subscribeToParticipants((data) => {
            setParticipants(data);
            // Filter for logs for CURRENT SESSION
            const logs = data
                .filter(p => p.foodHistory?.[currentSession])
                .sort((a, b) => {
                    const timeA = a.foodHistory?.[currentSession]?.timestamp ? new Date(a.foodHistory[currentSession].timestamp).getTime() : 0;
                    const timeB = b.foodHistory?.[currentSession]?.timestamp ? new Date(b.foodHistory[currentSession].timestamp).getTime() : 0;
                    return timeB - timeA;
                });
            setAccessedLogs(logs);
        });
        return () => unsubscribe();
    }, [currentSession]); // Re-run when session changes

    const handleScan = async (qrCode: string) => {
        if (isProcessing) return;
        setIsProcessing(true);
        setScanResult(null);

        try {
            // 1. Find participant locally first ...
            let participant = participants.find(p => p.qrCode === qrCode);

            if (!participant) {
                const fetched = await getParticipantByQRCode(qrCode);
                if (fetched) participant = fetched;
            }

            if (!participant) {
                setScanResult({
                    success: false,
                    message: 'Invalid QR Code. Participant not found.',
                    type: 'error'
                });
                setIsProcessing(false);
                return;
            }

            // 2. Check Food Access Status for CURRENT SESSION
            const sessionData = participant.foodHistory?.[currentSession];

            if (sessionData) {
                setScanResult({
                    success: false,
                    message: `Already collected ${currentSession} at ${sessionData.timestamp ? new Date(sessionData.timestamp).toLocaleTimeString() : 'unknown time'}.`,
                    participant,
                    type: 'warning'
                });
                setIsProcessing(false);
                return;
            }

            // 3. Record Access
            await recordFoodAccess(participant.id, currentSession);

            setScanResult({
                success: true,
                message: `${currentSession} authorized.`,
                participant,
                type: 'success'
            });

        } catch (error) {
            console.error('Food access error:', error);
            setScanResult({
                success: false,
                message: 'System error. Please try again.',
                type: 'error'
            });
        }

        // Reset processing after delay
        setTimeout(() => {
            setIsProcessing(false);
        }, 2000);
    };

    const handleManualReset = () => {
        setScanResult(null);
        setIsProcessing(false);
    };

    const handleUndo = async (id: string) => {
        if (window.confirm(`Are you sure you want to remove this ${currentSession} entry?`)) {
            await undoFoodAccess(id, currentSession);
        }
    };

    return (
        <div className="page-bg">


            <main className="page-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                <Icon name="Utensils" size={24} className="text-[#FF9F43]" />
                            </div>
                            <div>
                                <h1 className="text-fluid-3xl font-bold text-gray-900">Food Counter</h1>
                                <p className="text-gray-500">Scan QR codes to verify food entitlement</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-center shadow-sm">
                                <span className="block text-fluid-2xl font-bold text-[#FF9F43]">{accessedLogs.length}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Served</span>
                            </div>
                            <Button variant="outline" onClick={() => navigate('/admin-dashboard')} iconName="ArrowLeft">
                                Back
                            </Button>
                        </div>
                    </div>

                    {/* Session Selector */}
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                        {['Breakfast', 'Lunch', 'Dinner'].map((session) => (
                            <button
                                key={session}
                                onClick={() => setCurrentSession(session as any)}
                                className={`px-6 py-3 rounded-xl font-medium transition-all ${currentSession === session
                                    ? 'bg-[#FF9F43] text-white shadow-md'
                                    : 'bg-white border border-gray-200 hover:border-orange-300 text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                {session}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Scanner & Result */}
                        <div className="lg:col-span-2 space-y-6">
                            <FoodAccessScanner
                                onScan={handleScan}
                                isProcessing={isProcessing}
                                testCodes={participants.map(p => p.qrCode || '').filter(Boolean)}
                            />

                            {/* Result Card */}
                            {scanResult && (
                                <div className={`p-6 rounded-lg border-2 animate-in fade-in zoom-in-95 duration-200 ${scanResult.type === 'success' ? 'bg-green-500/10 border-green-500/20' :
                                    scanResult.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                        'bg-red-500/10 border-red-500/20'
                                    }`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${scanResult.type === 'success' ? 'bg-green-500 text-white' :
                                            scanResult.type === 'warning' ? 'bg-yellow-500 text-white' :
                                                'bg-red-500 text-white'
                                            }`}>
                                            <Icon
                                                name={scanResult.type === 'success' ? 'Check' : scanResult.type === 'warning' ? 'AlertTriangle' : 'X'}
                                                size={24}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-bold mb-1 ${scanResult.type === 'success' ? 'text-green-600' :
                                                scanResult.type === 'warning' ? 'text-yellow-600' :
                                                    'text-red-500'
                                                }`}>
                                                {scanResult.type === 'success' ? 'Authorized' : scanResult.type === 'warning' ? 'Access Denied' : 'Error'}
                                            </h3>
                                            <p className="text-foreground font-medium text-lg mb-2">{scanResult.message}</p>

                                            {scanResult.participant && (
                                                <div className="bg-background/50 rounded-lg p-3 text-sm">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-muted-foreground">Name:</span>
                                                        <span className="font-semibold">{scanResult.participant.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">ID:</span>
                                                        <span className="font-mono text-xs">{scanResult.participant.id}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {scanResult.type !== 'success' && (
                                            <Button size="sm" variant="outline" onClick={handleManualReset}>
                                                Reset
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Log */}
                        <div className="h-[600px] lg:h-auto">
                            <FoodAccessLog logs={accessedLogs} onUndo={handleUndo} sessionName={currentSession} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FoodCounter;
