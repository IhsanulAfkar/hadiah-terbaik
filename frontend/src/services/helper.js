
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export const getStatusBadgeVariant = (s) => {
  switch (s) {
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'danger';
    case 'PROCESSING': return 'info';
    case 'SUBMITTED': return 'warning';
    default: return 'default';
  }
};
export const getStatusLabel = (status) => {
  switch (status) {
    case 'APPROVED': return 'Disetujui';
    case 'REJECTED': return 'Ditolak';
    case 'PENDING_VERIFICATION': return 'Menunggu Verifikasi';
    default: return status;
  }
};