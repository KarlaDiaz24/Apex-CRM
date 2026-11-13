export default function Modal({
  isOpen,
  onClose,
  title,
  type = 'info', // 'success' | 'danger' | 'warning' | 'info' | 'edit'
  icon,
  children,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  showCancel = false
}) {
  if (!isOpen) return null;

  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'danger':
        return '🗑️';
      case 'warning':
        return '⚠️';
      case 'edit':
        return '✏️';
      default:
        return 'ℹ️';
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'modal-btn-confirm btn-confirm-danger';
      case 'success':
        return 'modal-btn-confirm btn-confirm-success';
      default:
        return 'modal-btn-confirm';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado del Modal */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className={`modal-icon-badge icon-${type}`}>
              {icon || getDefaultIcon()}
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            &times;
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body">
          {message && <p className="modal-message">{message}</p>}
          {children}
        </div>

        {/* Pie con Botones de Acción */}
        <div className="modal-footer">
          {showCancel && (
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button 
            type="button" 
            className={getConfirmButtonClass()} 
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

