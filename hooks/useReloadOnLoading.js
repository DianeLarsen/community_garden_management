
import { useEffect } from "react";


const useReloadOnLoading = (loading) => {


  useEffect(() => {
    if (loading) {
      const intervalId = setInterval(() => {
        window.location.reload();
      }, 5000);
      return () => clearInterval(intervalId); // Clean up the interval on component unmount or when loading changes
    }
  }, [loading]);
};

export default useReloadOnLoading;
