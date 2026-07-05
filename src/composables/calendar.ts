export const useCalendar = () => {
  // generate months options for q-select
  const months = [
    { label: 'Januari', value: 0 },
    { label: 'Februari', value: 1 },
    { label: 'Maret', value: 2 },
    { label: 'April', value: 3 },
    { label: 'Mei', value: 4 },
    { label: 'Juni', value: 5 },
    { label: 'Juli', value: 6 },
    { label: 'Agustus', value: 7 },
    { label: 'September', value: 8 },
    { label: 'Oktober', value: 9 },
    { label: 'November', value: 10 },
    { label: 'Desember', value: 11 },
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getYears = (min: number, max: number) => {
    const years = [];
    for (let i = min; i <= max; i++) {
      years.push(i);
    }
    return years;
  };

  return {
    months,
    days,
    getYears,
  };
};
