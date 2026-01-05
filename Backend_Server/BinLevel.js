function classifyBin(readings) {
  if (noDataForHours(readings, 6)) {
    return state('OFFLINE', 'LOW', 'No recent data');
  }

  const last = readings.at(-1);
  const prev = readings.at(-2);

  if (suddenJump(prev, last) && inconsistentWeight(readings)) {
    return state('BLOCKED', 'LOW', 'Possible obstruction');
  }

  if (stableHighFill(readings)) {
    return state('FULL', 'HIGH', 'Confirmed high fill');
  }

  if (suspicious(readings)) {
    return state('LOW_CONFIDENCE', 'LOW', 'Unstable readings');
  }

  return state('NORMAL', 'HIGH', 'Stable operation');
}
