import { useState } from "react";
import {
    User,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    GraduationCap,
    ShieldCheck,
    Users,
    UserRound
} from "lucide-react";

import api from "../../services/api";

function Login() {

    const [selectedRole, setSelectedRole] = useState("FACULTY");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    // =========================================
    // ROLES
    // =========================================

    const roles = [
        {
            id: "FACULTY",
            title: "Faculty",
            fullTitle: "Faculty Member",
            icon: Users
        },
        {
            id: "STUDENT",
            title: "Student",
            fullTitle: "Student",
            icon: GraduationCap
        },
        {
            id: "MENTOR",
            title: "Mentor",
            fullTitle: "Class Mentor",
            icon: UserRound
        },
        {
            id: "ADMIN",
            title: "Admin",
            fullTitle: "Administrator",
            icon: ShieldCheck
        }
    ];


    const currentRole = roles.find(
        (role) => role.id === selectedRole
    );


    // =========================================
    // LOGIN
    // =========================================

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            /*
             * IMPORTANT:
             *
             * A Class Mentor is still a FACULTY
             * account in the database.
             *
             * Therefore:
             *
             * Mentor selected
             *       ↓
             * Send FACULTY to Django
             *
             * We separately store login_role as MENTOR
             * so the frontend knows which dashboard
             * to open.
             */

            const backendRole =
                selectedRole === "MENTOR"
                    ? "FACULTY"
                    : selectedRole;


            const response = await api.post(
                "/accounts/login/",
                {
                    username: username.trim(),
                    password: password,
                    role: backendRole
                }
            );


            console.log(
                "Login successful:",
                response.data
            );


            // =====================================
            // SAVE TOKENS
            // =====================================

            localStorage.setItem(
                "access_token",
                response.data.access
            );

            localStorage.setItem(
                "refresh_token",
                response.data.refresh
            );


            // =====================================
            // SAVE USER
            // =====================================

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );


            /*
             * Store the dashboard the user selected.
             *
             * Example:
             *
             * Faculty login  → FACULTY
             * Mentor login   → MENTOR
             * Student login  → STUDENT
             * Admin login    → ADMIN
             */

            localStorage.setItem(
                "login_role",
                selectedRole
            );


            // =====================================
            // OPEN DASHBOARD
            // =====================================

            window.location.reload();

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            if (error.response) {

                if (
                    error.response.status === 401
                ) {

                    setError(
                        "Invalid username or password."
                    );

                } else if (
                    error.response.data?.detail
                ) {

                    setError(
                        error.response.data.detail
                    );

                } else {

                    setError(
                        "Login failed. Please check your credentials."
                    );

                }

            } else {

                setError(
                    "Cannot connect to the server. Make sure Django is running."
                );

            }

        } finally {

            setLoading(false);

        }
    };


    // =========================================
    // RENDER
    // =========================================

    return (

        <div className="login-page">

            <div className="login-circle login-circle-one"></div>

            <div className="login-circle login-circle-two"></div>


            <div className="login-card">

                {/* =================================
                    LEFT SIDE
                ================================= */}

                <div className="login-left">

                    <div className="university-section">

                        <div className="logo-container">

                            <img
                                src="/mgu-logo.png"
                                alt="Mahatma Gandhi University Logo"
                                className="mgu-logo"
                                onError={(event) => {

                                    event.currentTarget.style.display =
                                        "none";

                                    if (
                                        event.currentTarget
                                            .nextElementSibling
                                    ) {

                                        event.currentTarget
                                            .nextElementSibling
                                            .style.display =
                                            "flex";

                                    }

                                }}
                            />

                            <div className="logo-fallback">

                                <GraduationCap size={48} />

                            </div>

                        </div>


                        <h1>
                            MAHATMA GANDHI
                        </h1>

                        <h1>
                            UNIVERSITY
                        </h1>


                        <div className="white-line"></div>


                        <p className="motto">
                            "Academic Excellence"
                        </p>

                    </div>


                    <div className="portal-information">

                        <div className="portal-icon">

                            <GraduationCap size={28} />

                        </div>


                        <h2>
                            Attendance Portal
                        </h2>


                        <p>
                            A centralized attendance
                            management system for
                            students, faculty members
                            and class mentors.
                        </p>

                    </div>


                    <div className="left-footer">

                        <span>
                            MGU
                        </span>

                        <span>
                            Smart Campus
                        </span>

                    </div>

                </div>


                {/* =================================
                    RIGHT SIDE
                ================================= */}

                <div className="login-right">

                    <div className="login-form">

                        <div className="mobile-logo">

                            <GraduationCap size={35} />

                        </div>


                        <h2>
                            Welcome Back
                        </h2>


                        <p className="login-subtitle">
                            Sign in to access your attendance portal
                        </p>


                        {/* =================================
                            ROLE SELECTOR
                        ================================= */}

                        <div className="role-selector-section">

                            <label>
                                Login As
                            </label>


                            <div className="role-toggle">

                                {roles.map((role) => {

                                    const Icon = role.icon;

                                    const isSelected =
                                        selectedRole === role.id;


                                    return (

                                        <button
                                            key={role.id}
                                            type="button"
                                            className={
                                                isSelected
                                                    ? "role-toggle-button role-toggle-active"
                                                    : "role-toggle-button"
                                            }
                                            onClick={() => {

                                                setSelectedRole(
                                                    role.id
                                                );

                                                setError("");

                                            }}
                                        >

                                            <Icon size={17} />

                                            <span>
                                                {role.title}
                                            </span>

                                        </button>

                                    );

                                })}

                            </div>

                        </div>


                        {/* SELECTED ROLE */}

                        <div className="selected-role-text">

                            <span>
                                Signing in as
                            </span>

                            <strong>
                                {currentRole?.fullTitle}
                            </strong>

                        </div>


                        {/* =================================
                            FORM
                        ================================= */}

                        <form onSubmit={handleLogin}>

                            {/* USERNAME */}

                            <div className="form-group">

                                <label htmlFor="username">
                                    Username
                                </label>


                                <div className="input-box">

                                    <User size={19} />

                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(event) =>
                                            setUsername(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="username"
                                        required
                                    />

                                </div>

                            </div>


                            {/* PASSWORD */}

                            <div className="form-group">

                                <label htmlFor="password">
                                    Password
                                </label>


                                <div className="input-box">

                                    <Lock size={19} />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="current-password"
                                        required
                                    />


                                    <button
                                        type="button"
                                        className="password-button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                    >

                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}

                                    </button>

                                </div>

                            </div>


                            {/* ERROR */}

                            {error && (

                                <div className="login-error">

                                    {error}

                                </div>

                            )}


                            {/* OPTIONS */}

                            <div className="login-options">

                                <label className="remember-option">

                                    <input
                                        type="checkbox"
                                    />

                                    <span>
                                        Remember me
                                    </span>

                                </label>


                                <button
                                    type="button"
                                    className="forgot-button"
                                    onClick={() =>
                                        setError(
                                            "Please contact the university administrator to reset your password."
                                        )
                                    }
                                >
                                    Forgot password?
                                </button>

                            </div>


                            {/* LOGIN */}

                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading}
                            >

                                <LogIn size={19} />

                                <span>

                                    {loading
                                        ? "Signing In..."
                                        : `Sign In as ${
                                            currentRole?.title ||
                                            "User"
                                        }`}

                                </span>

                            </button>

                        </form>


                        {/* NOTICE */}

                        <div className="login-notice">

                            <div className="notice-icon">
                                i
                            </div>

                            <p>
                                Use your university portal
                                credentials to sign in.
                            </p>

                        </div>


                        {/* FOOTER */}

                        <div className="login-footer">

                            <p>
                                © 2026 Mahatma Gandhi University
                            </p>

                            <p>
                                Attendance Management Portal
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;