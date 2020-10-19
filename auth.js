function timestamp_sec() {
  return Math.floor(new Date().getTime() / 1000);
}

function timestamp_nsec_later(n) {
  return timestamp_sec() + n
}

function timestamp_nday_later(n) {
  return timestamp_sec() + (n * 3600 * 24)
}
