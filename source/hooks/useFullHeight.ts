import { useEffect, useState } from 'react';

export const useFullHeight = () => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const intervalStatusCheck = setInterval(() => {
      setHeight(process.stdout.rows)
    }, 1000);
    setHeight(process.stdout.rows);

    return () => clearInterval(intervalStatusCheck);
  }, [])

  return height;
}
