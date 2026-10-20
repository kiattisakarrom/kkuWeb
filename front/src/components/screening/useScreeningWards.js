import { useEffect, useRef, useState } from 'react';
import { apiMessage, ipdApi } from '../../services/ipdApi';
import {
  matchesScreeningWardResponse,
  screeningWardRequest,
} from './screeningWardRequest';

export function useScreeningWards(
  params,
  refresh,
  enabled,
  endpoint = '/ipd/screening/wards'
) {
  const request = { ...screeningWardRequest(params, refresh), endpoint };
  const paramsKey = request.key;
  const [response, setResponse] = useState(null);
  const [failure, setFailure] = useState(null);
  const completed = useRef(null);
  useEffect(() => {
    if (!enabled) {
      completed.current = null;
      return;
    }
    const request = {
      ...screeningWardRequest(JSON.parse(paramsKey), refresh),
      endpoint,
    };
    if (
      completed.current?.request.endpoint === endpoint &&
      matchesScreeningWardResponse(completed.current, request)
    )
      return;
    const controller = new AbortController();
    completed.current = null;
    setResponse(null);
    setFailure(null);
    ipdApi
      .get(endpoint, {
        params: JSON.parse(paramsKey),
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        const result = { request, data };
        completed.current = result;
        setResponse(result);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setFailure({
            request,
            message: apiMessage(error, 'โหลดข้อมูลไม่ได้ กรุณาลองใหม่'),
          });
      });
    return () => controller.abort();
  }, [paramsKey, refresh, enabled, endpoint]);
  const data =
    enabled &&
    response?.request.endpoint === endpoint &&
    matchesScreeningWardResponse(response, request)
      ? response.data
      : null;
  const error =
    enabled &&
    failure?.request.key === request.key &&
    failure.request.endpoint === endpoint &&
    failure.request.refresh === refresh
      ? failure.message
      : '';
  return { data, error, loading: enabled && !data && !error };
}
