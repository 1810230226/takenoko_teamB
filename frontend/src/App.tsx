import { UserProvider } from "./context/UserContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Top from "./pages/Top";
import Top2 from "./pages/Top2";
import Recipients from "./pages/Recipients";
import Amount from "./pages/Amount";
import Complete from "./pages/Complete";
import Request from "./pages/Request";
import Create_link from "./pages/Create_link";
import Link_login from "./pages/Link_login";
import Remit from "./pages/Remit";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/top" element={<Top />} />
                <Route path="/top2" element={<Top2 />} />
                <Route path="/recipients" element={<Recipients />} />
                <Route path="/amount" element={<Amount />} />
                <Route path="/complete" element={<Complete />} />
                <Route path="/request" element={<Request />} />
                <Route path="/create-link" element={<Create_link />} />
                <Route path="/link-login" element={<Link_login />} />
                <Route path="/remit" element={<Remit />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
