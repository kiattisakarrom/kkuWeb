import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useMatch,
} from 'react-router-dom';
import Login from './login/Login';
import IpdWorkspace from './components/ipd/IpdWorkspace';
import ScreeningStat from './components/screening/ScreeningStat';
import QuickOrder from './components/quickorder/QuickOrder';
import Checkout from './components/checkout/Checkout';
import { apiMessage, getSessionToken, ipdApi } from './services/ipdApi';
import { IpdSessionContext } from './services/ipdSession';

function PrivateRoute() {
  const screening = useMatch('/ipd/screening');
  const quickOrder = useMatch('/ipd/quick-order');
  const checkout = useMatch('/ipd/checkout');
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const expired = () => {
      setSession(null);
      setChecking(false);
    };
    window.addEventListener('ipd-session-expired', expired);
    setChecking(true);
    setError('');
    if (!getSessionToken()) {
      setChecking(false);
    } else {
      ipdApi
        .get('/auth', { signal: controller.signal })
        .then(({ data }) => {
          if (!controller.signal.aborted) setSession(data);
        })
        .catch((requestError) => {
          if (
            !controller.signal.aborted &&
            requestError.response?.status !== 401
          )
            setError(apiMessage(requestError, 'ตรวจสอบการเข้าสู่ระบบไม่ได้'));
        })
        .finally(() => {
          if (!controller.signal.aborted) setChecking(false);
        });
    }
    return () => {
      controller.abort();
      window.removeEventListener('ipd-session-expired', expired);
    };
  }, [retry]);
  if (checking)
    return (
      <p role="status" className="p-8 text-slate-600">
        กำลังตรวจสอบการเข้าสู่ระบบ…
      </p>
    );
  if (error)
    return (
      <div role="alert" className="p-8 text-slate-700">
        <p>{error}</p>
        <button
          onClick={() => setRetry((value) => value + 1)}
          className="mt-3 rounded bg-blue-700 px-4 py-2 text-white"
        >
          ลองใหม่
        </button>
      </div>
    );
  return session ? (
    <IpdSessionContext.Provider value={session}>
      {checkout ? (
        <Checkout />
      ) : quickOrder ? (
        <QuickOrder />
      ) : screening ? (
        <ScreeningStat />
      ) : (
        <IpdWorkspace />
      )}
    </IpdSessionContext.Provider>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/screening"
          element={<Navigate to="/ipd/screening" replace />}
        />
        <Route
          path="/quickorder"
          element={<Navigate to="/ipd/quick-order" replace />}
        />
        <Route path="/ipd/*" element={<PrivateRoute />} />
        <Route
          path="/checkout"
          element={<Navigate to="/ipd/checkout" replace />}
        />
        <Route path="*" element={<Navigate to="/ipd" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
