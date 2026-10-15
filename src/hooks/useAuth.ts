// isAuthenticated = true/false

import { useAppSelector } from "@/redux/hook";

const useAuth = () => {
  const token = useAppSelector((state) => state?.auth?.accessToken);

  return token ? true : false;
};
export default useAuth;
