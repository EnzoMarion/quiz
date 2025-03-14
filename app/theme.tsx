// app/theme.tsx
import { ThemeProvider } from "some-library";

export default function Theme({ children }) {
    return <ThemeProvider>{children}</ThemeProvider>;
}