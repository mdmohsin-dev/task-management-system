import Swal from 'sweetalert2';


export function confirmDelete(taskTitle) {
  return Swal.fire({
    title: 'Delete this task?',
    text: `"${taskTitle}" will be permanently deleted. This cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626', 
    cancelButtonColor: '#64748b', 
    reverseButtons: true,
    focusCancel: true,
  }).then((result) => result.isConfirmed);
}