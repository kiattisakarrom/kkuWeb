function key(params, omitRound = false) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(params)
        .filter(
          ([name, value]) =>
            value !== undefined && (!omitRound || name !== 'workdate')
        )
        .sort(([a], [b]) => a.localeCompare(b))
    )
  );
}

export function screeningWardRequest(params, refresh) {
  return {
    key: key(params),
    filtersKey: key(params, true),
    workdate: params.workdate,
    refresh,
  };
}

export function matchesScreeningWardResponse(response, request) {
  if (!response || response.request.refresh !== request.refresh) return false;
  if (response.request.key === request.key) return true;
  // Pinning the exact round already returned by the server is navigation,
  // not a new ward query. Never reuse another explicit round or other filters.
  return (
    response.request.filtersKey === request.filtersKey &&
    request.workdate !== undefined &&
    request.workdate === response.data?.window?.workdate
  );
}
