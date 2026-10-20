import LoginPage from './LoginPage';
import backgroundImage from '../../img/Background1.png';

export default function Login() {
  return (
    <main
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:ml-44 sm:justify-start">
        <div className="flex min-h-[600px] w-full max-w-[500px] items-center justify-center rounded-[10px] bg-white p-[10px] shadow-[10px_10px_20px_rgba(0,0,0,0.2)]">
          <LoginPage />
        </div>
      </div>
    </main>
  );
}
