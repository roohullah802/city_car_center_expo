import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth, useUser } from "@clerk/clerk-expo";
import {
  setToken,
  setLoggedIn,
  setUserData,
  clearUserData,
} from "../redux.toolkit/slices/userSlice";


export default function ClerkTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const { getToken, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();


  useEffect(() => {
    let interval: any;

    const fetchAndStore = async () => {
      try {
        if (!isSignedIn) {
          dispatch(clearUserData());
          dispatch(setLoggedIn(false));
          return;
        }

        const freshToken = await getToken();

        if (freshToken) {
          dispatch(setToken(freshToken));
          dispatch(setLoggedIn(true));
        }

        if (userLoaded && user) {
          dispatch(
            setUserData({
              id: user.id,
              name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
              email: user.emailAddresses[0]?.emailAddress || "",
              profile: user.imageUrl,
            })
          );
        }
      } catch (err) {
        console.log("Error refreshing Clerk token:", err);
      }
    };

    fetchAndStore();

    interval = setInterval(fetchAndStore, 60 * 1000);

    return () => clearInterval(interval);
  }, [isSignedIn, userLoaded, dispatch,getToken,user]);

  return <>{children}</>;
}
