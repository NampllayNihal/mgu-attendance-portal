import { useEffect, useState } from "react";
import api from "../../services/api";

function MentorDashboard() {
    // =========================================
    // PROFILE
    // =========================================

    const [profile, setProfile] = useState(null);
    const [showProfile, setShowProfile] = useState(false);

    // =========================================
    // MENTOR ASSIGNMENT
    // =========================================

    const [mentorAssignment, setMentorAssignment] = useState(null);

    // =========================================
    // ABSENCES
    // =========================================

    const [absences, setAbsences] = useState([]);

    // =========================================
    // UI STATES
    // =========================================

    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [search, setSearch] = useState("");

    const [reasons, setReasons] = useState({});

    // =========================================
    // LOGOUT
    // =========================================

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        window.location.href = "/";
    };

    // =========================================
    // LOAD PROFILE
    // =========================================

    const loadProfile = async () => {
        try {
            const response = await api.get(
                "/accounts/faculty/profile/"
            );

            setProfile(response.data);
        } catch (error) {
            console.error("Profile error:", error);

            if (error.response?.status === 401) {
                logout();
            }
        }
    };

    // =========================================
    // LOAD ASSIGNED CLASS
    // =========================================

    const loadMentorAssignment = async () => {
        try {
            const response = await api.get(
                "/mentoring/my-assignment/"
            );

            setMentorAssignment(response.data);
        } catch (error) {
            console.error(
                "Mentor assignment error:",
                error
            );

            if (error.response?.status === 401) {
                logout();
                return;
            }

            if (error.response?.status === 404) {
                setMentorAssignment(null);
            }
        }
    };

    // =========================================
    // LOAD ABSENCES
    // =========================================

    const loadAbsences = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/mentoring/absences/"
            );

            setAbsences(response.data);

            const existingReasons = {};

            response.data.forEach((item) => {
                existingReasons[item.id] =
                    item.absence_reason || "";
            });

            setReasons(existingReasons);
        } catch (error) {
            console.error(
                "Absence loading error:",
                error
            );

            if (error.response?.status === 401) {
                logout();
                return;
            }

            alert(
                error.response?.data?.detail ||
                "Failed to load absent students."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // LOAD EVERYTHING
    // =========================================

    const loadData = async () => {
        setLoading(true);

        await Promise.all([
            loadProfile(),
            loadMentorAssignment(),
            loadAbsences(),
        ]);

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // =========================================
    // UPDATE REASON
    // =========================================

    const updateReason = (id, value) => {
        setReasons((current) => ({
            ...current,
            [id]: value,
        }));
    };

    // =========================================
    // SAVE REASON
    // =========================================

    const saveReason = async (attendanceId) => {
        const reason =
            reasons[attendanceId]?.trim();

        if (!reason) {
            alert(
                "Please enter an absence reason."
            );
            return;
        }

        try {
            setSavingId(attendanceId);

            await api.patch(
                `/mentoring/absences/${attendanceId}/reason/`,
                {
                    absence_reason: reason,
                }
            );

            setAbsences((current) =>
                current.map((item) =>
                    item.id === attendanceId
                        ? {
                              ...item,
                              absence_reason: reason,
                          }
                        : item
                )
            );

            alert(
                "Absence reason updated successfully."
            );
        } catch (error) {
            console.error(
                "Save reason error:",
                error
            );

            if (error.response?.status === 401) {
                logout();
                return;
            }

            alert(
                error.response?.data?.detail ||
                JSON.stringify(
                    error.response?.data ||
                    error.message
                )
            );
        } finally {
            setSavingId(null);
        }
    };

    // =========================================
    // SEARCH
    // =========================================

    const filteredAbsences = absences.filter(
        (item) => {
            const text = `
                ${item.roll_number || ""}
                ${item.student_name || ""}
                ${item.subject_code || ""}
                ${item.subject_name || ""}
                ${item.attendance_date || ""}
            `.toLowerCase();

            return text.includes(
                search.toLowerCase()
            );
        }
    );

    // =========================================
    // STATISTICS
    // =========================================

    const totalAbsences = absences.length;

    const reasonsAdded = absences.filter(
        (item) =>
            item.absence_reason &&
            item.absence_reason.trim()
    ).length;

    const reasonsPending =
        totalAbsences - reasonsAdded;

    // =========================================
    // RENDER
    // =========================================

    return (
        <div className="mentor-page">

            {/* =====================================
                TOP BAR
            ===================================== */}

            <div className="mentor-topbar">

                <div className="mentor-profile-area">

                    <button
                        type="button"
                        className="mentor-profile-btn"
                        onClick={() =>
                            setShowProfile(
                                !showProfile
                            )
                        }
                    >

                        <div className="mentor-avatar">
                            {profile?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "M"}
                        </div>

                        <div className="mentor-profile-name">

                            <strong>
                                {profile?.name ||
                                    "Mentor"}
                            </strong>

                            <span>
                                {profile?.faculty_id ||
                                    "Class Mentor"}
                            </span>

                        </div>

                        <span className="mentor-profile-arrow">
                            {showProfile
                                ? "▲"
                                : "▼"}
                        </span>

                    </button>

                    {/* PROFILE CARD */}

                    {showProfile && (

                        <div className="mentor-profile-card">

                            <div className="mentor-profile-header">

                                <div className="mentor-large-avatar">
                                    {profile?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "M"}
                                </div>

                                <div>

                                    <h3>
                                        {profile?.name ||
                                            "Class Mentor"}
                                    </h3>

                                    <p>
                                        {profile?.designation ||
                                            "Class Mentor"}
                                    </p>

                                </div>

                            </div>

                            <div className="mentor-profile-details">

                                <div>
                                    <span>
                                        Faculty ID
                                    </span>

                                    <strong>
                                        {profile?.faculty_id ||
                                            "Not available"}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {profile?.email ||
                                            "Not available"}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Department
                                    </span>

                                    <strong>
                                        {profile?.department ||
                                            "Not assigned"}
                                    </strong>
                                </div>

                            </div>

                            <button
                                type="button"
                                className="mentor-logout-btn"
                                onClick={logout}
                            >
                                🚪 Logout
                            </button>

                        </div>

                    )}

                </div>

            </div>

            {/* =====================================
                MAIN LAYOUT
            ===================================== */}

            <div className="mentor-layout">

                {/* =================================
                    SIDEBAR
                ================================= */}

                <aside className="mentor-sidebar">

                    <div className="mentor-sidebar-title">
                        Mentor Portal
                    </div>

                    <button
                        type="button"
                        className="mentor-nav-btn active"
                    >
                        📊 Dashboard
                    </button>

                    <button
                        type="button"
                        className="mentor-nav-btn"
                        onClick={loadData}
                    >
                        🔄 Refresh
                    </button>

                    <button
                        type="button"
                        className="mentor-nav-btn mentor-sidebar-logout"
                        onClick={logout}
                    >
                        🚪 Logout
                    </button>

                </aside>

                {/* =================================
                    MAIN CONTENT
                ================================= */}

                <main className="mentor-main-content">

                    {/* HEADER */}

                    <div className="mentor-dashboard-header">

                        <h1>
                            Mentor Dashboard
                        </h1>

                        <p>
                            Manage absence reasons for
                            your assigned class
                        </p>

                    </div>

                    {/* =================================
                        ASSIGNED CLASS
                    ================================= */}

                    <div className="mentor-class-card">

                        <div>

                            <span>
                                My Assigned Class
                            </span>

                            {mentorAssignment ? (

                                <h2>
                                    {
                                        mentorAssignment.program_code
                                    }

                                    {" - Section "}

                                    {
                                        mentorAssignment.section_name
                                    }
                                </h2>

                            ) : (

                                <h2>
                                    No Class Assigned
                                </h2>

                            )}

                        </div>

                        {mentorAssignment && (

                            <div className="mentor-class-details">

                                <span>
                                    {
                                        mentorAssignment.program_name
                                    }
                                </span>

                                <span>
                                    {
                                        mentorAssignment.semester
                                    }
                                </span>

                                <span>
                                    {
                                        mentorAssignment.academic_year
                                    }
                                </span>

                            </div>

                        )}

                    </div>

                    {/* =================================
                        STAT CARDS
                    ================================= */}

                    <div className="mentor-stat-grid">

                        <div className="mentor-stat-card">

                            <span>
                                Total Absences
                            </span>

                            <strong>
                                {totalAbsences}
                            </strong>

                        </div>

                        <div className="mentor-stat-card">

                            <span>
                                Reason Added
                            </span>

                            <strong>
                                {reasonsAdded}
                            </strong>

                        </div>

                        <div className="mentor-stat-card">

                            <span>
                                Reason Pending
                            </span>

                            <strong>
                                {reasonsPending}
                            </strong>

                        </div>

                    </div>

                    {/* =================================
                        ABSENCE TABLE
                    ================================= */}

                    <div className="mentor-table-card">

                        <div className="mentor-table-header">

                            <div>

                                <h2>
                                    Absent Students
                                </h2>

                                <p>
                                    Add or update the reason
                                    for student absences
                                </p>

                            </div>

                            <input
                                type="text"
                                className="mentor-search"
                                placeholder="Search student, subject..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* LOADING */}

                        {loading ? (

                            <div className="mentor-loading">
                                Loading absent students...
                            </div>

                        ) : filteredAbsences.length === 0 ? (

                            <div className="mentor-empty">

                                <div className="mentor-empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    No Absent Students
                                </h3>

                                <p>
                                    There are currently no
                                    absent attendance records
                                    for your assigned class.
                                </p>

                            </div>

                        ) : (

                            <div className="mentor-table-wrapper">

                                <table className="mentor-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Period
                                            </th>

                                            <th>
                                                Roll No.
                                            </th>

                                            <th>
                                                Student
                                            </th>

                                            <th>
                                                Subject
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Absence Reason
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredAbsences.map(
                                            (item) => (

                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            item.attendance_date
                                                        }
                                                    </td>

                                                    <td>
                                                        Period{" "}
                                                        {
                                                            item.period
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                item.roll_number
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            item.student_name
                                                        }
                                                    </td>

                                                    <td>

                                                        <strong>
                                                            {
                                                                item.subject_code
                                                            }
                                                        </strong>

                                                        <span className="mentor-subject-name">
                                                            {
                                                                item.subject_name
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <span className="mentor-absent-badge">
                                                            Absent
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <input
                                                            type="text"
                                                            className="mentor-reason-input"
                                                            placeholder="Enter absence reason"
                                                            value={
                                                                reasons[
                                                                    item.id
                                                                ] || ""
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateReason(
                                                                    item.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                    </td>

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="mentor-save-btn"
                                                            onClick={() =>
                                                                saveReason(
                                                                    item.id
                                                                )
                                                            }
                                                            disabled={
                                                                savingId ===
                                                                item.id
                                                            }
                                                        >
                                                            {savingId ===
                                                            item.id
                                                                ? "Saving..."
                                                                : "Save"}
                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </main>

            </div>

        </div>
    );
}

export default MentorDashboard;