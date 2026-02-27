import { LogOut, LogIn, User } from 'lucide-react';

const AuthButton = ({ isSignedIn, userEmail, onSignIn, onSignOut }) => {
  return (
    <div className="flex items-center gap-4">
      {isSignedIn ? (
        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={16} />
            </div>
            <div className="flex flex-col text-right hidden md:flex">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Organizer</span>
                <span className="text-xs font-medium text-gray-700 max-w-[150px] truncate">
                    {userEmail || 'Signed In'}
                </span>
            </div>
            <button
                onClick={onSignOut}
                className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                title="Sign Out"
            >
                <LogOut size={16} />
            </button>
        </div>
      ) : (
        <button
            onClick={onSignIn}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition transform active:scale-95 font-medium text-sm"
        >
            <LogIn size={18} />
            <span>Sign in with Google</span>
        </button>
      )}
    </div>
  );
};

export default AuthButton;
