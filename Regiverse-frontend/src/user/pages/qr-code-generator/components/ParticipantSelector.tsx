import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Participant } from '../types';

interface ParticipantSelectorProps {
  participants: Participant[];
  selectedParticipants: string[];
  onSelectionChange: (selected: string[]) => void;
}

const ParticipantSelector = ({
  participants,
  selectedParticipants,
  onSelectionChange
}: ParticipantSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusOptions = [
    { value: 'all', label: 'All Participants' },
    { value: 'pending', label: 'Pending Only' },
    { value: 'attended', label: 'Attended Only' },
    { value: 'absent', label: 'Absent Only' }
  ];

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedParticipants.length === filteredParticipants.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredParticipants.map((p) => p.id));
    }
  };

  const handleToggleParticipant = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      onSelectionChange(selectedParticipants.filter((id) => id !== participantId));
    } else {
      onSelectionChange([...selectedParticipants, participantId]);
    }
  };

  const isAllSelected = filteredParticipants.length > 0 && selectedParticipants.length === filteredParticipants.length;

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Icon name="Users" size={20} className="text-secondary" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Select Participants</h2>
          <p className="text-sm text-muted-foreground">
            {selectedParticipants.length} of {participants.length} participants selected
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="search"
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as string)}
          placeholder="Filter by status"
        />
      </div>

      <div className="flex items-center justify-between py-2 border-y border-border">
        <Checkbox
          label="Select All Filtered Participants"
          checked={isAllSelected}
          indeterminate={selectedParticipants.length > 0 && !isAllSelected}
          onChange={handleSelectAll}
        />
        <Button
          variant="ghost"
          size="sm"
          iconName="X"
          onClick={() => onSelectionChange([])}
          disabled={selectedParticipants.length === 0}
        >
          Clear Selection
        </Button>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredParticipants.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No participants found</p>
          </div>
        ) : (
          filteredParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors duration-150 cursor-pointer"
              onClick={() => handleToggleParticipant(participant.id)}
            >
              <Checkbox
                checked={selectedParticipants.includes(participant.id)}
                onChange={() => handleToggleParticipant(participant.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{participant.name}</p>
                <p className="text-sm text-muted-foreground truncate">{participant.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    participant.status === 'attended' ?'bg-success/10 text-success'
                      : participant.status === 'absent' ?'bg-error/10 text-error' :'bg-warning/10 text-warning'
                  }`}
                >
                  {participant.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParticipantSelector;