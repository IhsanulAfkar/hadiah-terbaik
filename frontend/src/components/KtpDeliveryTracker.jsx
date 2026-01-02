/**
 * KtpDeliveryTracker Component
 * Displays KTP delivery status with timeline visualization
 */
const KtpDeliveryTracker = ({ 
  status = 'PENDING', 
  receipt, 
  sentAt, 
  receivedAt,
  deliveryAddress,
  notes 
}) => {
  const statusConfig = {
    PENDING: { 
      color: 'bg-gray-500', 
      textColor: 'text-gray-700',
      bgLight: 'bg-gray-100',
      text: 'Belum Siap Kirim',
      icon: '⏳'
    },
    READY_TO_SEND: { 
      color: 'bg-blue-500', 
      textColor: 'text-blue-700',
      bgLight: 'bg-blue-100',
      text: 'Siap Dikirim',
      icon: '📦'
    },
    SENT_VIA_POST: { 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-700',
      bgLight: 'bg-yellow-100',
      text: 'Sedang Dikirim',
      icon: '🚚'
    },
    DELIVERED: { 
      color: 'bg-green-500', 
      textColor: 'text-green-700',
      bgLight: 'bg-green-100',
      text: 'Sudah Diterima',
      icon: '✅'
    }
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  const timelineSteps = [
    { label: 'Disetujui', key: 'approved', active: status !== 'PENDING' },
    { label: 'Siap Kirim', key: 'ready', active: status !== 'PENDING' },
    { label: 'Dikirim', key: 'sent', active: status === 'SENT_VIA_POST' || status === 'DELIVERED' },
    { label: 'Diterima', key: 'delivered', active: status === 'DELIVERED' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Status Pengiriman KTP
        </h4>
        <span className="text-2xl">{config.icon}</span>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center px-4 py-2 rounded-full ${config.color} text-white font-medium mb-4`}>
        {config.text}
      </div>

      {/* Delivery Info */}
      {receipt && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Nomor Resi:</p>
          <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">{receipt}</p>
        </div>
      )}

      {deliveryAddress && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Alamat Pengiriman:</p>
          <p className="text-sm text-gray-900 dark:text-white mt-1">{deliveryAddress}</p>
        </div>
      )}

      {sentAt && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Kirim:</p>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date(sentAt).toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      )}

      {receivedAt && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Diterima:</p>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date(receivedAt).toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      )}

      {notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Catatan:</p>
          <p className="text-sm text-gray-900 dark:text-white italic">{notes}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Timeline:</p>
        <div className="flex justify-between items-center relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-600 -z-10">
            <div 
              className={`h-full transition-all duration-500 ${config.color}`}
              style={{ 
                width: `${(timelineSteps.filter(s => s.active).length / timelineSteps.length) * 100}%` 
              }}
            />
          </div>

          {/* Steps */}
          {timelineSteps.map((step, index) => (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step.active 
                    ? `${config.color} text-white shadow-lg` 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                }`}
              >
                {step.active ? '✓' : index + 1}
              </div>
              <p className={`mt-2 text-xs font-medium whitespace-nowrap ${
                step.active 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-500'
              }`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      {status === 'READY_TO_SEND' && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            📍 KTP siap untuk dikirim. Operator Dukcapil akan segera memproses pengiriman via Pos Indonesia.
          </p>
        </div>
      )}

      {status === 'SENT_VIA_POST' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            🚚 KTP sedang dalam perjalanan. Silahkan cek nomor resi untuk tracking pengiriman.
          </p>
        </div>
      )}
    </div>
  );
};

export default KtpDeliveryTracker;
