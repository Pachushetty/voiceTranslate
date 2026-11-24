import axios from "axios";
export const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const api = axios.create({ baseURL: API, timeout: 180000 });
api.interceptors.request.use(c => { const t = localStorage.getItem("vt_token"); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401 && !e.config.url.startsWith("/auth/login")) { localStorage.removeItem("vt_token"); window.location.href = "/login"; }
  return Promise.reject(e);
});
export const err = e => e.response?.data?.detail?.toString?.() || (e.code === "ECONNABORTED" ? "Request timed out" : e.message === "Network Error" ? "Cannot reach server" : e.message);
export const LANGS = {en:"English",hi:"Hindi",kn:"Kannada",ta:"Tamil",te:"Telugu",ml:"Malayalam",mr:"Marathi",bn:"Bengali",gu:"Gujarati",pa:"Punjabi",ur:"Urdu",es:"Spanish",fr:"French",de:"German",ja:"Japanese","zh-CN":"Chinese",ar:"Arabic",ru:"Russian"};
export const audioSrc = u => API + u;
export async function downloadAudio(u) {
  const b = await (await fetch(audioSrc(u))).blob(); const a = document.createElement("a");
  a.href = URL.createObjectURL(b); a.download = "translation.mp3"; a.click(); URL.revokeObjectURL(a.href);
}
export default api;
