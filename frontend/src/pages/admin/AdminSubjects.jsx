import { useEffect, useState } from "react";

import {
    BookOpen,
    Plus,
    Search,
    X,
    Save,
    UserCheck,
    Trash2
} from "lucide-react";

import api from "../../services/api";


function AdminSubjects() {

    const [subjects, setSubjects] = useState([]);
    const [sections, setSections] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [activeTab, setActiveTab] =
        useState("Subjects");

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);


    const emptyForm = {
        section: "",
        name: "",
        code: "",
        credits: "",
        total_periods: "",

        faculty: "",
        subject: ""
    };


    const [form, setForm] =
        useState(emptyForm);


    // =====================================================
    // LOAD ALL DATA
    // =====================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                subjectResponse,
                sectionResponse,
                facultyResponse,
                assignmentResponse
            ] = await Promise.all([

                api.get(
                    "/academics/admin/subjects/"
                ),

                api.get(
                    "/academics/admin/sections/"
                ),

                api.get(
                    "/academics/admin/faculty/"
                ),

                api.get(
                    "/academics/admin/teaching-assignments/"
                )

            ]);


            setSubjects(
                subjectResponse.data
            );

            setSections(
                sectionResponse.data
            );

            setFaculty(
                facultyResponse.data
            );

            setAssignments(
                assignmentResponse.data
            );


        } catch (err) {

            console.error(
                "Subject data error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load subject information."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadData();

    }, []);


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setForm(
            previous => ({
                ...previous,
                [name]: value
            })
        );
    };


    // =====================================================
    // OPEN FORM
    // =====================================================

    const openForm = () => {

        setError("");

        setForm(emptyForm);

        setShowForm(true);
    };


    // =====================================================
    // CLOSE FORM
    // =====================================================

    const closeForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);

        setForm(emptyForm);
    };


    // =====================================================
    // CREATE
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setSaving(true);
        setError("");


        try {

            let url;
            let data;


            if (
                activeTab ===
                "Subjects"
            ) {

                url =
                    "/academics/admin/subjects/";

                data = {

                    section:
                        Number(form.section),

                    name:
                        form.name.trim(),

                    code:
                        form.code.trim().toUpperCase(),

                    credits:
                        Number(form.credits),

                    total_periods:
                        Number(form.total_periods)

                };

            } else {

                url =
                    "/academics/admin/teaching-assignments/";

                data = {

                    faculty:
                        Number(form.faculty),

                    subject:
                        Number(form.subject),

                    is_active:
                        true

                };

            }


            await api.post(
                url,
                data
            );


            alert(
                activeTab === "Subjects"
                    ? "Subject created successfully."
                    : "Faculty assigned successfully."
            );


            setShowForm(false);

            setForm(emptyForm);

            await loadData();


        } catch (err) {

            console.error(
                "Save error:",
                err
            );


            const data =
                err.response?.data;


            if (
                data &&
                typeof data === "object"
            ) {

                const messages =
                    Object.entries(data)
                        .map(
                            ([field, message]) => {

                                const text =
                                    Array.isArray(
                                        message
                                    )
                                        ? message.join(
                                              ", "
                                          )
                                        : String(
                                              message
                                          );

                                return `${field}: ${text}`;
                            }
                        );


                setError(
                    messages.join(" | ")
                );

            } else {

                setError(
                    "Unable to save information."
                );
            }

        } finally {

            setSaving(false);

        }
    };


    // =====================================================
    // DELETE ASSIGNMENT
    // =====================================================

    const removeAssignment = async (
        assignment
    ) => {

        const confirmed =
            window.confirm(
                `Remove ${assignment.faculty_name} from ${assignment.subject_code}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `/academics/admin/teaching-assignments/${assignment.id}/`
            );

            await loadData();

        } catch (err) {

            console.error(err);

            alert(
                "Unable to remove assignment."
            );
        }
    };


    // =====================================================
    // TAB
    // =====================================================

    const changeTab = (tab) => {

        setActiveTab(tab);

        setSearch("");

        setError("");

        setShowForm(false);

        setForm(emptyForm);
    };


    // =====================================================
    // FILTER
    // =====================================================

    const filteredSubjects =
        subjects.filter(
            subject => {

                const text =
                    `${subject.name} ${
                        subject.code
                    } ${
                        subject.program_code
                    } ${
                        subject.section_name
                    }`.toLowerCase();


                return text.includes(
                    search.toLowerCase()
                );
            }
        );


    const filteredAssignments =
        assignments.filter(
            assignment => {

                const text =
                    `${assignment.faculty_name} ${
                        assignment.faculty_id
                    } ${
                        assignment.subject_name
                    } ${
                        assignment.subject_code
                    } ${
                        assignment.program_code
                    } ${
                        assignment.section_name
                    }`.toLowerCase();


                return text.includes(
                    search.toLowerCase()
                );
            }
        );


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="admin-subjects-page">


            {/* HEADER */}

            <div className="subjects-page-header">

                <div>

                    <h2>
                        Manage Subjects
                    </h2>

                    <p>
                        Manage subjects and faculty assignments
                    </p>

                </div>


                <button
                    className="subjects-add-button"
                    onClick={openForm}
                >

                    <Plus size={18} />

                    {activeTab === "Subjects"
                        ? "Add Subject"
                        : "Assign Faculty"}

                </button>

            </div>


            {/* ERROR */}

            {error && (

                <div className="subjects-error">
                    {error}
                </div>

            )}


            {/* TABS */}

            <div className="subjects-tabs">

                <button
                    className={
                        activeTab === "Subjects"
                            ? "subjects-tab subjects-tab-active"
                            : "subjects-tab"
                    }
                    onClick={() =>
                        changeTab("Subjects")
                    }
                >

                    <BookOpen size={17} />

                    Subjects

                </button>


                <button
                    className={
                        activeTab === "Assignments"
                            ? "subjects-tab subjects-tab-active"
                            : "subjects-tab"
                    }
                    onClick={() =>
                        changeTab("Assignments")
                    }
                >

                    <UserCheck size={17} />

                    Faculty Assignments

                </button>

            </div>


            {/* TOOLBAR */}

            <div className="subjects-toolbar">

                <div className="subjects-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder={
                            activeTab === "Subjects"
                                ? "Search subjects..."
                                : "Search assignments..."
                        }
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="subjects-count">

                    {activeTab === "Subjects"
                        ? `${filteredSubjects.length} Subjects`
                        : `${filteredAssignments.length} Assignments`}

                </div>

            </div>


            {/* TABLE */}

            <div className="subjects-table-card">

                {loading ? (

                    <div className="subjects-loading">
                        Loading...
                    </div>

                ) : activeTab === "Subjects" ? (

                    filteredSubjects.length === 0 ? (

                        <div className="subjects-empty">

                            <BookOpen size={42} />

                            <h3>
                                No subjects found
                            </h3>

                            <p>
                                Add a subject to get started.
                            </p>

                        </div>

                    ) : (

                        <div className="subjects-table-wrapper">

                            <table className="subjects-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Code
                                        </th>

                                        <th>
                                            Subject
                                        </th>

                                        <th>
                                            Class
                                        </th>

                                        <th>
                                            Credits
                                        </th>

                                        <th>
                                            Periods
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredSubjects.map(
                                        subject => (

                                            <tr
                                                key={
                                                    subject.id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            subject.code
                                                        }
                                                    </strong>

                                                </td>


                                                <td>
                                                    {
                                                        subject.name
                                                    }
                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            subject.program_code
                                                        }
                                                    </strong>

                                                    <span className="subject-subtext">
                                                        Section{" "}
                                                        {
                                                            subject.section_name
                                                        }
                                                        {" | "}
                                                        {
                                                            subject.academic_year
                                                        }
                                                    </span>

                                                </td>


                                                <td>
                                                    {
                                                        subject.credits
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        subject.total_periods
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )

                ) : (

                    filteredAssignments.length === 0 ? (

                        <div className="subjects-empty">

                            <UserCheck size={42} />

                            <h3>
                                No faculty assignments
                            </h3>

                            <p>
                                Assign a faculty member to a subject.
                            </p>

                        </div>

                    ) : (

                        <div className="subjects-table-wrapper">

                            <table className="subjects-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Faculty
                                        </th>

                                        <th>
                                            Faculty ID
                                        </th>

                                        <th>
                                            Subject
                                        </th>

                                        <th>
                                            Class
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredAssignments.map(
                                        assignment => (

                                            <tr
                                                key={
                                                    assignment.id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            assignment.faculty_name
                                                        }
                                                    </strong>

                                                </td>


                                                <td>
                                                    {
                                                        assignment.faculty_id
                                                    }
                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            assignment.subject_code
                                                        }
                                                    </strong>

                                                    <span className="subject-subtext">
                                                        {
                                                            assignment.subject_name
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        assignment.program_code
                                                    }
                                                    {" - Section "}
                                                    {
                                                        assignment.section_name
                                                    }

                                                </td>


                                                <td>

                                                    <button
                                                        className="assignment-delete-button"
                                                        onClick={() =>
                                                            removeAssignment(
                                                                assignment
                                                            )
                                                        }
                                                        title="Remove assignment"
                                                    >

                                                        <Trash2
                                                            size={17}
                                                        />

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )

                )}

            </div>


            {/* =====================================================
                MODAL
            ===================================================== */}

            {showForm && (

                <div className="subjects-modal-overlay">

                    <div className="subjects-modal">


                        <div className="subjects-modal-header">

                            <div>

                                <h2>

                                    {activeTab === "Subjects"
                                        ? "Add Subject"
                                        : "Assign Faculty"}

                                </h2>

                                <p>

                                    {activeTab === "Subjects"
                                        ? "Create a subject for a class section"
                                        : "Assign a faculty member to a subject"}

                                </p>

                            </div>


                            <button
                                type="button"
                                className="subjects-modal-close"
                                onClick={closeForm}
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <form
                            className="subjects-form"
                            onSubmit={handleSubmit}
                        >


                            {/* =================================================
                                SUBJECT FORM
                            ================================================= */}

                            {activeTab === "Subjects" && (

                                <>

                                    <div className="subjects-form-group">

                                        <label>
                                            Section *
                                        </label>

                                        <select
                                            name="section"
                                            value={
                                                form.section
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select Section
                                            </option>


                                            {sections.map(
                                                section => (

                                                    <option
                                                        key={
                                                            section.id
                                                        }
                                                        value={
                                                            section.id
                                                        }
                                                    >

                                                        {
                                                            section.program_code
                                                        }
                                                        {" - "}
                                                        {
                                                            section.program_name
                                                        }
                                                        {" | "}
                                                        {
                                                            section.academic_year_name
                                                        }
                                                        {" | "}
                                                        {
                                                            section.semester_name
                                                        }
                                                        {" | Section "}
                                                        {
                                                            section.name
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="subjects-form-group">

                                        <label>
                                            Subject Name *
                                        </label>

                                        <input
                                            name="name"
                                            value={
                                                form.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: Machine Learning"
                                            required
                                        />

                                    </div>


                                    <div className="subjects-form-group">

                                        <label>
                                            Subject Code *
                                        </label>

                                        <input
                                            name="code"
                                            value={
                                                form.code
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: AIML501"
                                            required
                                        />

                                    </div>


                                    <div className="subjects-form-row">

                                        <div className="subjects-form-group">

                                            <label>
                                                Credits *
                                            </label>

                                            <input
                                                type="number"
                                                name="credits"
                                                value={
                                                    form.credits
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                min="0"
                                                step="0.5"
                                                required
                                            />

                                        </div>


                                        <div className="subjects-form-group">

                                            <label>
                                                Total Periods *
                                            </label>

                                            <input
                                                type="number"
                                                name="total_periods"
                                                value={
                                                    form.total_periods
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                min="0"
                                                required
                                            />

                                        </div>

                                    </div>

                                </>

                            )}


                            {/* =================================================
                                ASSIGNMENT FORM
                            ================================================= */}

                            {activeTab === "Assignments" && (

                                <>

                                    <div className="subjects-form-group">

                                        <label>
                                            Faculty *
                                        </label>

                                        <select
                                            name="faculty"
                                            value={
                                                form.faculty
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select Faculty
                                            </option>


                                            {faculty.map(
                                                member => (

                                                    <option
                                                        key={
                                                            member.id
                                                        }
                                                        value={
                                                            member.id
                                                        }
                                                    >

                                                        {
                                                            member.faculty_id
                                                        }
                                                        {" - "}
                                                        {
                                                            member.first_name
                                                        }{" "}
                                                        {
                                                            member.last_name
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="subjects-form-group">

                                        <label>
                                            Subject *
                                        </label>

                                        <select
                                            name="subject"
                                            value={
                                                form.subject
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select Subject
                                            </option>


                                            {subjects.map(
                                                subject => (

                                                    <option
                                                        key={
                                                            subject.id
                                                        }
                                                        value={
                                                            subject.id
                                                        }
                                                    >

                                                        {
                                                            subject.code
                                                        }
                                                        {" - "}
                                                        {
                                                            subject.name
                                                        }
                                                        {" | "}
                                                        {
                                                            subject.program_code
                                                        }
                                                        {" - Section "}
                                                        {
                                                            subject.section_name
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>

                                </>

                            )}


                            {/* ACTIONS */}

                            <div className="subjects-form-actions">

                                <button
                                    type="button"
                                    className="subjects-cancel-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="subjects-save-button"
                                    disabled={saving}
                                >

                                    <Save size={17} />

                                    {saving
                                        ? "Saving..."
                                        : activeTab === "Subjects"
                                            ? "Create Subject"
                                            : "Assign Faculty"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}


export default AdminSubjects;