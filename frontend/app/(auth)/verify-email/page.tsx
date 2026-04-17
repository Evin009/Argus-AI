import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-indigo-900/40 border border-indigo-700 p-4">
            <svg
              className="h-8 w-8 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
        <p className="text-gray-400 mb-6">
          We&apos;ve sent a confirmation link to your email address. Click the link to activate
          your account.
        </p>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-left text-sm text-gray-400 space-y-2 mb-6">
          <p className="font-medium text-gray-300">Didn&apos;t receive the email?</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email</li>
            <li>Wait a few minutes and try again</li>
          </ul>
        </div>

        <Link
          href="/login"
          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
