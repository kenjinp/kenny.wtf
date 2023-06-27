import React from 'react';

export function useDarkMode() {
  const [prefersDarkMode, setPrefersDarkMode] = React.useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  React.useEffect(() => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      setPrefersDarkMode(event.matches);
    });
  }, []);

  return prefersDarkMode;
}
