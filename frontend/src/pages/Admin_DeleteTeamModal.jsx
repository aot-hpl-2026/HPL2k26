// ============ DELETE TEAM MODAL ============
const DeleteTeamModal = ({ team, isOpen, onClose, onDelete, isDeleting }) => {
  const [confirmName, setConfirmName] = useState('')
  const isMatch = team && confirmName === team.name

  useEffect(() => {
    if (isOpen) setConfirmName('')
  }, [isOpen])

  if (!isOpen || !team) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${team.name}`}
      size="sm"
    >
      <div className="space-y-4">
        <div className="alert alert-error">
          <HiExclamationTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Warning: Irreversible Action</h3>
            <div className="text-xs">
              This will verify permanently delete <strong>{team.name}</strong> and all associated data:
              <ul className="list-disc list-inside mt-1 ml-1">
                <li>All players in this team</li>
                <li>All matches involving this team</li>
                <li>Team statistics and history</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <label className="label">
            <span className="label-text">
              Type <span className="font-mono font-bold select-all">{team.name}</span> to confirm:
            </span>
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            className="input input-bordered w-full"
            placeholder={team.name}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(team._id)}
            className="btn btn-error"
            disabled={!isMatch || isDeleting}
          >
            {isDeleting ? <span className="loading loading-spinner"></span> : 'Delete Team'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
