import { BrowserRouter, Routes, Route } from "react-router-dom";
import Top from "./pages/Top";
import Send from "./pages/Send";

    function App() {
        return (
        <BrowserRouter>
            <Routes>
                <Route path="/top" element={<Top />} />
                <Route path="/send" element={<Send />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;