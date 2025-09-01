import { BrowserRouter, Routes, Route } from "react-router-dom";
import Top from "./pages/Top";
import Top2 from "./pages/Top2";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/top" element={<Top />} />
        <Route path="/top2" element={<Top2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;