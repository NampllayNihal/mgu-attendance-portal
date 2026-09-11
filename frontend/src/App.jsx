import Login from "./pages/auth/Login";
import RoleDashboard from "./pages/RoleDashboard";

function App() {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");

    if (token && user) {
        return <RoleDashboard />;
    }

    return <Login />;
}

export default App;