import { useEffect, useState } from "react";
import api from "../../services/api";
import FacultyAttendanceHistory from "./FacultyAttendanceHistory";

function FacultyDashboard() {
    const [activePage, setActivePage] = useState("Dashboard");

    // =========================
    // PROFILE
    // =========================

    const [profile, setProfile] = useState(null);
    const [showProfile, setShowProfile] = useState(false);

    // =========================
    // FACULTY ASSIGNMENTS
    // =========================

    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState("");

    // =========================
    // ATTENDANCE
    // =========================

    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [period, setPeriod] = useState("1");
    const [students, setStudents] = useState([]);

    // =========================
    // UI STATES
    // =========================

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");

    // =========================
    // LOGOUT
    // =========================

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.removeItem("login_role");
        window.location.href = "/";
    };

    // =========================
    // LOAD PROFILE
    // =========================

    const loadProfile = async () => {
        try {
            setLoadingProfile(true);

            const response = await api.get(
                "/accounts/faculty/profile/"
            );

            setProfile(response.data);

        } catch (error) {
            console.error("Profile error:", error);

            if (error.response?.status === 401) {
                logout();
                return;
            }

            alert(
                error.response?.data?.detail ||
                "Failed to load faculty profile."
            );

        } finally {
            setLoadingProfile(false);
        }
    };

    // =========================
    // LOAD ASSIGNMENTS
    // =========================

    const loadAssignments = async () => {
        try {
            setLoadingAssignments(true);

            const response = await api.get(
                "/attendance/faculty/assignments/"
            );

            setAssignments(response.data);

            if (response.data.length > 0) {
                setSelectedAssignment(
                    String(response.data[0].id)
                );
            } else {
                setSelectedAssignment("");
            }

        } catch (error) {
            console.error("Assignments error:", error);

            if (error.response?.status === 401) {
                logout();
                return;
            }

            alert(
                error.response?.data?.detail ||
                "Failed to load assigned subjects."
            );

        } finally {
            setLoadingAssignments(false);
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {
        loadProfile();
        loadAssignments();
    }, []);

    // =========================
    // LOAD STUDENTS
    // =========================

    const loadStudents = async () => {

        if (!selectedAssignment) {
            setStudents([]);
            return;
        }

        try {
            setLoadingStudents(true);

            const response = await api.get(
                "/attendance/faculty/students/",
                {
                    params: {
                        assignment_id: selectedAssignment,
                        date: date,
                        period: period,
                    },
                }
            );

            setStudents(response.data);

        } catch (error) {
            console.error("Students error:", error);

            if (error.response?.status === 401) {
                logout();
                return;
            }

            alert(
                error.response?.data?.detail ||
                "Failed to load students."
            );

            setStudents([]);

        } finally {
            setLoadingStudents(false);
        }
    };

    useEffect(() => {
        if (activePage === "Dashboard") {
            loadStudents();
        }
    }, [selectedAssignment, date, period, activePage]);

    // =========================
    // UPDATE STATUS
    // =========================

    const updateStatus = (studentId, status) => {

        setStudents((currentStudents) =>
            currentStudents.map((student) => {

                if (student.student_id !== studentId) {
                    return student;
                }

                return {
                    ...student,
                    status: status,
                    absence_reason:
                        status === "ABSENT"
                            ? student.absence_reason || ""
                            : "",
                };
            })
        );
    };

    // =========================
    // UPDATE REASON
    // =========================

    const updateReason = (studentId, reason) => {

        setStudents((currentStudents) =>
            currentStudents.map((student) => {

                if (student.student_id !== studentId) {
                    return student;
                }

                return {
                    ...student,
                    absence_reason: reason,
                };
            })
        );
    };

    // =========================
    // SAVE ATTENDANCE
    // =========================

    const saveAttendance = async () => {

        if (!selectedAssignment) {
            alert("Please select a subject/class.");
            return;
        }

        if (students.length === 0) {
            alert("No students available.");
            return;
        }

        const absentWithoutReason = students.filter(
            (student) =>
                student.status === "ABSENT" &&
                !student.absence_reason?.trim()
        );

        if (absentWithoutReason.length > 0) {

            const names = absentWithoutReason
                .slice(0, 5)
                .map(
                    (student) =>
                        `${student.roll_number} - ${student.student_name}`
                )
                .join("\n");

            alert(
                "Please enter absence reason for:\n\n" +
                names +
                (
                    absentWithoutReason.length > 5
                        ? "\n..."
                        : ""
                )
            );

            return;
        }

        try {
            setSaving(true);

            await api.post(
                "/attendance/faculty/mark/",
                {
                    teaching_assignment_id:
                        Number(selectedAssignment),

                    date: date,

                    period: Number(period),

                    students: students.map((student) => ({
                        student_id: student.student_id,
                        status: student.status,
                        absence_reason:
                            student.status === "ABSENT"
                                ? student.absence_reason?.trim() || null
                                : null,
                    })),
                }
            );

            alert(
                "Attendance saved successfully."
            );

            await loadStudents();

        } catch (error) {
            console.error(
                "Save attendance error:",
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
            setSaving(false);
        }
    };

    // =========================
    // SEARCH
    // =========================

    const filteredStudents = students.filter(
        (student) => {

            const text =
                `${student.roll_number} ${student.student_name}`
                    .toLowerCase();

            return text.includes(
                search.toLowerCase()
            );
        }
    );

    // =========================
    // COUNTS
    // =========================

    const totalCount = students.length;

    const presentCount = students.filter(
        (student) =>
            student.status === "PRESENT"
    ).length;

    const absentCount = students.filter(
        (student) =>
            student.status === "ABSENT"
    ).length;

    const lateCount = students.filter(
        (student) =>
            student.status === "LATE"
    ).length;

    // =========================
    // SELECTED ASSIGNMENT
    // =========================

    const selectedInfo = assignments.find(
        (assignment) =>
            String(assignment.id) ===
            String(selectedAssignment)
    );

    // =========================
    // RENDER
    // =========================

    return (
        <div className="faculty-dashboard">

            {/* =========================
                TOP BAR
                ========================= */}

            <div className="faculty-topbar">

                <div className="faculty-profile-area">

                    <button
                        type="button"
                        className="faculty-profile-btn"
                        onClick={() =>
                            setShowProfile(!showProfile)
                        }
                    >

                        <div className="faculty-avatar">

                            {profile?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "F"}

                        </div>

                        <div className="faculty-profile-name">

                            <strong>
                                {loadingProfile
                                    ? "Faculty"
                                    : profile?.name ||
                                      "Faculty"}
                            </strong>

                            <span>
                                {profile?.faculty_id ||
                                    "Faculty"}
                            </span>

                        </div>

                        <span className="profile-arrow">
                            {showProfile
                                ? "▲"
                                : "▼"}
                        </span>

                    </button>


                    {/* PROFILE */}

                    {showProfile && (

                        <div className="faculty-profile-card">

                            {profile ? (

                                <>

                                    <div className="profile-card-header">

                                        <div className="large-faculty-avatar">

                                            {profile.name
                                                ?.charAt(0)
                                                ?.toUpperCase() ||
                                                "F"}

                                        </div>

                                        <div>

                                            <h3>
                                                {profile.name}
                                            </h3>

                                            <p>
                                                {profile.designation ||
                                                    "Faculty"}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="profile-details">

                                        <div>
                                            <span>
                                                Faculty ID
                                            </span>

                                            <strong>
                                                {profile.faculty_id ||
                                                    "Not available"}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Email
                                            </span>

                                            <strong>
                                                {profile.email ||
                                                    "Not available"}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Department
                                            </span>

                                            <strong>
                                                {profile.department ||
                                                    "Not assigned"}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Designation
                                            </span>

                                            <strong>
                                                {profile.designation ||
                                                    "Not specified"}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Phone
                                            </span>

                                            <strong>
                                                {profile.phone_number ||
                                                    "Not provided"}
                                            </strong>
                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        className="faculty-logout-btn"
                                        onClick={logout}
                                    >
                                        🚪 Logout
                                    </button>

                                </>

                            ) : (

                                <div className="loading-text">
                                    Loading profile...
                                </div>

                            )}

                        </div>

                    )}

                </div>

            </div>


            {/* =========================
                SIDEBAR / NAVIGATION
                ========================= */}

            <div className="faculty-layout">

                <aside className="faculty-sidebar">

                    <div className="faculty-sidebar-title">
                        Faculty Portal
                    </div>

                    <button
                        type="button"
                        className={
                            activePage === "Dashboard"
                                ? "faculty-nav-btn active"
                                : "faculty-nav-btn"
                        }
                        onClick={() =>
                            setActivePage("Dashboard")
                        }
                    >
                        📊 Dashboard
                    </button>

                    <button
                        type="button"
                        className={
                            activePage === "Attendance History"
                                ? "faculty-nav-btn active"
                                : "faculty-nav-btn"
                        }
                        onClick={() =>
                            setActivePage(
                                "Attendance History"
                            )
                        }
                    >
                        📋 Attendance History
                    </button>

                    <button
                        type="button"
                        className="faculty-nav-btn"
                        onClick={() =>
                            alert(
                                "My Classes will be available next."
                            )
                        }
                    >
                        🏫 My Classes
                    </button>

                    <button
                        type="button"
                        className="faculty-nav-btn"
                        onClick={() =>
                            alert(
                                "Reports will be available next."
                            )
                        }
                    >
                        📈 Reports
                    </button>

                    <button
                        type="button"
                        className="faculty-nav-btn faculty-sidebar-logout"
                        onClick={logout}
                    >
                        🚪 Logout
                    </button>

                </aside>


                {/* =========================
                    MAIN CONTENT
                    ========================= */}

                <main className="faculty-main-content">

                    {activePage === "Attendance History" ? (

                        <FacultyAttendanceHistory />

                    ) : (

                        <>

                            {/* HEADER */}

                            <div className="dashboard-header">

                                <div>

                                    <h1>
                                        Faculty Dashboard
                                    </h1>

                                    <p>
                                        Mark and manage student
                                        attendance
                                    </p>

                                </div>

                            </div>


                            {/* STAT CARDS */}

                            <div className="faculty-stat-grid">

                                <div className="faculty-stat-card">

                                    <span>
                                        Total Students
                                    </span>

                                    <strong>
                                        {totalCount}
                                    </strong>

                                </div>


                                <div className="faculty-stat-card">

                                    <span>
                                        Present
                                    </span>

                                    <strong>
                                        {presentCount}
                                    </strong>

                                </div>


                                <div className="faculty-stat-card">

                                    <span>
                                        Absent
                                    </span>

                                    <strong>
                                        {absentCount}
                                    </strong>

                                </div>


                                <div className="faculty-stat-card">

                                    <span>
                                        Late
                                    </span>

                                    <strong>
                                        {lateCount}
                                    </strong>

                                </div>

                            </div>


                            {/* CONTROLS */}

                            <div className="attendance-control-card">

                                <div className="attendance-control-grid">

                                    <div>

                                        <label>
                                            Subject / Class
                                        </label>

                                        <select
                                            value={
                                                selectedAssignment
                                            }
                                            onChange={(e) =>
                                                setSelectedAssignment(
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                loadingAssignments
                                            }
                                        >

                                            <option value="">

                                                {loadingAssignments
                                                    ? "Loading subjects..."
                                                    : assignments.length === 0
                                                        ? "No assigned subjects"
                                                        : "Select Subject"}

                                            </option>


                                            {assignments.map(
                                                (assignment) => (

                                                    <option
                                                        key={
                                                            assignment.id
                                                        }
                                                        value={
                                                            assignment.id
                                                        }
                                                    >

                                                        {
                                                            assignment.subject_code
                                                        }

                                                        {" - "}

                                                        {
                                                            assignment.subject_name
                                                        }

                                                        {" | "}

                                                        {
                                                            assignment.program_code
                                                        }

                                                        {" - Section "}

                                                        {
                                                            assignment.section_name
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div>

                                        <label>
                                            Date
                                        </label>

                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) =>
                                                setDate(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <div>

                                        <label>
                                            Period
                                        </label>

                                        <select
                                            value={period}
                                            onChange={(e) =>
                                                setPeriod(
                                                    e.target.value
                                                )
                                            }
                                        >

                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                                (item) => (

                                                    <option
                                                        key={item}
                                                        value={item}
                                                    >
                                                        Period {item}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>

                                </div>


                                {selectedInfo && (

                                    <div className="selected-class-info">

                                        <strong>
                                            {
                                                selectedInfo.subject_code
                                            }
                                            {" - "}
                                            {
                                                selectedInfo.subject_name
                                            }
                                        </strong>

                                        <span>
                                            {
                                                selectedInfo.program_code
                                            }
                                            {" | Section "}
                                            {
                                                selectedInfo.section_name
                                            }
                                            {" | "}
                                            {
                                                selectedInfo.semester
                                            }
                                            {" | "}
                                            {
                                                selectedInfo.academic_year
                                            }
                                        </span>

                                    </div>

                                )}

                            </div>


                            {/* STUDENT ATTENDANCE */}

                            <div className="attendance-table-card">

                                <div className="attendance-table-header">

                                    <div>

                                        <h2>
                                            Student Attendance
                                        </h2>

                                        <p>
                                            Mark attendance for the
                                            selected class and period
                                        </p>

                                    </div>


                                    <input
                                        type="text"
                                        placeholder="Search student..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                        className="student-search"
                                    />

                                </div>


                                {loadingStudents ? (

                                    <div className="attendance-loading">
                                        Loading students...
                                    </div>

                                ) : students.length === 0 ? (

                                    <div className="attendance-empty">

                                        {selectedAssignment
                                            ? "No students found for this class."
                                            : "Select a subject/class to load students."}

                                    </div>

                                ) : (

                                    <div className="attendance-table-wrapper">

                                        <table className="attendance-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        #
                                                    </th>

                                                    <th>
                                                        Roll Number
                                                    </th>

                                                    <th>
                                                        Student Name
                                                    </th>

                                                    <th>
                                                        Attendance
                                                    </th>

                                                    <th>
                                                        Absence Reason
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {filteredStudents.length === 0 ? (

                                                    <tr>

                                                        <td
                                                            colSpan="5"
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                                padding:
                                                                    "30px"
                                                            }}
                                                        >
                                                            No matching
                                                            students found.
                                                        </td>

                                                    </tr>

                                                ) : (

                                                    filteredStudents.map(
                                                        (
                                                            student,
                                                            index
                                                        ) => (

                                                            <tr
                                                                key={
                                                                    student.student_id
                                                                }
                                                            >

                                                                <td>
                                                                    {index + 1}
                                                                </td>


                                                                <td>

                                                                    <strong>
                                                                        {
                                                                            student.roll_number
                                                                        }
                                                                    </strong>

                                                                </td>


                                                                <td>
                                                                    {
                                                                        student.student_name
                                                                    }
                                                                </td>


                                                                <td>

                                                                    <div className="attendance-buttons">

                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                student.status ===
                                                                                "PRESENT"
                                                                                    ? "status-btn present active"
                                                                                    : "status-btn present"
                                                                            }
                                                                            onClick={() =>
                                                                                updateStatus(
                                                                                    student.student_id,
                                                                                    "PRESENT"
                                                                                )
                                                                            }
                                                                        >
                                                                            Present
                                                                        </button>


                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                student.status ===
                                                                                "ABSENT"
                                                                                    ? "status-btn absent active"
                                                                                    : "status-btn absent"
                                                                            }
                                                                            onClick={() =>
                                                                                updateStatus(
                                                                                    student.student_id,
                                                                                    "ABSENT"
                                                                                )
                                                                            }
                                                                        >
                                                                            Absent
                                                                        </button>


                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                student.status ===
                                                                                "LATE"
                                                                                    ? "status-btn late active"
                                                                                    : "status-btn late"
                                                                            }
                                                                            onClick={() =>
                                                                                updateStatus(
                                                                                    student.student_id,
                                                                                    "LATE"
                                                                                )
                                                                            }
                                                                        >
                                                                            Late
                                                                        </button>

                                                                    </div>

                                                                </td>


                                                                <td>

                                                                    {student.status ===
                                                                    "ABSENT" ? (

                                                                        <input
                                                                            type="text"
                                                                            placeholder="Enter absence reason"
                                                                            value={
                                                                                student.absence_reason ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateReason(
                                                                                    student.student_id,
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            className="absence-reason-input"
                                                                        />

                                                                    ) : (

                                                                        <span className="not-applicable">
                                                                            —
                                                                        </span>

                                                                    )}

                                                                </td>

                                                            </tr>

                                                        )
                                                    )

                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}


                                {/* SAVE */}

                                {students.length > 0 && (

                                    <div className="attendance-save-area">

                                        <button
                                            type="button"
                                            className="save-attendance-btn"
                                            onClick={
                                                saveAttendance
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

                                            {saving
                                                ? "Saving..."
                                                : "Save Attendance"}

                                        </button>

                                    </div>

                                )}

                            </div>

                        </>

                    )}

                </main>

            </div>

        </div>
    );
}

export default FacultyDashboard;