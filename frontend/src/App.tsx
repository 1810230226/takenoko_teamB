import { UserProvider } from "./context/UserContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Top from "./pages/Top";
import Top2 from "./pages/Top2";
import Recipients from "./pages/Recipients";
import Amount from "./pages/Amount";
import Complete from "./pages/Complete";
import Request from "./pages/Request";
import Login from "./pages/Login";
import ChatScreen from "./pages/Messages";
import TransactionHistory from "./pages/TransactionHistory";
import LinkLogin from "./pages/LinkLogin";
import LinkSend from "./pages/LinkSend";
import Create_link from "./pages/Create_link";
import Link_login from "./pages/Link_login";
import Remit from "./pages/Remit";

import RequestRecipients from "./pages/RequestRecipients";
import RequestAmount from "./pages/RequestAmount";
import AmountLink from "./pages/AmountLink";
import MessageRecipients from "./pages/MessageRecipients";

function App() {
    return (

        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/request/recipients" element={<RequestRecipients />} />
                    <Route path="/request/amount" element={<RequestAmount />} />
                    <Route path="/top" element={<Top />} />
                    <Route path="/top2" element={<Top2 />} />
                    <Route path="/recipients" element={<Recipients />} />
                    <Route path="/amount" element={<Amount />} />
                    <Route path="/complete" element={<Complete />} />
                    <Route path="/request" element={<Request />} />
                    <Route path="/histories" element={<TransactionHistory />} />
                    <Route path="/messages" element={<ChatScreen />} />
                    <Route path="/" element={<Login />} />
                    <Route path="/link-login" element={<Link_login />} />
                    <Route path="/link-send" element={<LinkSend />} />
                    <Route path="/create-link" element={<Create_link />} />
                    <Route path="/messages/recipients" element={<MessageRecipients />} />
                    <Route path="/remit" element={<Remit />} />

                </Routes>
            </BrowserRouter>
        </UserProvider>

    );
}

export default App;
