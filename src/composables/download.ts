import { api } from '@/boot/axios';
import { useQuasar } from 'quasar';
import { ref } from 'vue';

export const useDownload = () => {
  const loading = ref(false);
  const $q = useQuasar();

  const downloadFile = (
    url: string,
    accept: string = 'application/pdf',
    filename: string = 'report.pdf'
  ) => {
    loading.value = true;
    api
      .get<Blob>(url, {
        headers: {
          Accept: accept,
        },
        responseType: 'blob', // Ensure the response is treated as a blob
      })
      .then((response) => {
        console.log('Download successful:', response);
        const blob = new Blob([response], { type: accept });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename); // ✅ File name
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Download failed:', error);
        $q.notify({
          type: 'negative',
          message: 'Gagal mengunduh file. Silakan coba lagi.',
        });
      })
      .finally(() => {
        loading.value = false;
      });
  };

  return {
    downloadFile,
  };
};
