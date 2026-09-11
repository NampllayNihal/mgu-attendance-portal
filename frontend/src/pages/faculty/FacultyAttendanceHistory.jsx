import { useEffect, useState } from "react";
import api from "../../services/api";

function FacultyAttendanceHistory() {

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const loadHistory = async () => {

        try {
            setLoading(true);

            const response = await api.get(
                "/attendance/faculty/history/"
            );

            setSessions(response.data);

        } catch (error) {

            console.error(
                "Attendance history error:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to load attendance history."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const filteredSessions = sessions.filter(
        (session) => {

            const text =
                `${session.subject_code}
                ${session.subject_name}
                ${session.program_code}
                ${session.section_name}
                ${session.date}`
                    .toLowerCase();

            return text.includes(
                search.toLowerCase()
            );
        }
    );

    return (
        <div className="faculty-history-page">

            <div className="history-page-header">

                <div>
                    <h1>
                        Attendance History
                    </h1>

                    <p>
                        View attendance sessions previously
                        marked by you
                    </p>
                </div>

                <input
                    type="text"
                    placeholder="Search subject, class or date..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="history-search"
                />

            </div>


            {loading ? (

                <div className="history-loading">
                    Loading attendance history...
                </div>

            ) : filteredSessions.length === 0 ? (

                <div className="history-empty">

                    <h3>
                        No Attendance Records
                    </h3>

                    <p>
                        You have not marked any attendance
                        yet.
                    </p>

                </div>

            ) : (

                <div className="history-table-card">

                    <div className="history-table-wrapper">

                        <table className="history-table">

                            <thead>

                                <tr>
                                    <th>Date</th>
                                    <th>Period</th>
                                    <th>Subject</th>
                                    <th>Class</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Late</th>
                                    <th>Total</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredSessions.map(
                                    (session) => (

                                        <tr
                                            key={session.id}
                                        >

                                            <td>
                                                {session.date}
                                            </td>

                                            <td>
                                                Period{" "}
                                                {session.period}
                                            </td>

                                            <td>

                                                <strong>
                                                    {
                                                        session.subject_code
                                                    }
                                                </strong>

                                                <span className="history-subject-name">
                                                    {
                                                        session.subject_name
                                                    }
                                                </span>

                                            </td>

                                            <td>
                                                {
                                                    session.program_code
                                                }
                                                {" - Section "}
                                                {
                                                    session.section_name
                                                }
                                            </td>

                                            <td>

                                                <span className="history-count present-count">
                                                    {
                                                        session.present_count
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                <span className="history-count absent-count">
                                                    {
                                                        session.absent_count
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                <span className="history-count late-count">
                                                    {
                                                        session.late_count
                                                    }
                                                </span>

                                            </td>

                                            <td>
                                                {
                                                    session.total_students
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}

export default FacultyAttendanceHistory;