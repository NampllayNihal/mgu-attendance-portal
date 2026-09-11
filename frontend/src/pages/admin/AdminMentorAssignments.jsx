import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminMentorAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [sections, setSections] = useState([]);
    const [faculty, setFaculty] = useState([]);

    const [section, setSection] = useState("");
    const [mentor, setMentor] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);

            const [assignmentRes, sectionRes, facultyRes] =
                await Promise.all([
                    api.get("/mentoring/admin/assignments/"),
                    api.get("/academics/admin/sections/"),
                    api.get("/academics/admin/faculty/"),
                ]);

            setAssignments(assignmentRes.data);
            setSections(sectionRes.data);
            setFaculty(facultyRes.data);
} catch (error) {
    console.error("MENTOR ERROR:", error);

    alert(
        "STATUS: " +
        (error.response?.status || "Unknown") +
        "\n\n" +
        "ERROR: " +
        JSON.stringify(
            error.response?.data || error.message,
            null,
            2
        )
    );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const assignMentor = async (e) => {
        e.preventDefault();

        if (!section || !mentor) {
            alert("Please select both class and faculty.");
            return;
        }

        try {
            setSaving(true);

            await api.post(
                "/mentoring/admin/assignments/",
                {
                    section: Number(section),
                    mentor: Number(mentor),
                }
            );

            alert("Mentor assigned successfully.");

            setSection("");
            setMentor("");

            loadData();

       } catch (error) {
    console.error("MENTOR ASSIGNMENT ERROR:", error);

    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("URL:", error.config?.url);

    alert(
        "Error " +
        (error.response?.status || "") +
        ": " +
        JSON.stringify(error.response?.data || error.message)
    );

        } finally {
            setSaving(false);
        }
    };

    const removeAssignment = async (id) => {

        if (!window.confirm(
            "Are you sure you want to remove this mentor assignment?"
        )) {
            return;
        }

        try {
            await api.delete(
                `/mentoring/admin/assignments/${id}/`
            );

            alert("Mentor assignment removed.");

            loadData();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Failed to remove assignment."
            );
        }
    };

    return (
        <div className="admin-management">

            <div className="management-header">
                <div>
                    <h2>Mentor Assignments</h2>
                    <p>
                        Assign faculty members as class mentors
                    </p>
                </div>
            </div>

            {/* ASSIGN FORM */}

            <form
                className="management-form"
                onSubmit={assignMentor}
            >

                <div className="form-group">
                    <label>Select Class / Section</label>

                    <select
                        value={section}
                        onChange={(e) =>
                            setSection(e.target.value)
                        }
                    >
                        <option value="">
                            Select Class / Section
                        </option>

                        {sections.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.program_code || item.program?.code}
                                {" - "}
                                Section {item.name}
                                {" | "}
                                {item.academic_year_name ||
                                    item.academic_year?.year}
                                {" | "}
                                {item.semester_name ||
                                    item.semester?.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Select Faculty Mentor</label>

                    <select
                        value={mentor}
                        onChange={(e) =>
                            setMentor(e.target.value)
                        }
                    >
                        <option value="">
                            Select Faculty
                        </option>

                        {faculty.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.faculty_id}
                                {" - "}
                                {item.name ||
                                    item.full_name ||
                                    item.username}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="primary-btn"
                    disabled={saving}
                >
                    {saving
                        ? "Assigning..."
                        : "Assign Mentor"}
                </button>

            </form>


            {/* ASSIGNMENTS TABLE */}

            <div className="management-table-wrapper">

                {loading ? (
                    <p className="loading-text">
                        Loading mentor assignments...
                    </p>
                ) : assignments.length === 0 ? (
                    <div className="empty-state">
                        <h3>No Mentor Assignments</h3>

                        <p>
                            No class mentors have been assigned yet.
                        </p>
                    </div>
                ) : (
                    <table className="management-table">

                        <thead>
                            <tr>
                                <th>Class</th>
                                <th>Program</th>
                                <th>Academic Year</th>
                                <th>Semester</th>
                                <th>Faculty ID</th>
                                <th>Mentor</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {assignments.map((item) => (
                                <tr key={item.id}>

                                    <td>
                                        <strong>
                                            Section {item.section_name}
                                        </strong>
                                    </td>

                                    <td>
                                        {item.program_code}
                                        {" - "}
                                        {item.program_name}
                                    </td>

                                    <td>
                                        {item.academic_year}
                                    </td>

                                    <td>
                                        {item.semester}
                                    </td>

                                    <td>
                                        {item.mentor_faculty_id}
                                    </td>

                                    <td>
                                        {item.mentor_name}
                                    </td>

                                    <td>
                                        <button
                                            className="danger-btn"
                                            onClick={() =>
                                                removeAssignment(
                                                    item.id
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>
                )}

            </div>

        </div>
    );
}

export default AdminMentorAssignments;