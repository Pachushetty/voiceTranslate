import { render, screen, waitFor } from "@testing-library/react"; import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom"; import { vi } from "vitest";
import api from "./api"; import Landing from "./pages/Landing"; import { Login } from "./pages/Auth"; import LangPair from "./pages/Lang"; import { Forgot } from "./pages/Reset";
const wrap = ui => render(<MemoryRouter>{ui}</MemoryRouter>);
test("landing shows headline and calls to action", () => {
  wrap(<Landing/>);
  expect(screen.getByText(/Break Language Barriers/)).toBeInTheDocument();
  expect(screen.getByText("Get Started")).toBeInTheDocument();
});
test("login shows server error", async () => {
  vi.spyOn(api, "post").mockRejectedValue({ response: { data: { detail: "Invalid credentials" } } });
  wrap(<Login/>);
  const [id, pw] = document.querySelectorAll("input");
  await userEvent.type(id, "a"); await userEvent.type(pw, "b"); await userEvent.click(screen.getByRole("button", { name: "Log in" }));
  await waitFor(() => expect(screen.getByText("Invalid credentials")).toBeInTheDocument());
});
test("swap exchanges languages", async () => {
  const setSrc = vi.fn(), setTgt = vi.fn();
  wrap(<LangPair src="en" tgt="hi" setSrc={setSrc} setTgt={setTgt}/>);
  await userEvent.click(screen.getByText("Swap"));
  expect(setSrc).toHaveBeenCalledWith("hi"); expect(setTgt).toHaveBeenCalledWith("en");
});
test("forgot password shows confirmation", async () => {
  vi.spyOn(api, "post").mockResolvedValue({ data: { message: "If that email is registered, a reset link has been sent." } });
  wrap(<Forgot/>);
  await userEvent.type(document.querySelector("input"), "a@b.com"); await userEvent.click(screen.getByRole("button", { name: "Send reset link" }));
  await waitFor(() => expect(screen.getByText(/reset link has been sent/)).toBeInTheDocument());
});
