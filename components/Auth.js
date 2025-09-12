import { auth, provider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Auth() {
  const [user] = useAuthState(auth);

  const login = () => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  return (
    <div className="mb-4 flex justify-between items-center w-full max-w-2xl">
      {user ? (
        <>
          <p className="text-gray-700">👋 Hi, {user.displayName}</p>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={login}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
