import { Participant } from '../../../services/participantService';
import Icon from '../../../components/AppIcon';

interface FoodAccessLogProps {
    logs: Participant[];
    onUndo: (id: string) => void;
    sessionName?: string;
}

const FoodAccessLog = ({ logs, onUndo, sessionName = 'Food' }: FoodAccessLogProps) => {
    return (
        <div className="bg-card rounded-lg border border-border flex flex-col h-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon name="History" size={18} className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Recent {sessionName} Log</h3>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full text-foreground">
                    {logs.length} Total
                </span>
            </div>

            <div className="flex-1 overflow-auto p-0">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Icon name="Utensils" size={20} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm text-foreground font-medium">No records yet</p>
                        <p className="text-xs text-muted-foreground">Scanned participants will appear here</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 font-medium">Time</th>
                                <th className="px-4 py-3 font-medium">Participant</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {logs.map((log) => (
                                <tr key={log.id} className="bg-card hover:bg-muted/50 transition-colors group">
                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                        {/* Timestamp handling handled by parent sorting or simple fallback */}
                                        {log.foodHistory?.[sessionName]?.timestamp ? new Date(log.foodHistory[sessionName].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (log.foodAccessTime ? new Date(log.foodAccessTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-foreground">{log.name}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">{log.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => onUndo(log.id)}
                                            className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                            title="Undo / Remove"
                                        >
                                            <Icon name="Trash2" size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default FoodAccessLog;
