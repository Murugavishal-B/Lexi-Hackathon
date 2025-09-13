// src/components/Auth.js
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Auth() {
  const [user, loading, error] = useAuthState(auth);

  const login = async () => {
    try { await signInWithPopup(auth, provider); } catch (e) { console.error(e); }
  };
  const logout = async () => { await signOut(auth); };

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="text-sm">{user.displayName}</div>
          <button onClick={logout} className="ml-auto bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </>
      ) : (
        <button onClick={login} className="bg-green-600 text-white px-3 py-1 rounded">Sign in with Google</button>
      )}
    </div>
  );
}
