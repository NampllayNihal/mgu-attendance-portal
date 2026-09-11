import {
    LayoutDashboard,
    Users,
    UserCog,
    BookOpen,
    GraduationCap,
    ClipboardCheck,
    BarChart3,
    UserRoundCheck,
    Bell,
    LogOut,
    Menu,
    ChevronDown,
    School
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "../../services/api";
import AdminStudents from "./AdminStudents";

import AdminClasses from "./AdminClasses";
import AdminFaculty from "./AdminFaculty";
import AdminSubjects from "./AdminSubjects";
import AdminMentorAssignments from "./AdminMentorAssignments";

function AdminDashboard() {

    const [activeMenu, setActiveMenu] = useState("Dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [stats, setStats] = useState({
        total_students: 0,
        total_faculty: 0,
        total_classes: 0,
        total_subjects: 0
    });

    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState("");


    // =========================================================
    // LOGGED-IN USER
    // =========================================================

    let user = {};

    try {
        user = JSON.parse(
            localStorage.getItem("user") || "{}"
        );
    } catch (error) {
        console.error(
            "Invalid user information:",
            error
        );
    }


    // =========================================================
    // MENU ITEMS
    // =========================================================

    const menuItems = [
        {
            name: "Dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Students",
            icon: Users
        },
        {
            name: "Faculty",
            icon: UserCog
        },
        {
            name: "Classes",
            icon: School
        },
        {
            name: "Subjects",
            icon: BookOpen
        },
        {
            name: "Mentor Assignments",
            icon: UserRoundCheck
        },
        {
            name: "Attendance",
            icon: ClipboardCheck
        },
        {
            name: "Reports",
            icon: BarChart3
        }
    ];


    // =========================================================
    // LOAD ADMIN DASHBOARD STATISTICS
    // =========================================================

    useEffect(() => {

        const loadDashboardStats = async () => {

            try {

                setStatsLoading(true);
                setStatsError("");

                const token =
                    localStorage.getItem("access_token");


                if (!token) {

                    setStatsError(
                        "You are not logged in."
                    );

                    return;
                }


                const response = await api.get(
                    "/accounts/admin/dashboard-stats/",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                console.log(
                    "Dashboard statistics:",
                    response.data
                );


                setStats({
                    total_students:
                        response.data.total_students ?? 0,

                    total_faculty:
                        response.data.total_faculty ?? 0,

                    total_classes:
                        response.data.total_classes ?? 0,

                    total_subjects:
                        response.data.total_subjects ?? 0
                });


            } catch (error) {

                console.error(
                    "Dashboard stats error:",
                    error
                );


                if (
                    error.response?.status === 401
                ) {

                    setStatsError(
                        "Your session has expired. Please login again."
                    );

                } else if (
                    error.response?.status === 403
                ) {

                    setStatsError(
                        "You do not have permission to view the admin dashboard."
                    );

                } else {

                    setStatsError(
                        "Unable to load dashboard statistics."
                    );
                }

            } finally {

                setStatsLoading(false);

            }
        };


        loadDashboardStats();

    }, []);


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.reload();

    };


    // =========================================================
    // PROFILE NAME
    // =========================================================

    const displayName =
        user.first_name ||
        user.username ||
        "Administrator";


    const avatarLetter =
        displayName
            .charAt(0)
            .toUpperCase();


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="admin-dashboard">


            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside
                className={
                    sidebarOpen
                        ? "admin-sidebar"
                        : "admin-sidebar admin-sidebar-collapsed"
                }
            >


                {/* LOGO */}

                <div className="admin-sidebar-logo">

                    <div className="admin-logo-icon">

                        <GraduationCap
                            size={28}
                        />

                    </div>


                    {sidebarOpen && (

                        <div>

                            <h2>
                                MGU
                            </h2>

                            <span>
                                Attendance Portal
                            </span>

                        </div>

                    )}

                </div>


                {/* MENU TITLE */}

                <div className="admin-menu-title">

                    {sidebarOpen && (
                        "MAIN MENU"
                    )}

                </div>


                {/* NAVIGATION */}

                <nav className="admin-navigation">

                    {menuItems.map((item) => {

                        const Icon =
                            item.icon;

                        const active =
                            activeMenu === item.name;


                        return (

                            <button
                                key={item.name}
                                className={
                                    active
                                        ? "admin-nav-item admin-nav-active"
                                        : "admin-nav-item"
                                }
                                onClick={() =>
                                    setActiveMenu(
                                        item.name
                                    )
                                }
                                title={item.name}
                            >

                                <Icon size={20} />

                                {sidebarOpen && (

                                    <span>
                                        {item.name}
                                    </span>

                                )}

                            </button>

                        );

                    })}

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="admin-sidebar-bottom">

                    <button
                        className="admin-nav-item admin-logout"
                        onClick={handleLogout}
                        title="Logout"
                    >

                        <LogOut size={20} />

                        {sidebarOpen && (

                            <span>
                                Logout
                            </span>

                        )}

                    </button>

                </div>

            </aside>


            {/* =====================================================
                MAIN AREA
            ===================================================== */}

            <main className="admin-main">


                {/* =====================================================
                    HEADER
                ===================================================== */}

                <header className="admin-header">


                    <div className="admin-header-left">

                        <button
                            className="admin-menu-button"
                            onClick={() =>
                                setSidebarOpen(
                                    !sidebarOpen
                                )
                            }
                            aria-label="Toggle sidebar"
                        >

                            <Menu size={22} />

                        </button>


                        <div>

                          <h1>
    {activeMenu === "Students"
        ? "Manage Students"
        : activeMenu === "Faculty"
            ? "Manage Faculty"
            : activeMenu === "Classes"
                ? "Manage Classes"
                : activeMenu === "Subjects"
                    ? "Manage Subjects"
                    : activeMenu === "Mentor Assignments"
                        ? "Mentor Assignments"
                        : "Admin Dashboard"}
                        
</h1>

<p>
    {activeMenu === "Students"
        ? "Manage student accounts and records"
        : activeMenu === "Faculty"
            ? "Manage faculty accounts and information"
            : activeMenu === "Classes"
                ? "Manage departments, programs and academic structure"
                : activeMenu === "Subjects"
                    ? "Manage subjects and faculty assignments"
                    : activeMenu === "Mentor Assignments"
                        ? "Assign faculty members to classes as mentors"
                        : "Manage the MGU Attendance Portal"}
</p>

                        </div>

                    </div>


                    <div className="admin-header-right">


                        {/* NOTIFICATION */}

                        <button
                            className="admin-notification"
                            type="button"
                            aria-label="Notifications"
                        >

                            <Bell size={21} />

                            <span></span>

                        </button>


                        {/* PROFILE */}

                        <div className="admin-profile">

                            <div className="admin-avatar">

                                {avatarLetter}

                            </div>


                            <div className="admin-profile-info">

                                <strong>
                                    {displayName}
                                </strong>

                                <span>
                                    Administrator
                                </span>

                            </div>


                            <ChevronDown
                                size={18}
                            />

                        </div>

                    </div>

                </header>


                {/* =====================================================
                    CONTENT
                ===================================================== */}

                <section className="admin-content">


                    {/* =================================================
                        STUDENTS PAGE
                    ================================================= */}

                {activeMenu === "Students" ? (

    <AdminStudents />

) : activeMenu === "Faculty" ? (

    <AdminFaculty />

) : activeMenu === "Classes" ? (

    <AdminClasses />

) : activeMenu === "Subjects" ? (

    <AdminSubjects />
    ) : activeMenu === "Mentor Assignments" ? (
    <AdminMentorAssignments />

) : (

                        /* =================================================
                           DASHBOARD CONTENT
                        ================================================= */

                        <>

                            {/* =================================================
                                WELCOME
                            ================================================= */}

                            <div className="admin-welcome">

                                <div>

                                    <h2>
                                        Welcome back,{" "}
                                        {displayName}!
                                    </h2>

                                    <p>
                                        Here's what's happening
                                        with your attendance portal today.
                                    </p>

                                </div>


                                <div className="admin-welcome-icon">

                                    <GraduationCap
                                        size={42}
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                ERROR
                            ================================================= */}

                            {statsError && (

                                <div className="admin-dashboard-error">

                                    {statsError}

                                </div>

                            )}


                            {/* =================================================
                                STATISTICS
                            ================================================= */}

                            <div className="admin-stat-grid">


                                {/* STUDENTS */}

                                <div className="admin-stat-card">

                                    <div className="admin-stat-icon admin-stat-blue">

                                        <Users size={25} />

                                    </div>


                                    <div>

                                        <span>
                                            Total Students
                                        </span>


                                        <strong>

                                            {statsLoading
                                                ? "..."
                                                : stats.total_students}

                                        </strong>


                                        <small>
                                            Registered students
                                        </small>

                                    </div>

                                </div>


                                {/* FACULTY */}

                                <div className="admin-stat-card">

                                    <div className="admin-stat-icon admin-stat-green">

                                        <UserCog size={25} />

                                    </div>


                                    <div>

                                        <span>
                                            Total Faculty
                                        </span>


                                        <strong>

                                            {statsLoading
                                                ? "..."
                                                : stats.total_faculty}

                                        </strong>


                                        <small>
                                            Faculty members
                                        </small>

                                    </div>

                                </div>


                                {/* CLASSES */}

                                <div className="admin-stat-card">

                                    <div className="admin-stat-icon admin-stat-orange">

                                        <School size={25} />

                                    </div>


                                    <div>

                                        <span>
                                            Total Classes
                                        </span>


                                        <strong>

                                            {statsLoading
                                                ? "..."
                                                : stats.total_classes}

                                        </strong>


                                        <small>
                                            Active classes
                                        </small>

                                    </div>

                                </div>


                                {/* SUBJECTS */}

                                <div className="admin-stat-card">

                                    <div className="admin-stat-icon admin-stat-purple">

                                        <BookOpen size={25} />

                                    </div>


                                    <div>

                                        <span>
                                            Total Subjects
                                        </span>


                                        <strong>

                                            {statsLoading
                                                ? "..."
                                                : stats.total_subjects}

                                        </strong>


                                        <small>
                                            Available subjects
                                        </small>

                                    </div>

                                </div>


                            </div>


                            {/* =================================================
                                MANAGEMENT
                            ================================================= */}

                            <div className="admin-section-header">

                                <div>

                                    <h2>
                                        Management
                                    </h2>

                                    <p>
                                        Manage users and academic information
                                    </p>

                                </div>

                            </div>


                            <div className="admin-management-grid">


                                {/* STUDENTS */}

                                <button
                                    className="admin-management-card"
                                    onClick={() =>
                                        setActiveMenu(
                                            "Students"
                                        )
                                    }
                                >

                                    <div className="management-icon management-blue">

                                        <Users size={25} />

                                    </div>


                                    <div>

                                        <h3>
                                            Manage Students
                                        </h3>

                                        <p>
                                            Add, edit and manage student records
                                        </p>

                                    </div>


                                    <span className="management-arrow">
                                        →
                                    </span>

                                </button>


                                {/* FACULTY */}

                                <button
                                    className="admin-management-card"
                                    onClick={() =>
                                        setActiveMenu(
                                            "Faculty"
                                        )
                                    }
                                >

                                    <div className="management-icon management-green">

                                        <UserCog size={25} />

                                    </div>


                                    <div>

                                        <h3>
                                            Manage Faculty
                                        </h3>

                                        <p>
                                            Manage faculty accounts and assignments
                                        </p>

                                    </div>


                                    <span className="management-arrow">
                                        →
                                    </span>

                                </button>


                                {/* CLASSES */}

                                <button
                                    className="admin-management-card"
                                    onClick={() =>
                                        setActiveMenu(
                                            "Classes"
                                        )
                                    }
                                >

                                    <div className="management-icon management-orange">

                                        <School size={25} />

                                    </div>


                                    <div>

                                        <h3>
                                            Manage Classes
                                        </h3>

                                        <p>
                                            Create and manage classes and sections
                                        </p>

                                    </div>


                                    <span className="management-arrow">
                                        →
                                    </span>

                                </button>


                                {/* SUBJECTS */}

                                <button
                                    className="admin-management-card"
                                    onClick={() =>
                                        setActiveMenu(
                                            "Subjects"
                                        )
                                    }
                                >

                                    <div className="management-icon management-purple">

                                        <BookOpen size={25} />

                                    </div>


                                    <div>

                                        <h3>
                                            Manage Subjects
                                        </h3>

                                        <p>
                                            Add subjects and assign them to classes
                                        </p>

                                    </div>


                                    <span className="management-arrow">
                                        →
                                    </span>

                                </button>


                                {/* MENTOR ASSIGNMENTS */}

                                <button
                                    className="admin-management-card"
                                    onClick={() =>
                                        setActiveMenu(
                                            "Mentor Assignments"
                                        )
                                    }
                                >

                                    <div className="management-icon management-blue">

                                        <UserRoundCheck
                                            size={25}
                                        />

                                    </div>


                                    <div>

                                        <h3>
                                            Mentor Assignments
                                        </h3>

                                        <p>
                                            Assign class mentors to sections
                                        </p>

                                    </div>


                                    <span className="management-arrow">
                                        →
                                    </span>

                                </button>


                                {/* REPORTS */}

                                <button
                                    className="admin-management-card"
                                    onClick={() =>
                                        setActiveMenu(
                                            "Reports"
                                        )
                                    }
                                >

                                    <div className="management-icon management-red">

                                        <BarChart3 size={25} />

                                    </div>


                                    <div>

                                        <h3>
                                            Attendance Reports
                                        </h3>

                                        <p>
                                            View and generate attendance reports
                                        </p>

                                    </div>


                                    <span className="management-arrow">
                                        →
                                    </span>

                                </button>


                            </div>


                            {/* =================================================
                                RECENT ACTIVITY
                            ================================================= */}

                            <div className="admin-section-header admin-activity-heading">

                                <div>

                                    <h2>
                                        Recent Activity
                                    </h2>

                                    <p>
                                        Latest activity in the portal
                                    </p>

                                </div>

                            </div>


                            <div className="admin-empty-activity">

                                <ClipboardCheck
                                    size={32}
                                />


                                <h3>
                                    No recent activity
                                </h3>


                                <p>
                                    Attendance and system activities
                                    will appear here.
                                </p>

                            </div>

                        </>

                    )}

                </section>

            </main>

        </div>

    );

}


export default AdminDashboard;