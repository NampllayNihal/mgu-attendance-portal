import { useEffect, useState } from "react";
import api from "../../services/api";
import "./StudentDashboard.css";


function StudentDashboard() {

    const [student, setStudent] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [subjectSummary, setSubjectSummary] = useState([]);
    const [dailyAttendance, setDailyAttendance] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showProfile, setShowProfile] = useState(false);
    const [search, setSearch] = useState("");


    // =========================================
    // LOGOUT
    // =========================================

    const logout = () => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.removeItem("login_role");

        window.location.href = "/";
    };


    // =========================================
    // LOAD DASHBOARD
    // =========================================

    const loadDashboard = async () => {

        try {

            setLoading(true);

            const [
                dashboardResponse,
                attendanceResponse,
                summaryResponse
            ] = await Promise.all([

                api.get("/students/dashboard/"),

                api.get("/students/attendance/"),

                api.get("/students/attendance/summary/")

            ]);


            setStudent(
                dashboardResponse.data.student
            );


            setAttendance(
                dashboardResponse.data.attendance
            );


            setSubjectSummary(
                summaryResponse.data || []
            );


            setDailyAttendance(
                attendanceResponse.data || []
            );


        } catch (error) {

            console.error(
                "Student dashboard error:",
                error
            );


            if (error.response?.status === 401) {

                logout();

                return;
            }


            alert(
                error.response?.data?.detail ||
                "Failed to load student dashboard."
            );


        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadDashboard();

    }, []);


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }


        const parts = date.split("-");


        if (parts.length !== 3) {
            return date;
        }


        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };


    // =========================================
    // STATUS
    // =========================================

    const getShortStatus = (status) => {

        if (status === "PRESENT") {
            return "P";
        }

        if (status === "ABSENT") {
            return "A";
        }

        if (status === "LATE") {
            return "L";
        }

        return "-";
    };


    // =========================================
    // DAILY ATTENDANCE
    //
    // Converts:
    //
    // Date + Period + Status
    //
    // into:
    //
    // Date | 1 | 2 | 3 | 4 | 5 | 6 | Total | Attend
    // =========================================

    const dailyRows = [];


    const groupedByDate = {};


    dailyAttendance.forEach((record) => {

        if (!groupedByDate[record.date]) {

            groupedByDate[record.date] = [];

        }


        groupedByDate[record.date].push(record);

    });


    Object.keys(groupedByDate)
        .sort()
        .reverse()
        .forEach((date) => {

            const records =
                groupedByDate[date];


            const periods = {

                1: null,
                2: null,
                3: null,
                4: null,
                5: null,
                6: null,
                7: null,
                8: null

            };


            records.forEach((record) => {

                periods[record.period] = record;

            });


            const total =
                records.length;


            const attended =
                records.filter(
                    (record) =>
                        record.status === "PRESENT" ||
                        record.status === "LATE"
                ).length;


            dailyRows.push({

                date,

                periods,

                total,

                attended

            });

        });


    // =========================================
    // SEARCH
    // =========================================

    const filteredDailyRows =
        dailyRows.filter((row) => {

            const recordText =
                Object.values(row.periods)
                    .filter(Boolean)
                    .map(
                        (record) =>
                            `${record.subject_code}
                             ${record.subject_name}
                             ${record.status}
                             ${record.absence_reason || ""}`
                    )
                    .join(" ");


            const text = `
                ${row.date}
                ${formatDate(row.date)}
                ${recordText}
            `.toLowerCase();


            return text.includes(
                search.toLowerCase()
            );

        });


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <div className="student-loading-page">

                <div className="student-loader"></div>

                <h3>
                    Loading Student Dashboard...
                </h3>

            </div>

        );
    }


    // =========================================
    // PAGE
    // =========================================

    return (

        <div className="student-page">


            {/* =================================
                TOP BAR
            ================================= */}

            <header className="student-topbar">


                <div className="student-brand">

                    <div className="student-logo">
                        MGU
                    </div>

                    <div>

                        <strong>
                            MGU
                        </strong>

                        <span>
                            Attendance Portal
                        </span>

                    </div>

                </div>


                {/* PROFILE */}

                <div className="student-top-profile">

                    <button
                        type="button"
                        className="student-profile-btn"
                        onClick={() =>
                            setShowProfile(
                                !showProfile
                            )
                        }
                    >

                        <div className="student-avatar">

                            {student?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}

                        </div>


                        <div className="student-profile-name">

                            <strong>
                                {student?.name ||
                                    "Student"}
                            </strong>

                            <span>
                                {student?.roll_number ||
                                    ""}
                            </span>

                        </div>


                        <span className="student-arrow">

                            {showProfile
                                ? "▲"
                                : "▼"}

                        </span>

                    </button>


                    {showProfile && (

                        <div className="student-profile-dropdown">


                            <div className="student-dropdown-header">

                                <div className="student-large-avatar">

                                    {student?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "S"}

                                </div>


                                <div>

                                    <h3>
                                        {student?.name ||
                                            "Student"}
                                    </h3>

                                    <p>
                                        {student?.roll_number}
                                    </p>

                                </div>

                            </div>


                            <div className="student-dropdown-details">

                                <div>

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {student?.email ||
                                            "-"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Program
                                    </span>

                                    <strong>
                                        {student?.program_code ||
                                            "-"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Section
                                    </span>

                                    <strong>
                                        {student?.section ||
                                            "-"}
                                    </strong>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="student-logout-btn"
                                onClick={logout}
                            >
                                🚪 Logout
                            </button>


                        </div>

                    )}

                </div>

            </header>



            {/* =================================
                MAIN LAYOUT
            ================================= */}

            <div className="student-layout">


                {/* SIDEBAR */}

                <aside className="student-sidebar">


                    <div className="student-sidebar-title">
                        Student Portal
                    </div>


                    <button
                        type="button"
                        className="student-nav-btn active"
                    >
                        📊 Dashboard
                    </button>


                    <button
                        type="button"
                        className="student-nav-btn"
                        onClick={loadDashboard}
                    >
                        🔄 Refresh
                    </button>


                    <button
                        type="button"
                        className="student-nav-btn student-sidebar-logout"
                        onClick={logout}
                    >
                        🚪 Logout
                    </button>


                </aside>



                {/* =================================
                    MAIN CONTENT
                ================================= */}

                <main className="student-main">


                    {/* PAGE HEADER */}

                    <div className="student-page-header">

                        <div>

                            <h1>
                                Student Dashboard
                            </h1>

                            <p>
                                View your attendance and academic details
                            </p>

                        </div>


                        <button
                            type="button"
                            className="student-refresh-btn"
                            onClick={loadDashboard}
                        >
                            🔄 Refresh
                        </button>

                    </div>



                    {/* =================================
                        STUDENT DETAILS
                    ================================= */}

                    <section className="student-details-card">


                        <div className="student-details-title">
                            Student Details
                        </div>


                        <div className="student-details-content">


                            <div className="student-detail-item">

                                <span>
                                    Roll No.
                                </span>

                                <strong>
                                    {student?.roll_number ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Student Name
                                </span>

                                <strong>
                                    {student?.name ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Admission No.
                                </span>

                                <strong>
                                    {student?.admission_number ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Department
                                </span>

                                <strong>
                                    {student?.department ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Program
                                </span>

                                <strong>
                                    {student?.program ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Section
                                </span>

                                <strong>
                                    {student?.section ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Semester
                                </span>

                                <strong>
                                    {student?.semester ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Academic Year
                                </span>

                                <strong>
                                    {student?.academic_year ||
                                        "-"}
                                </strong>

                            </div>


                        </div>

                    </section>



                    {/* =================================
                        ATTENDANCE SUMMARY
                    ================================= */}

                    <section className="student-stat-grid">


                        <div className="student-stat-card overall">

                            <div className="student-stat-icon">
                                %
                            </div>

                            <div>

                                <span>
                                    Overall Attendance
                                </span>

                                <strong>
                                    {attendance?.attendance_percentage ??
                                        0}%
                                </strong>

                            </div>

                        </div>


                        <div className="student-stat-card present">

                            <div className="student-stat-icon">
                                ✓
                            </div>

                            <div>

                                <span>
                                    Present
                                </span>

                                <strong>
                                    {attendance?.present ??
                                        0}
                                </strong>

                            </div>

                        </div>


                        <div className="student-stat-card absent">

                            <div className="student-stat-icon">
                                !
                            </div>

                            <div>

                                <span>
                                    Absent
                                </span>

                                <strong>
                                    {attendance?.absent ??
                                        0}
                                </strong>

                            </div>

                        </div>


                        <div className="student-stat-card late">

                            <div className="student-stat-icon">
                                L
                            </div>

                            <div>

                                <span>
                                    Late
                                </span>

                                <strong>
                                    {attendance?.late ??
                                        0}
                                </strong>

                            </div>

                        </div>


                    </section>



                    {/* =================================
                        SUBJECT-WISE ATTENDANCE
                    ================================= */}

                    <section className="student-card">


                        <div className="student-card-header">

                            <div>

                                <h2>
                                    Subject-wise Attendance
                                </h2>

                                <p>
                                    Attendance details for each subject
                                </p>

                            </div>

                        </div>


                        {subjectSummary.length === 0 ? (

                            <div className="student-empty">

                                No attendance data available.

                            </div>

                        ) : (

                            <div className="student-table-scroll">


                                <table className="student-attendance-table">


                                    <thead>

                                        <tr>

                                            <th>
                                                Subject
                                            </th>

                                            <th>
                                                Classes
                                            </th>

                                            <th>
                                                Attended
                                            </th>

                                            <th>
                                                Absent
                                            </th>

                                            <th>
                                                %
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>


                                        {subjectSummary.map(
                                            (subject) => (

                                                <tr
                                                    key={
                                                        subject.subject_code
                                                    }
                                                >


                                                    <td>

                                                        <strong>
                                                            {
                                                                subject.subject_code
                                                            }
                                                        </strong>

                                                        <span className="student-subject-name">
                                                            {
                                                                subject.subject_name
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        {
                                                            subject.total_periods
                                                        }

                                                    </td>


                                                    <td className="student-present-number">

                                                        {
                                                            subject.present +
                                                            subject.late
                                                        }

                                                    </td>


                                                    <td className="student-absent-number">

                                                        {
                                                            subject.absent
                                                        }

                                                    </td>


                                                    <td>


                                                        <div className="student-percent-box">

                                                            <div className="student-percent-value">

                                                                {
                                                                    subject.attendance_percentage
                                                                }%

                                                            </div>


                                                            <div className="student-progress">

                                                                <div
                                                                    className="student-progress-bar"
                                                                    style={{
                                                                        width:
                                                                            `${Math.min(
                                                                                subject.attendance_percentage,
                                                                                100
                                                                            )}%`
                                                                    }}
                                                                ></div>

                                                            </div>

                                                        </div>


                                                    </td>


                                                </tr>

                                            )
                                        )}


                                    </tbody>


                                    {/* TOTAL */}

                                    <tfoot>

                                        <tr>

                                            <td>
                                                <strong>
                                                    Total
                                                </strong>
                                            </td>

                                            <td>
                                                {attendance?.total_periods ??
                                                    0}
                                            </td>

                                            <td className="student-present-number">
                                                {(attendance?.present ??
                                                    0) +
                                                    (attendance?.late ??
                                                        0)}
                                            </td>

                                            <td className="student-absent-number">
                                                {attendance?.absent ??
                                                    0}
                                            </td>

                                            <td>
                                                <strong>
                                                    {attendance?.attendance_percentage ??
                                                        0}
                                                </strong>
                                            </td>

                                        </tr>

                                    </tfoot>


                                </table>


                            </div>

                        )}

                    </section>



                    {/* =================================
                        DAILY ATTENDANCE
                    ================================= */}

                    <section className="student-card">


                        <div className="student-card-header">


                            <div>

                                <h2>
                                    Daily Attendance
                                </h2>

                                <p>
                                    Period-wise attendance record
                                </p>

                            </div>


                            <input
                                type="text"
                                className="student-search"
                                placeholder="Search date or subject..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />


                        </div>



                        {filteredDailyRows.length === 0 ? (

                            <div className="student-empty">

                                <div className="student-empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    No Attendance Records
                                </h3>

                                <p>
                                    No daily attendance records are available.
                                </p>

                            </div>

                        ) : (


                            <div className="student-table-scroll daily-scroll">


                                <table className="student-daily-table">


                                    <thead>

                                        <tr>

                                            <th>
                                                Date
                                            </th>

                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                                (period) => (

                                                    <th key={period}>
                                                        {period}
                                                    </th>

                                                )
                                            )}

                                            <th>
                                                Total
                                            </th>

                                            <th>
                                                Attend
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>


                                        {filteredDailyRows.map(
                                            (row) => (

                                                <tr
                                                    key={row.date}
                                                >


                                                    <td className="student-date-cell">

                                                        <strong>
                                                            {
                                                                formatDate(
                                                                    row.date
                                                                )
                                                            }
                                                        </strong>

                                                    </td>


                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                                        (period) => {

                                                            const record =
                                                                row.periods[
                                                                    period
                                                                ];


                                                            return (

                                                                <td
                                                                    key={
                                                                        period
                                                                    }
                                                                    className={
                                                                        record
                                                                            ? record.status === "PRESENT"
                                                                                ? "daily-present"
                                                                                : record.status === "ABSENT"
                                                                                    ? "daily-absent"
                                                                                    : "daily-late"
                                                                            : "daily-empty"
                                                                    }
                                                                    title={
                                                                        record
                                                                            ? `${record.subject_code} - ${record.subject_name}`
                                                                            : "No attendance"
                                                                    }
                                                                >

                                                                    {record
                                                                        ? getShortStatus(
                                                                            record.status
                                                                        )
                                                                        : "-"
                                                                    }

                                                                </td>

                                                            );

                                                        }
                                                    )}


                                                    <td className="daily-total">

                                                        {row.total}

                                                    </td>


                                                    <td className="daily-attended">

                                                        {row.attended}

                                                    </td>


                                                </tr>

                                            )
                                        )}


                                    </tbody>


                                </table>


                            </div>

                        )}


                        <div className="daily-legend">

                            <span>
                                <b className="legend-p">
                                    P
                                </b>
                                Present
                            </span>


                            <span>
                                <b className="legend-a">
                                    A
                                </b>
                                Absent
                            </span>


                            <span>
                                <b className="legend-l">
                                    L
                                </b>
                                Late
                            </span>

                        </div>


                    </section>



                    {/* =================================
                        ABSENCE HISTORY
                    ================================= */}

                    <section className="student-card">


                        <div className="student-card-header">

                            <div>

                                <h2>
                                    Absence History
                                </h2>

                                <p>
                                    Absence reasons provided by your class mentor
                                </p>

                            </div>

                        </div>



                        {dailyAttendance.filter(
                            (item) =>
                                item.status === "ABSENT"
                        ).length === 0 ? (


                            <div className="student-empty">

                                <div className="student-empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    No Absence Records
                                </h3>

                                <p>
                                    You have no recorded absences.
                                </p>

                            </div>


                        ) : (


                            <div className="student-absence-list">


                                {dailyAttendance
                                    .filter(
                                        (item) =>
                                            item.status === "ABSENT"
                                    )
                                    .map((item) => (


                                        <div
                                            className="student-absence-item"
                                            key={item.id}
                                        >


                                            <div className="student-absence-date">

                                                <strong>
                                                    {formatDate(
                                                        item.date
                                                    )}
                                                </strong>

                                                <span>
                                                    Period {item.period}
                                                </span>

                                            </div>


                                            <div className="student-absence-subject">

                                                <strong>
                                                    {item.subject_code}
                                                </strong>

                                                <span>
                                                    {item.subject_name}
                                                </span>

                                            </div>


                                            <div className="student-absence-reason">

                                                <span>
                                                    Absence Reason
                                                </span>

                                                <strong>

                                                    {item.absence_reason ||
                                                        "Reason not added yet"}

                                                </strong>

                                            </div>


                                        </div>

                                    ))}


                            </div>

                        )}


                    </section>


                </main>

            </div>

        </div>
    );
}


export default StudentDashboard;