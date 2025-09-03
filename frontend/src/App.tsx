import { UserProvider } from "./context/UserContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Top from "./pages/Top";
import Top2 from "./pages/Top2";
import Recipients from "./pages/Recipients";
import Amount from "./pages/Amount";
import Complete from "./pages/Complete";
import Request from "./pages/Request";
import Login from "./pages/Login";
import LinkLogin from "./pages/LinkLogin";
import LinkSend from "./pages/LinkSend";


function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/top" element={<Top />} />
                    <Route path="/top2" element={<Top2 />} />
                    <Route path="/recipients" element={<Recipients />} />
                    <Route path="/amount" element={<Amount />} />
                    <Route path="/complete" element={<Complete />} />
                    <Route path="/request" element={<Request />} />
                    <Route path="/" element={<Login />} />
                    <Route path="/link-login" element={<LinkLogin />} />
                    <Route path="/link-send" element={<LinkSend />} />

                </Routes>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;