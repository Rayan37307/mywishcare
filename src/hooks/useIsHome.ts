import { useLocation } from 'react-router-dom';

const useIsHome = () => {
  const location = useLocation();
  return location.pathname === '/';
};

export default useIsHome;