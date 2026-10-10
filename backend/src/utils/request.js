export function clientIp(req) {
  return (req.ip || req.socket?.remoteAddress || '').slice(0, 45) || null;
}
