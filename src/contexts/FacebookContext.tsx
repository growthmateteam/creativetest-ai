import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FACEBOOK_APP_ID, FACEBOOK_SCOPES, getMe, type FBUser } from "@/lib/facebook";

declare global {
  interface Window {
    FB: {
      init: (opts: object) => void;
      login: (cb: (r: FBLoginResponse) => void, opts: object) => void;
      logout: (cb?: () => void) => void;
      getLoginStatus: (cb: (r: FBLoginResponse) => void) => void;
    };
    fbAsyncInit: () => void;
  }
}

interface FBAuthResponse {
  accessToken: string;
  expiresIn: number;
  signedRequest: string;
  userID: string;
}

interface FBLoginResponse {
  status: "connected" | "not_authorized" | "unknown";
  authResponse?: FBAuthResponse;
}

interface FacebookContextValue {
  fbUser: FBUser | null;
  fbToken: string | null;
  fbLoading: boolean;
  fbConnected: boolean;
  sdkReady: boolean;
  fbLogin: () => Promise<void>;
  fbLogout: () => void;
}

const FacebookContext = createContext<FacebookContextValue | undefined>(undefined);

const TOKEN_KEY = "ct_fb_token";
const USER_KEY = "ct_fb_user";

function readStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function FacebookProvider({ children }: { children: ReactNode }) {
  const [fbUser, setFbUser] = useState<FBUser | null>(() => readStored<FBUser>(USER_KEY));
  const [fbToken, setFbToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [fbLoading, setFbLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const initDone = useRef(false);

  const applyToken = useCallback(async (token: string) => {
    setFbToken(token);
    localStorage.setItem(TOKEN_KEY, token);
    try {
      const user = await getMe(token);
      setFbUser(user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // token may be expired; clear it
      setFbToken(null);
      setFbUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    if (!FACEBOOK_APP_ID) {
      setFbLoading(false);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        version: "v21.0",
        xfbml: false,
        cookie: true,
      });
      setSdkReady(true);

      window.FB.getLoginStatus((resp) => {
        if (resp.status === "connected" && resp.authResponse) {
          applyToken(resp.authResponse.accessToken).finally(() => setFbLoading(false));
        } else {
          setFbLoading(false);
        }
      });
    };

    if (!document.getElementById("facebook-jssdk")) {
      const s = document.createElement("script");
      s.id = "facebook-jssdk";
      s.src = "https://connect.facebook.net/en_US/sdk.js";
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    }
  }, [applyToken]);

  const fbLogin = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!sdkReady) {
        reject(new Error("Facebook SDK not ready"));
        return;
      }
      window.FB.login(
        (resp) => {
          if (resp.status === "connected" && resp.authResponse) {
            applyToken(resp.authResponse.accessToken).then(resolve).catch(reject);
          } else {
            reject(new Error("Facebook login was cancelled or denied"));
          }
        },
        { scope: FACEBOOK_SCOPES },
      );
    });
  }, [sdkReady, applyToken]);

  const fbLogout = useCallback(() => {
    setFbUser(null);
    setFbToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (sdkReady && window.FB) {
      window.FB.logout();
    }
  }, [sdkReady]);

  return (
    <FacebookContext.Provider
      value={{
        fbUser,
        fbToken,
        fbLoading,
        fbConnected: !!fbToken,
        sdkReady,
        fbLogin,
        fbLogout,
      }}
    >
      {children}
    </FacebookContext.Provider>
  );
}

export function useFacebook() {
  const ctx = useContext(FacebookContext);
  if (!ctx) throw new Error("useFacebook must be used within FacebookProvider");
  return ctx;
}
