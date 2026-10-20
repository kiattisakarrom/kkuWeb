import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiMessage, ipdApi, saveSessionToken } from '../services/ipdApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [options, setOptions] = useState({ rooms: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setOptionsError('');
    ipdApi
      .get('/login-options', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setOptions(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setOptionsError(apiMessage(error, 'โหลดห้องยาไม่ได้ กรุณาลองใหม่'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || loading || optionsError) return;
    setSubmitting(true);
    setMessage('');
    try {
      const { data } = await ipdApi.post('/login', {
        username,
        password,
        roomCode,
      });
      saveSessionToken(data.token);
      setPassword('');
      navigate('/ipd', { replace: true });
    } catch (error) {
      setMessage(apiMessage(error, 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่'));
    } finally {
      setSubmitting(false);
    }
  };
  const inputClass =
    'mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring focus:border-blue-300 disabled:bg-gray-100';

  return (
    <section
      className="w-full max-w-sm rounded-lg bg-white bg-opacity-90 p-6 sm:p-10"
      aria-labelledby="login-heading"
    >
      <h1
        id="login-heading"
        className="mb-5 text-center text-2xl font-bold text-gray-900"
      >
        เข้าสู่ระบบ
      </h1>
      {optionsError && (
        <div
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {optionsError}
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="ml-2 font-semibold underline"
          >
            โหลดใหม่
          </button>
        </div>
      )}
      {message && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {message}
        </p>
      )}
      {!loading && !optionsError && !options.rooms.length && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
        >
          ไม่พบห้องยา IPD ที่เปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
        aria-busy={submitting}
      >
        <div>
          <label
            htmlFor="login-username"
            className="text-sm font-medium text-slate-700"
          >
            ชื่อผู้ใช้
          </label>
          <input
            id="login-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            maxLength={100}
            disabled={submitting}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-slate-700"
          >
            รหัสผ่าน
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            maxLength={100}
            disabled={submitting}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="login-room"
            className="text-sm font-medium text-slate-700"
          >
            ห้องยา
          </label>
          <select
            id="login-room"
            name="roomCode"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value)}
            required
            disabled={loading || submitting || Boolean(optionsError)}
            className={inputClass}
          >
            <option value="">
              {loading ? 'กำลังโหลดห้องยา…' : 'เลือกห้องยา'}
            </option>
            {options.rooms.map((room) => (
              <option key={room.code} value={room.code}>
                [{room.code}] {room.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={
            loading ||
            submitting ||
            Boolean(optionsError) ||
            !options.rooms.length
          }
          className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {submitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
        <p className="text-center text-xs text-gray-500">
          ดูข้อมูล IPD · เลือกวอร์ดหลังเข้าสู่ระบบ
        </p>
      </form>
    </section>
  );
}
