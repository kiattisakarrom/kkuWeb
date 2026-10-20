import { useEffect, useState } from 'react';
import { apiMessage, ipdApi } from './ipdApi';

export function useIpdRead(path, params, refresh = 0, enabled = true) {
  const paramsKey = JSON.stringify(params);
  const requestKey = `${path}?${paramsKey}`;
  const [result, setResult] = useState(null);
  const [failure, setFailure] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setResult(null);
    setFailure(null);
    ipdApi
      .get(path, { params: JSON.parse(paramsKey), signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setFailure({
            key: requestKey,
            message: apiMessage(error, 'โหลดข้อมูลไม่ได้ กรุณาลองใหม่'),
          });
      });
    return () => controller.abort();
  }, [path, paramsKey, requestKey, refresh, enabled]);
  const data = enabled && result?.key === requestKey ? result.data : null;
  const error = enabled && failure?.key === requestKey ? failure.message : '';
  return { data, error, loading: enabled && !data && !error };
}
