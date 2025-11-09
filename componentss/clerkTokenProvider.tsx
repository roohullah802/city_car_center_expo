import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth, useUser } from "@clerk/clerk-expo";
import {
  setToken,
  setLoggedIn,
  setUserData,
} from "../redux.toolkit/slices/userSlice";

export default function ClerkTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchToken = async () => {
      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          dispatch(setToken(token));
          dispatch(setLoggedIn(true));
          if (user) {
            dispatch(
              setUserData({
                name: `${user.firstName} ${user.lastName ? user.lastName : ''}`,
                email: user.emailAddresses[0]?.emailAddress || "",
                id: user.id,
                profile: user.imageUrl,
              })
            );
          }
        }
      }
    };
    fetchToken();
  }, [isSignedIn, dispatch, getToken, user]);
  return <>{children}</>;
}
